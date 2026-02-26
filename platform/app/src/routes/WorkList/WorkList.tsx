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
  const [appConfig] = useAppConfig();
  const navigate = useNavigate();
  const searchParams = useSearchParams();

  const queryFilterValues = _getQueryFilterValues(searchParams);
  const [sessionQueryFilterValues, updateSessionQueryFilterValues] = useSessionStorage({
    key: 'queryFilterValues',
    defaultValue: queryFilterValues,
    clearOnUnload: true,
  });

  const [filterValues, _setFilterValues] = useState({
    ...defaultFilterValues,
    ...sessionQueryFilterValues,
  });

  const debouncedFilterValues = useDebounce(filterValues, 200);

  const setFilterValues = val => {
    if (isEqual(val, filterValues)) {
      return;
    }
    _setFilterValues(val);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!isEqual(debouncedFilterValues, sessionQueryFilterValues)) {
      updateSessionQueryFilterValues(debouncedFilterValues);
    }
  }, [debouncedFilterValues]);

  const handleStudyClick = study => {
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

  return (
    <StudyListPage
      studies={studies || []}
      isLoadingData={isLoadingData}
      filterValues={filterValues}
      setFilterValues={setFilterValues}
      onStudyClick={handleStudyClick}
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

  // Delete null/undefined keys
  Object.keys(queryFilterValues).forEach(
    key => queryFilterValues[key] == null && delete queryFilterValues[key]
  );

  return queryFilterValues;
}

export default WorkList;
