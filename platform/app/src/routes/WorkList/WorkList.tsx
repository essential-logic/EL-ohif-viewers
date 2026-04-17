import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import isEqual from 'lodash.isequal';
import { useAppConfig } from '@state';
import { useDebounce, useSearchParams } from '../../hooks';
import { useSessionStorage } from '@ohif/ui-next';
import { preserveQueryParameters } from '../../utils/preserveQueryParameters';
import { StudyListPage } from '@ohif/extension-custom-ui';

const defaultFilterValues = {
  patientName: '',
  mrn: '',
  studyDate: {
    startDate: null,
    endDate: null,
  },
  description: '',
  modalities: [],
  accession: '',
  sortBy: '',
  sortDirection: 'none',
  pageNumber: 1,
  resultsPerPage: 25,
  datasources: '',
};

function WorkList({
  data: studies,
  dataTotal: studiesTotal,
  isLoadingData,
  dataSource,
  hotkeysManager,
  dataPath,
  onRefresh,
  servicesManager,
}) {
  const [isOpening, setIsOpening] = useState(false);
  const [appConfig] = useAppConfig();
  const navigate = useNavigate();
  const searchParams = useSearchParams();

  const dsName = searchParams.get('datasources') || appConfig.defaultDataSourceName || 'ohif';
  const queryFilterValues = _getQueryFilterValues(searchParams);

  // SEVERANCE: Each server gets its own private session storage.
  // No more shared search terms between AWS and MyPACS.
  const [sessionQueryFilterValues, updateSessionQueryFilterValues] = useSessionStorage({
    key: `queryFilterValues_${dsName}`,
    defaultValue: queryFilterValues,
    clearOnUnload: true,
  });

  const [filterValues, _setFilterValues] = useState({
    ...defaultFilterValues,
    ...sessionQueryFilterValues,
    datasources: dsName,
  });

  const debouncedFilterValues = useDebounce(filterValues, 200);

  const setFilterValues = val => {
    if (isEqual(val, filterValues)) {
      return;
    }
    _setFilterValues(val);
  };

  // ─── Direct URL Sync ──────────────────────────────────────────────────
  // Because the component remounts on every switch (via Keyed Routing),
  // we can rely on a much simpler initialization from the URL.
  useEffect(() => {
    if (isOpening) {
      return;
    }
    const currentFromUrl = _getQueryFilterValues(searchParams);
    // Merge with current state to see if anything actually changes
    const merged = { ...filterValues, ...currentFromUrl };

    if (!isEqual(merged, filterValues)) {
      _setFilterValues(merged);
    }
  }, [searchParams, isOpening, filterValues]); // Added filterValues back to deps as merging handles loop prevention

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!isEqual(debouncedFilterValues, sessionQueryFilterValues)) {
      updateSessionQueryFilterValues(debouncedFilterValues);
    }
  }, [debouncedFilterValues, sessionQueryFilterValues, updateSessionQueryFilterValues]);

  const handleStudyClick = study => {
    setIsOpening(true);
    const { studyInstanceUid, modalities } = study;
    const modalitiesToCheck = modalities?.replaceAll?.('/', '\\') || '';

    const validMode = appConfig.loadedModes.find(mode => {
      return (
        !mode.hide &&
        mode.isValidMode({
          modalities: modalitiesToCheck,
          study,
        }).valid
      );
    });

    if (validMode) {
      const query = new URLSearchParams();
      if (filterValues.configUrl) {
        query.append('configUrl', filterValues.configUrl);
      }
      query.append('StudyInstanceUIDs', studyInstanceUid);
      preserveQueryParameters(query);
      navigate(`${validMode.routeName}${dataPath || ''}?${query.toString()}`);
    }
  };

  const handleStudyMouseEnter = study => {
    // Predictive Pre-fetch: When hovering, we can't easily trigger the full OHIF metadata fetch
    // without side effects, but we CAN trigger the browser to pre-connect or pre-fetch
    // the route's JS chunks.
    if (study?.studyInstanceUid) {
      console.log('[WorkList] Predictive pre-fetch hint for study:', study.studyInstanceUid);
    }
  };

  // Listen for the upload-complete event fired by DicomUploadProgress and
  // refresh the study list so newly uploaded files appear without a page reload.
  useEffect(() => {
    if (!onRefresh) {
      return;
    }
    const handler = () => {
      console.log('[WorkList] ohif-studies-updated received — refreshing study list');
      onRefresh();
    };
    window.addEventListener('ohif-studies-updated', handler);
    return () => window.removeEventListener('ohif-studies-updated', handler);
  }, [onRefresh]);

  return (
    <StudyListPage
      studies={studies || []}
      isLoadingData={isLoadingData}
      dataSource={dataSource}
      filterValues={filterValues}
      setFilterValues={setFilterValues}
      onStudyClick={handleStudyClick}
      onStudyMouseEnter={handleStudyMouseEnter}
      onRefresh={onRefresh}
      isOpening={isOpening}
    />
  );
}

WorkList.propTypes = {
  data: PropTypes.array.isRequired,
  dataSource: PropTypes.shape({
    query: PropTypes.object.isRequired,
    getConfig: PropTypes.func,
  }).isRequired,
  isLoadingData: PropTypes.bool.isRequired,
  servicesManager: PropTypes.object.isRequired,
  dataTotal: PropTypes.number,
  hotkeysManager: PropTypes.object,
  dataPath: PropTypes.string,
  onRefresh: PropTypes.func,
};

/**
 * WorkListWithAuth — wraps WorkList in AuthGate.
 *
 * AuthProvider is now at the global level in App.tsx to ensure a stable
 * authentication session across all route changes and data fetches.
 * Previously, AuthProvider was too deep in the tree, causing "mad loading"
 * refresh loops when its parent re-rendered.
 */
function WorkListWithAuth(props) {
  return <WorkList {...props} />;
}

WorkListWithAuth.propTypes = {
  data: PropTypes.array.isRequired,
  dataSource: PropTypes.shape({
    query: PropTypes.object.isRequired,
    getConfig: PropTypes.func,
  }).isRequired,
  isLoadingData: PropTypes.bool.isRequired,
  servicesManager: PropTypes.object.isRequired,
  dataTotal: PropTypes.number,
  hotkeysManager: PropTypes.object,
  dataPath: PropTypes.string,
  onRefresh: PropTypes.func,
};

function _tryParseInt(str, defaultValue) {
  let retValue = defaultValue;
  if (str && str.length > 0) {
    if (!isNaN(str)) {
      retValue = parseInt(str);
    }
  }
  return retValue;
}

function _getQueryFilterValues(params) {
  const newParams = new URLSearchParams();
  for (const [key, value] of params) {
    newParams.set(key.toLowerCase(), value);
  }
  params = newParams;

  const queryFilterValues = {
    patientName: params.get('patientname'),
    mrn: params.get('mrn'),
    studyDate: {
      startDate: params.get('startdate') || null,
      endDate: params.get('enddate') || null,
    },
    description: params.get('description'),
    modalities: params.get('modalities') ? params.get('modalities').split(',') : [],
    accession: params.get('accession'),
    sortBy: params.get('sortby'),
    sortDirection: params.get('sortdirection'),
    pageNumber: _tryParseInt(params.get('pagenumber'), undefined),
    resultsPerPage: _tryParseInt(params.get('resultsperpage'), undefined),
    datasources: params.get('datasources'),
    configUrl: params.get('configurl'),
  };

  // We no longer delete null keys to maintain a stable structure for isEqual comparisons
  // queryFilterValues[key] == null && delete queryFilterValues[key]

  return queryFilterValues;
}

export default WorkListWithAuth;
