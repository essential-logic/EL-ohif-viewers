import dicomImageLoader from '@cornerstonejs/dicom-image-loader';

import { PubSubService } from '@ohif/core';

export const EVENTS = {
  PROGRESS: 'event:DicomFileUploader:progress',
};

export interface DicomFileUploaderEvent {
  fileId: number;
}

export interface DicomFileUploaderProgressEvent extends DicomFileUploaderEvent {
  percentComplete: number;
}

export enum UploadStatus {
  NotStarted,
  InProgress,
  Success,
  Failed,
  Cancelled,
}

type CancelOrFailed = UploadStatus.Cancelled | UploadStatus.Failed;

export class UploadRejection {
  message: string;
  status: CancelOrFailed;

  constructor(status: CancelOrFailed, message: string) {
    this.message = message;
    this.status = status;
  }
}

export default class DicomFileUploader extends PubSubService {
  private _file;
  private _fileId;
  private _dataSource;
  private _loadPromise;
  private _abortController = new AbortController();
  private _status: UploadStatus = UploadStatus.NotStarted;
  private _percentComplete = 0;
  private _studyInstanceUID: string | null = null;
  /** Retrieves a fresh authorization header at call-time to avoid stale tokens. */
  private _getAuthorizationHeader: (() => Record<string, string>) | null;

  constructor(file, dataSource, getAuthorizationHeader?: () => Record<string, string>) {
    super(EVENTS);
    this._file = file;
    this._fileId = dicomImageLoader.wadouri.fileManager.add(file);
    this._dataSource = dataSource;
    this._getAuthorizationHeader = getAuthorizationHeader ?? null;
  }

  getFileId(): string {
    return this._fileId;
  }

  getFileName(): string {
    return this._file.name;
  }

  getFileSize(): number {
    return this._file.size;
  }

  /**
   * Returns the StudyInstanceUID extracted from the DICOM file after it is
   * loaded. Returns null until load() has been called and the file parsed.
   */
  getStudyInstanceUID(): string | null {
    return this._studyInstanceUID;
  }

  cancel(): void {
    this._abortController.abort();
  }

  getStatus(): UploadStatus {
    return this._status;
  }

  getPercentComplete(): number {
    return this._percentComplete;
  }

  async load(): Promise<void> {
    if (this._loadPromise) {
      // Already started loading, return the load promise.
      return this._loadPromise;
    }

    this._loadPromise = new Promise<void>((resolve, reject) => {
      // The upload listeners: fire progress events and/or settle the promise.
      const uploadCallbacks: Record<string, EventListenerOrEventListenerObject> = {
        progress: (evt: Event) => {
          const progressEvt = evt as ProgressEvent;
          if (!progressEvt.lengthComputable) {
            // Progress computation is not possible.
            return;
          }

          this._status = UploadStatus.InProgress;

          this._percentComplete = Math.round((100 * progressEvt.loaded) / progressEvt.total);
          this._broadcastEvent(EVENTS.PROGRESS, {
            fileId: this._fileId,
            percentComplete: this._percentComplete,
          });
        },
        timeout: () => {
          this._reject(reject, new UploadRejection(UploadStatus.Failed, 'The request timed out.'));
        },
        abort: () => {
          this._reject(reject, new UploadRejection(UploadStatus.Cancelled, 'Cancelled'));
        },
        error: () => {
          this._reject(reject, new UploadRejection(UploadStatus.Failed, 'The request failed.'));
        },
      };

      // First try to load the file.
      dicomImageLoader.wadouri
        .loadFileRequest(this._fileId)
        .then(dicomFile => {
          if (this._abortController.signal.aborted) {
            this._reject(reject, new UploadRejection(UploadStatus.Cancelled, 'Cancelled'));
            return;
          }

          if (!this._checkDicomFile(dicomFile)) {
            // The file is not DICOM
            this._reject(
              reject,
              new UploadRejection(UploadStatus.Failed, 'Not a valid DICOM file.')
            );
            return;
          }

          // ── Extract StudyInstanceUID before upload ──────────────────────────
          // We extract it so the X-Study-Instance-UID header can be sent with
          // the STOW-RS request, enabling the proxy to register the study
          // without having to parse the response body.
          try {
            this._studyInstanceUID = this._extractStudyInstanceUID(dicomFile);
          } catch (e) {
            // Non-fatal — upload can still proceed; proxy falls back to body parsing.
            console.warn('[DicomFileUploader] Could not extract StudyInstanceUID:', e);
          }

          const request = new XMLHttpRequest();
          this._addRequestCallbacks(request, uploadCallbacks);

          // ── Inject fresh auth header directly onto the XHR ─────────────────
          // The DICOMwebClient.storeInstances() method accepts an external XHR
          // object for progress tracking but constructs its own URL/body.
          // We patch request.open() so we can call setRequestHeader() right
          // after open() is invoked (the only point headers can be set).
          if (this._getAuthorizationHeader) {
            const authHeaders = this._getAuthorizationHeader();
            if (authHeaders?.Authorization) {
              const studyUID = this._studyInstanceUID;
              const authValue = authHeaders.Authorization;
              const originalOpen = request.open.bind(request);
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (request as Record<string, unknown>)['open'] = function (
                ...args: Parameters<XMLHttpRequest['open']>
              ) {
                originalOpen(...args);
                try {
                  request.setRequestHeader('Authorization', authValue);
                  if (studyUID) {
                    request.setRequestHeader('X-Study-Instance-UID', studyUID);
                  }
                } catch (err) {
                  console.warn('[DicomFileUploader] Could not set auth header on XHR:', err);
                }
              };
            }
          }

          // Do the actual upload by supplying the DICOM file and upload callbacks/listeners.
          return this._dataSource.store
            .dicom(dicomFile, request)
            .then(() => {
              this._status = UploadStatus.Success;
              resolve();
            })
            .catch(reason => {
              this._reject(reject, reason);
            });
        })
        .catch(reason => {
          this._reject(reject, reason);
        });
    });

    return this._loadPromise;
  }

  private _isRejected(): boolean {
    return this._status === UploadStatus.Failed || this._status === UploadStatus.Cancelled;
  }

  private _reject(reject: (reason?: unknown) => void, reason: unknown) {
    if (this._isRejected()) {
      return;
    }

    if (reason instanceof UploadRejection) {
      this._status = reason.status;
      reject(reason);
      return;
    }

    this._status = UploadStatus.Failed;

    if (reason && typeof reason === 'object' && 'message' in reason) {
      reject(new UploadRejection(UploadStatus.Failed, (reason as { message: string }).message));
      return;
    }

    reject(new UploadRejection(UploadStatus.Failed, String(reason)));
  }

  private _addRequestCallbacks(
    request: XMLHttpRequest,
    uploadCallbacks: Record<string, EventListenerOrEventListenerObject>
  ) {
    const abortCallback = () => request.abort();
    this._abortController.signal.addEventListener('abort', abortCallback);

    for (const [eventName, callback] of Object.entries(uploadCallbacks)) {
      request.upload.addEventListener(eventName, callback);
    }

    const cleanUpCallback = () => {
      this._abortController.signal.removeEventListener('abort', abortCallback);

      for (const [eventName, callback] of Object.entries(uploadCallbacks)) {
        request.upload.removeEventListener(eventName, callback);
      }

      request.removeEventListener('loadend', cleanUpCallback);
    };
    request.addEventListener('loadend', cleanUpCallback);
  }

  /**
   * Validates that an ArrayBuffer contains a valid DICOM Part 10 file by
   * checking for the "DICM" magic bytes at offset 128–131.
   *
   * DICOM PS3.10 §7.1: the preamble is 128 bytes followed by the 4-byte
   * prefix "DICM". A valid file must be at least 132 bytes long.
   *
   * BUG FIX: the original check used `arrayBuffer.length` (always undefined on
   * ArrayBuffer — use `byteLength`) and compared with `<= 132` instead of
   * `< 132`, which incorrectly rejected exactly-132-byte valid files.
   */
  private _checkDicomFile(arrayBuffer: ArrayBuffer) {
    if (arrayBuffer.byteLength < 132) {
      return false;
    }
    const arr = new Uint8Array(arrayBuffer, 128, 4);
    return Array.from('DICM').every((char, i) => char.charCodeAt(0) === arr[i]);
  }

  /**
   * Extracts the StudyInstanceUID (0020,000D) from a raw DICOM Part 10 buffer.
   *
   * Does a linear scan for the tag bytes — lightweight and dependency-free.
   *
   * @returns The StudyInstanceUID string, or null if not found.
   */
  private _extractStudyInstanceUID(arrayBuffer: ArrayBuffer): string | null {
    const view = new DataView(arrayBuffer);
    const bytes = new Uint8Array(arrayBuffer);
    const len = bytes.length;

    // StudyInstanceUID tag bytes in little-endian: group 0x0020, element 0x000D
    // → byte sequence 0x20, 0x00, 0x0D, 0x00
    for (let i = 132; i < len - 12; i++) {
      if (bytes[i] !== 0x20 || bytes[i + 1] !== 0x00) {
        continue;
      }
      if (bytes[i + 2] !== 0x0d || bytes[i + 3] !== 0x00) {
        continue;
      }

      // Matched the tag. Determine VR to find value length + offset.
      // Explicit VR: bytes i+4, i+5 = VR string; i+6,i+7 = uint16 length.
      // Implicit VR: bytes i+4..i+7 = uint32 length (no VR string).
      let valueOffset: number;
      let valueLength: number;

      const vr = String.fromCharCode(bytes[i + 4], bytes[i + 5]);
      if (/^[A-Z]{2}$/.test(vr)) {
        // Explicit VR short form (UI type)
        valueLength = view.getUint16(i + 6, true);
        valueOffset = i + 8;
      } else {
        // Implicit VR — 4-byte length
        valueLength = view.getUint32(i + 4, true);
        valueOffset = i + 8;
      }

      if (valueLength <= 0 || valueOffset + valueLength > len) {
        continue;
      }

      const uid = new TextDecoder('ascii')
        .decode(bytes.slice(valueOffset, valueOffset + valueLength))
        .replace(/\0/g, '') // DICOM strings are null-padded to even length
        .trim();

      if (uid.length > 0) {
        return uid;
      }
    }

    return null;
  }
}
