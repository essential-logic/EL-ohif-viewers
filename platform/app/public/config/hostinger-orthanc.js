/** @type {AppTypes.Config} */
/**
 * EL-OHIF Viewer — Hostinger Production Config
 *
 * Data Sources:
 *  1. 🏥 Orthanc (DEFAULT) — User-uploaded studies via VPS Orthanc DICOMweb
 *     Endpoint: http://76.13.99.8:8042/dicom-web
 *     Upload enabled: YES
 *
 *  2. ☁️ AWS CloudFront — OHIF public demo studies (read-only, no upload)
 *     Endpoint: https://d33do7qe4w26qo.cloudfront.net/dicomweb
 *
 * Users can switch between sources using the Data Source selector in the viewer UI.
 */
window.config = {
  routerBasename: '/',
  showStudyList: true,
  extensions: [],
  modes: [],
  showWarningMessageForCrossOrigin: false,
  showCPUFallbackMessage: true,
  showLoadingIndicator: true,
  experimentalStudyBrowserSort: false,
  strictZSpacingForVolumeViewport: true,
  maxNumberOfWebWorkers: 3,
  groupEnabledModesFirst: true,
  allowMultiSelectExport: true,
  studyPrefetcher: {
    enabled: true,
    displaySetsCount: 2,
    maxNumPrefetchRequests: 10,
    order: 'closest',
  },
  maxNumRequests: {
    interaction: 100,
    thumbnail: 75,
    prefetch: 25,
  },

  // ─── Orthanc is the default — for user-uploaded studies ───────────────────
  defaultDataSourceName: 'orthanc',

  dataSources: [
    // ── 1. Orthanc VPS Server ─────────────────────────────────────────────
    {
      namespace: '@ohif/extension-default.dataSourcesModule.dicomweb',
      sourceName: 'orthanc',
      configuration: {
        friendlyName: '🏥 My PACS (Upload Studies Here)',
        name: 'orthanc',
        wadoUriRoot: '/wado',
        qidoRoot: '/dicom-web',
        wadoRoot: '/dicom-web',
        qidoSupportsIncludeField: true,
        supportsReject: true,
        supportsStow: true,
        // Enables the Upload DICOM button in the study list
        dicomUploadEnabled: true,
        imageRendering: 'wadors',
        thumbnailRendering: 'wadors',
        enableStudyLazyLoad: true,
        supportsFuzzyMatching: true,
        supportsWildcard: true,
        omitQuotationForMultipartRequest: true,
        bulkDataURI: {
          enabled: true,
          relativeResolution: 'studies',
        },
      },
    },

    // ── 2. AWS CloudFront — OHIF Public Demo Studies ──────────────────────
    {
      namespace: '@ohif/extension-default.dataSourcesModule.dicomweb',
      sourceName: 'ohif',
      configuration: {
        friendlyName: '☁️ OHIF Public Demo Studies (AWS)',
        name: 'aws',
        wadoUriRoot: '/aws-dicomweb',
        qidoRoot: '/aws-dicomweb',
        wadoRoot: '/aws-dicomweb',
        qidoSupportsIncludeField: false,
        imageRendering: 'wadors',
        thumbnailRendering: 'wadors',
        enableStudyLazyLoad: true,
        supportsFuzzyMatching: true,
        supportsWildcard: false,
        // Upload NOT enabled on public server (read-only)
        dicomUploadEnabled: false,
        staticWado: true,
        skipAuth: true,
        singlepart: 'bulkdata,video',
        bulkDataURI: {
          enabled: true,
          relativeResolution: 'studies',
          transform: url => url.replace('/pixeldata.mp4', '/rendered'),
        },
        omitQuotationForMultipartRequest: true,
      },
    },

    // ── 3. DICOM JSON (drag & drop local JSON files) ──────────────────────
    {
      namespace: '@ohif/extension-default.dataSourcesModule.dicomjson',
      sourceName: 'dicomjson',
      configuration: {
        friendlyName: 'DICOM JSON',
        name: 'json',
      },
    },

    // ── 4. DICOM Local (drag & drop DICOM files directly) ─────────────────
    {
      namespace: '@ohif/extension-default.dataSourcesModule.dicomlocal',
      sourceName: 'dicomlocal',
      configuration: {
        friendlyName: 'Local DICOM Files',
      },
    },
  ],

  httpErrorHandler: error => {
    console.warn(`[EL-OHIF] HTTP Error (status: ${error.status})`, error);
  },

  whiteLabeling: {
    createLogoComponentFn: function (React) {
      return React.createElement(
        'a',
        {
          target: '_self',
          rel: 'noopener noreferrer',
          className: 'text-purple-600 line-through',
          href: '/',
        },
        React.createElement('img', {
          src: './essential-logic-logo.png',
          className: 'w-32 h-10 object-contain',
        })
      );
    },
  },
};
