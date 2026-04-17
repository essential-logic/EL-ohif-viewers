/** @type {AppTypes.Config} */

window.config = {
  name: 'config/default.js',
  routerBasename: '/',
  // whiteLabeling: {},
  extensions: [],
  modes: [],
  customizationService: {},
  showStudyList: true,
  // some windows systems have issues with more than 3 web workers
  maxNumberOfWebWorkers: 3,
  // below flag is for performance reasons, but it might not work for all servers
  showWarningMessageForCrossOrigin: true,
  showCPUFallbackMessage: true,
  showLoadingIndicator: true,
  experimentalStudyBrowserSort: false,
  strictZSpacingForVolumeViewport: true,
  groupEnabledModesFirst: true,
  allowMultiSelectExport: false,
  maxNumRequests: {
    interaction: 15,
    thumbnail: 5,
    // Prefetch number is dependent on the http protocol. For http 2 or
    // above, the number of requests can be go a lot higher.
    prefetch: 5,
  },
  showErrorDetails: 'always', // 'always', 'dev', 'production'
  // filterQueryParam: false,
  // Defines multi-monitor layouts
  multimonitor: [
    {
      id: 'split',
      test: ({ multimonitor }) => multimonitor === 'split',
      screens: [
        {
          id: 'ohif0',
          screen: null,
          location: {
            screen: 0,
            width: 0.5,
            height: 1,
            left: 0,
            top: 0,
          },
          options: 'location=no,menubar=no,scrollbars=no,status=no,titlebar=no',
        },
        {
          id: 'ohif1',
          screen: null,
          location: {
            width: 0.5,
            height: 1,
            left: 0.5,
            top: 0,
          },
          options: 'location=no,menubar=no,scrollbars=no,status=no,titlebar=no',
        },
      ],
    },

    {
      id: '2',
      test: ({ multimonitor }) => multimonitor === '2',
      screens: [
        {
          id: 'ohif0',
          screen: 0,
          location: {
            width: 1,
            height: 1,
            left: 0,
            top: 0,
          },
          options: 'fullscreen=yes,location=no,menubar=no,scrollbars=no,status=no,titlebar=no',
        },
        {
          id: 'ohif1',
          screen: 1,
          location: {
            width: 1,
            height: 1,
            left: 0,
            top: 0,
          },
          options: 'fullscreen=yes,location=no,menubar=no,scrollbars=no,status=no,titlebar=no',
        },
      ],
    },
  ],
  defaultDataSourceName: 'orthanc',
  /* Dynamic config allows user to pass "configUrl" query string this allows to load config without recompiling application. The regex will ensure valid configuration source */
  // dangerouslyUseDynamicConfig: {
  //   enabled: true,
  //   // regex will ensure valid configuration source and default is /.*/ which matches any character. To use this, setup your own regex to choose a specific source of configuration only.
  //   // Example 1, to allow numbers and letters in an absolute or sub-path only.
  //   // regex: /(0-9A-Za-z.]+)(\/[0-9A-Za-z.]+)*/
  //   // Example 2, to restricts to either hosptial.com or othersite.com.
  //   // regex: /(https:\/\/hospital.com(\/[0-9A-Za-z.]+)*)|(https:\/\/othersite.com(\/[0-9A-Za-z.]+)*)/
  //   regex: /.*/,
  // },
  dataSources: [
    {
      namespace: '@ohif/extension-default.dataSourcesModule.dicomweb',
      sourceName: 'orthanc',
      configuration: {
        friendlyName: 'My PACS (Secure User Isolation)',
        name: 'orthanc',
        wadoUriRoot: 'https://xyuxiachrjpcrmiephqa.supabase.co/functions/v1/orthanc-proxy/wado',
        qidoRoot: 'https://xyuxiachrjpcrmiephqa.supabase.co/functions/v1/orthanc-proxy/dicom-web',
        wadoRoot: 'https://xyuxiachrjpcrmiephqa.supabase.co/functions/v1/orthanc-proxy/dicom-web',
        qidoSupportsIncludeField: true,
        supportsReject: true,
        dicomUploadEnabled: true,
        // Enforce Authorization headers for all requests through the proxy
        requestOptions: {
          headers: () => {
            // Strategy: Try common Supabase localStorage key formats
            const projectRef = 'xyuxiachrjpcrmiephqa';
            const knownKeys = [
              `sb-${projectRef}-auth-token`,
              `sb-${window.location.hostname}-auth-token`,
              'supabase.auth.token',
            ];

            for (const key of knownKeys) {
              const raw = localStorage.getItem(key);
              if (raw) {
                try {
                  const session = JSON.parse(raw);
                  const token = session?.access_token ?? session?.currentSession?.access_token;
                  if (token && token !== 'undefined' && token !== 'null') {
                    // Basic check: is it non-expired? (Supabase stores expires_at in seconds)
                    const expiresAt = session?.expires_at ?? session?.currentSession?.expires_at;
                    if (expiresAt && expiresAt < Date.now() / 1000 - 10) {
                      console.warn('[EL-OHIF] Found expired session in localStorage key:', key);
                      continue;
                    }
                    return {
                      Authorization: `Bearer ${token}`,
                      apikey:
                        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5dXhpYWNocmpwY3JtaWVwaHFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMzg5MTQsImV4cCI6MjA4ODYxNDkxNH0.Juyha-EgArRaPu7Sk05aqLzQPT5KrjhHFG4AK31zpBw',
                    };
                  }
                } catch (e) {
                  /* ignore */
                }
              }
            }

            // Fallback: Scan all keys for auth-token
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (
                key &&
                key.includes('auth-token') &&
                (key.startsWith('sb-') || key === 'supabase.auth.token')
              ) {
                try {
                  const session = JSON.parse(localStorage.getItem(key) || '{}');
                  const token = session?.access_token ?? session?.currentSession?.access_token;
                  if (token && token !== 'undefined' && token !== 'null') {
                    const expiresAt = session?.expires_at ?? session?.currentSession?.expires_at;
                    if (expiresAt && expiresAt < Date.now() / 1000 - 10) {
                      continue;
                    }
                    return {
                      Authorization: `Bearer ${token}`,
                      apikey:
                        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5dXhpYWNocmpwY3JtaWVwaHFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMzg5MTQsImV4cCI6MjA4ODYxNDkxNH0.Juyha-EgArRaPu7Sk05aqLzQPT5KrjhHFG4AK31zpBw',
                    };
                  }
                } catch (e) {
                  /* ignore */
                }
              }
            }

            console.warn(
              '[EL-OHIF] No valid Supabase auth token found. Request may be unauthorized.'
            );
            return {
              apikey:
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5dXhpYWNocmpwY3JtaWVwaHFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMzg5MTQsImV4cCI6MjA4ODYxNDkxNH0.Juyha-EgArRaPu7Sk05aqLzQPT5KrjhHFG4AK31zpBw',
              Authorization:
                'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5dXhpYWNocmpwY3JtaWVwaHFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMzg5MTQsImV4cCI6MjA4ODYxNDkxNH0.Juyha-EgArRaPu7Sk05aqLzQPT5KrjhHFG4AK31zpBw',
             };
          },
        },
        imageRendering: 'wadors',
        thumbnailRendering: 'wadors',
        enableStudyLazyLoad: true,
        supportsFuzzyMatching: true,
        supportsWildcard: true,
        omitQuotationForMultipartRequest: true,
        // Throttle concurrent requests to prevent flooding upstream.
        // Each frame load hits the proxy → Orthanc, so cap parallelism.
        maxNumRequests: {
          interaction: 1, // Tool interactions (windowing, zoom) — highest priority
          thumbnail: 4, // Thumbnail loading
          prefetch: 4, // Background prefetch
        },
        bulkDataURI: {
          enabled: true,
        },
      },
    },
    {
      namespace: '@ohif/extension-default.dataSourcesModule.dicomweb',
      sourceName: 'ohif',
      configuration: {
        friendlyName: 'AWS S3 Static wado server',
        name: 'aws',
        wadoUriRoot: 'https://d33do7qe4w26qo.cloudfront.net/dicomweb',
        qidoRoot: 'https://d33do7qe4w26qo.cloudfront.net/dicomweb',
        wadoRoot: 'https://d33do7qe4w26qo.cloudfront.net/dicomweb',
        qidoSupportsIncludeField: false,
        imageRendering: 'wadors',
        thumbnailRendering: 'wadors',
        enableStudyLazyLoad: true,
        supportsFuzzyMatching: true,
        supportsWildcard: false,
        staticWado: true,
        skipAuth: true,
        singlepart: 'bulkdata,video',
        // whether the data source should use retrieveBulkData to grab metadata,
        // and in case of relative path, what would it be relative to, options
        // are in the series level or study level (some servers like series some study)
        bulkDataURI: {
          enabled: true,
          relativeResolution: 'studies',
          transform: url => url.replace('/pixeldata.mp4', '/rendered'),
        },
        omitQuotationForMultipartRequest: true,
      },
    },

    {
      namespace: '@ohif/extension-default.dataSourcesModule.dicomweb',
      sourceName: 'ohif2',
      configuration: {
        friendlyName: 'AWS S3 Static wado secondary server',
        name: 'aws',
        wadoUriRoot: 'https://dd33do7qe4w26qo.cloudfront.net/dicomweb',
        qidoRoot: 'https://dd33do7qe4w26qo.cloudfront.net/dicomweb',
        wadoRoot: 'https://dd33do7qe4w26qo.cloudfront.net/dicomweb',
        qidoSupportsIncludeField: false,
        supportsReject: false,
        imageRendering: 'wadors',
        thumbnailRendering: 'wadors',
        enableStudyLazyLoad: true,
        supportsFuzzyMatching: false,
        supportsWildcard: true,
        staticWado: true,
        skipAuth: true,
        singlepart: 'bulkdata,video',
        // whether the data source should use retrieveBulkData to grab metadata,
        // and in case of relative path, what would it be relative to, options
        // are in the series level or study level (some servers like series some study)
        bulkDataURI: {
          enabled: true,
          relativeResolution: 'studies',
        },
        omitQuotationForMultipartRequest: true,
      },
    },
    {
      namespace: '@ohif/extension-default.dataSourcesModule.dicomweb',
      sourceName: 'ohif3',
      configuration: {
        friendlyName: 'AWS S3 Static wado secondary server',
        name: 'aws',
        wadoUriRoot: 'https://d3t6nz73ql33tx.cloudfront.net/dicomweb',
        qidoRoot: 'https://d3t6nz73ql33tx.cloudfront.net/dicomweb',
        wadoRoot: 'https://d3t6nz73ql33tx.cloudfront.net/dicomweb',
        qidoSupportsIncludeField: false,
        supportsReject: false,
        imageRendering: 'wadors',
        thumbnailRendering: 'wadors',
        enableStudyLazyLoad: true,
        supportsFuzzyMatching: false,
        supportsWildcard: true,
        staticWado: true,
        skipAuth: true,
        singlepart: 'bulkdata,video',
        // whether the data source should use retrieveBulkData to grab metadata,
        // and in case of relative path, what would it be relative to, options
        // are in the series level or study level (some servers like series some study)
        bulkDataURI: {
          enabled: true,
          relativeResolution: 'studies',
        },
        omitQuotationForMultipartRequest: true,
      },
    },

    {
      namespace: '@ohif/extension-default.dataSourcesModule.dicomweb',
      sourceName: 'local5000',
      configuration: {
        friendlyName: 'Static WADO Local Data',
        name: 'DCM4CHEE',
        qidoRoot: 'http://localhost:5000/dicomweb',
        wadoRoot: 'http://localhost:5000/dicomweb',
        qidoSupportsIncludeField: false,
        supportsReject: true,
        supportsStow: true,
        imageRendering: 'wadors',
        thumbnailRendering: 'wadors',
        enableStudyLazyLoad: true,
        supportsFuzzyMatching: false,
        supportsWildcard: true,
        staticWado: true,
        singlepart: 'video',
        bulkDataURI: {
          enabled: true,
          relativeResolution: 'studies',
        },
      },
    },

    {
      namespace: '@ohif/extension-default.dataSourcesModule.dicomwebproxy',
      sourceName: 'dicomwebproxy',
      configuration: {
        friendlyName: 'dicomweb delegating proxy',
        name: 'dicomwebproxy',
      },
    },
    {
      namespace: '@ohif/extension-default.dataSourcesModule.dicomjson',
      sourceName: 'dicomjson',
      configuration: {
        friendlyName: 'dicom json',
        name: 'json',
      },
    },
    {
      namespace: '@ohif/extension-default.dataSourcesModule.dicomlocal',
      sourceName: 'dicomlocal',
      configuration: {
        friendlyName: 'dicom local',
      },
    },
  ],
  httpErrorHandler: async error => {
    if (error && typeof error === 'object' && 'status' in error) {
      console.warn('[EL-OHIF] HTTP Error Status:', error.status);

      const err = /** @type {any} */ (error);
      // If 401, try to log the error message from the proxy body
      if (err.status === 401 && err.response) {
        try {
          const body = await err.response.json();
          console.error('[EL-OHIF] Proxy Auth Error:', body.error || 'Unknown', body.details || '');
          if (body.receivedHeaders) {
            console.log('[EL-OHIF] Headers received by proxy:', body.receivedHeaders);
          }
        } catch (e) {
          /* ignore */
        }
      }
    }
  },
  // segmentation: {
  //   segmentLabel: {
  //     enabledByDefault: true,
  //     labelColor: [255, 255, 0, 1], // must be an array
  //     hoverTimeout: 1,
  //     background: 'rgba(100, 100, 100, 0.5)', // can be any valid css color
  //   },
  // },
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
