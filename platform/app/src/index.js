/**
 * Entry point for development and production PWA builds.
 */
import 'regenerator-runtime/runtime';
import { createRoot } from 'react-dom/client';
import App from './App';
import React from 'react';

import { modes as defaultModes, extensions as defaultExtensions } from './pluginImports';
import loadDynamicConfig from './loadDynamicConfig';
export { history } from './utils/history';
export { preserveQueryParameters, preserveQueryStrings } from './utils/preserveQueryParameters';

// EL-specific Token Sync (Guaranteed to run at entry point)
(function() {
  try {
    const projectRef = window.config?.supabase?.projectRef || 'YOUR_PROJECT_ID';
    const storageKey = 'sb-' + projectRef + '-auth-token';
    const raw = localStorage.getItem(storageKey) || localStorage.getItem('supabase.auth.token');
    if (raw) {
      const data = JSON.parse(raw);
      const token = data.access_token || (data.currentSession && data.currentSession.access_token);
      if (token && token !== 'undefined' && token !== 'null') {
        window.__supabaseToken = token;
        window.__supabaseApiKey = window.config?.supabase?.anonKey || '';
        console.log('[EL-Auth] Entry point token sync successful.');
      }
    }
  } catch (e) {
    console.warn('[EL-Auth] Entry point token sync failed:', e);
  }
})();

loadDynamicConfig(window.config).then(config_json => {
  // Reset Dynamic config if defined
  if (config_json !== null) {
    window.config = config_json;
  }

  /**
   * Combine our appConfiguration with installed extensions and modes.
   * In the future appConfiguration may contain modes added at runtime.
   *  */
  const appProps = {
    config: window ? window.config : {},
    defaultExtensions,
    defaultModes,
  };

  const container = document.getElementById('root');

  const root = createRoot(container);
  root.render(React.createElement(App, appProps));
});
