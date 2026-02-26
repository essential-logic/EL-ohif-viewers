import dcmjs from 'dcmjs';
import dicomImageLoader from '@cornerstonejs/dicom-image-loader';
import { DicomMetadataStore } from '@ohif/core';

export async function loadDICOMFiles(
  files: File[],
  metadataOverride?: {
    patientName?: string;
    studyDescription?: string;
    studyDate?: string;
  }
) {
  const instances = [];

  for (const file of files) {
    try {
      const imageId = dicomImageLoader.wadouri.fileManager.add(file);
      const imageArrayBuffer = await dicomImageLoader.wadouri.loadFileRequest(imageId);

      const dicomData = dcmjs.data.DicomMessage.readFile(imageArrayBuffer);
      const dataset = dcmjs.data.DicomMetaDictionary.naturalizeDataset(dicomData.dict);

      dataset.url = imageId;
      dataset._meta = dcmjs.data.DicomMetaDictionary.namifyDataset(dicomData.meta);
      dataset.AvailableTransferSyntaxUID =
        dataset.AvailableTransferSyntaxUID || dataset._meta.TransferSyntaxUID?.Value?.[0];

      if (metadataOverride) {
        if (metadataOverride.patientName) {
          dataset.PatientName = metadataOverride.patientName;
        }
        if (metadataOverride.studyDescription) {
          dataset.StudyDescription = metadataOverride.studyDescription;
        }
        if (metadataOverride.studyDate) {
          dataset.StudyDate = metadataOverride.studyDate.replace(/-/g, '');
        }
      }

      DicomMetadataStore.addInstance(dataset);
      instances.push(dataset);
    } catch (error) {
      console.error('Error loading DICOM file:', file.name, error);
    }
  }

  return DicomMetadataStore.getStudyInstanceUIDs();
}
