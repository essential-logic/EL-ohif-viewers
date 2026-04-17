/* eslint-disable react/jsx-props-no-spreading */
import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Enums, MODULE_TYPES, log } from '@ohif/core';
import { useParams, useLocation } from 'react-router';
import { extensionManager } from '../App';
import useSearchParams from '../hooks/useSearchParams';
import { ErrorDisplay } from '@ohif/ui-next';
import { withAppTypes } from './types';

interface LayoutTemplateProps {
  data: unknown[];
  dataPath: string;
  dataTotal: number;
  dataSource: unknown;
  isLoadingData: boolean;
  onRefresh: () => void;
}

interface DataSourceWrapperProps {
  children: React.ComponentType<LayoutTemplateProps>;
}

/**
 * Uses route properties to determine the data source that should be passed
 * to the child layout template. In some instances, initiates requests and
 * passes data as props.
 *
 * @param {object} props
 * @param {function} props.children - Layout Template React Component
 */
function DataSourceWrapper(props: withAppTypes<DataSourceWrapperProps>) {
  const { children: LayoutTemplate, ...rest } = props;
  const params = useParams();
  const location = useLocation();
  const lowerCaseSearchParams = useSearchParams({ lowerCaseKeys: true });
  const query = useSearchParams();
  // Route props --> studies.mapParams
  // mapParams --> studies.search
  // studies.search --> studies.processResults
  // studies.processResults --> <LayoutTemplate studies={} />
  // But only for LayoutTemplate type of 'list'?
  // Or no data fetching here, and just hand down my source
  const STUDIES_LIMIT = 101;
  const DEFAULT_DATA = {
    studies: [],
    total: 0,
    resultsPerPage: 25,
    pageNumber: 1,
    location: 'Not a valid location, causes first load to occur',
  };

  // ─── Hard Severance: The component remounts on every switch ─────────────────
  // Because index.tsx uses a 'key' based on the datasource, 
  // we start 100% fresh every time the server changes.

  const dsNameFromUrl = useSearchParams({ lowerCaseKeys: true }).get('datasources') || window.config.defaultDataSourceName || 'ohif';
  const dataSource = useMemo(() => {
    return extensionManager.getDataSources(dsNameFromUrl)?.[0] || 
           extensionManager.getModulesByType(MODULE_TYPES.DATA_SOURCE)[0]?.module[0];
  }, [dsNameFromUrl]);

  const [data, setData] = useState(DEFAULT_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDataSourceInitialized, setIsDataSourceInitialized] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  const lastFetchedLocation = React.useRef(null);
  const lastRefreshCount = React.useRef(0);

  // Path for URL building
  const dataSourcePath = dsNameFromUrl ? `/${dsNameFromUrl}` : '';

  // Total Severance: Wipe persistent memory on mount
  useEffect(() => {
    localStorage.removeItem('activeDataSource');
    sessionStorage.removeItem('activeDataSource');
    console.log(`[DataSourceWrapper] Fresh Mount for: ${dsNameFromUrl}. Isolation Active.`);
  }, [dsNameFromUrl]);

  // Initialization Effect
  useEffect(() => {
    let active = true;
    const init = async () => {
      try {
        await dataSource.initialize({ params, query });
        if (active) {
          setIsDataSourceInitialized(true);
        }
      } catch (err) {
        if (active) {
          setError(err);
        }
      }
    };
    init();
    return () => {
      active = false;
    };
  }, [dataSource, params, query]);

  // Sync Global Active (for viewer/extensions)
  useEffect(() => {
    if (dsNameFromUrl && extensionManager.getActiveDataSourceOrNull()?.name !== dsNameFromUrl) {
      extensionManager.setActiveDataSource(dsNameFromUrl);
    }
  }, [dsNameFromUrl]);

  useEffect(() => {
    if (!isDataSourceInitialized) {
      return;
    }

    const queryFilterValues = _getQueryFilterValues(location.search, STUDIES_LIMIT);

    // 204: no content
    const currentPath = location.pathname + location.search + location.hash;

    // 204: no content
    async function getData() {
      setIsLoading(true);
      setError(null);
      lastFetchedLocation.current = currentPath;

      // Attempt fetch, auto-refresh token on 401 and retry once
      const attemptFetch = async (isRetry = false): Promise<void> => {
        try {
          if (!(window as any).searchTimerStarted) {
            log.time(Enums.TimingEnum.SEARCH_TO_LIST);
            (window as any).searchTimerStarted = true;
          }
          const studies = await dataSource.query.studies.search(queryFilterValues);
          setData({
            studies: studies || [],
            total: studies.length,
            resultsPerPage: queryFilterValues.resultsPerPage,
            pageNumber: queryFilterValues.pageNumber,
            location: currentPath,
          });
          log.timeEnd(Enums.TimingEnum.SCRIPT_TO_VIEW);
          if ((window as any).searchTimerStarted) {
            log.timeEnd(Enums.TimingEnum.SEARCH_TO_LIST);
            (window as any).searchTimerStarted = false;
          }
        } catch (err: unknown) {
          const errMsg = (err as Error)?.message || '';
          const is401 =
            (err as { status?: number })?.status === 401 ||
            errMsg.includes('401') ||
            errMsg.includes('Unauthorized') ||
            errMsg.includes('authorization') ||
            errMsg.includes('request failed');

          if (is401 && !isRetry) {
            console.warn('[DataSourceWrapper] 401 on study search — refreshing token and retrying…');
            // AuthContext registers window.__refreshSupabaseToken to decouple this module
            const refreshFn = (window as unknown as { __refreshSupabaseToken?: () => Promise<string | null> }).__refreshSupabaseToken;
            if (refreshFn) {
              const newToken = await refreshFn().catch(() => null);
              if (newToken) {
                console.log('[DataSourceWrapper] Token refreshed — retrying study search.');
              }
            }
            return attemptFetch(true);
          }

          throw err;
        }
      };

      try {
        await attemptFetch();
      } catch (err) {
        setError(err);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }


    try {
      const isSamePage = data.pageNumber === queryFilterValues.pageNumber;
      const isLocationUpdated = lastFetchedLocation.current !== currentPath;
      const isRefreshTriggered = lastRefreshCount.current !== refreshCount;
      
      const isDataInvalid =
        isRefreshTriggered || !isSamePage || (!isLoading && !error && isLocationUpdated);

      if (isDataInvalid) {
        lastRefreshCount.current = refreshCount;
        getData();
      }
    } catch (ex) {
      console.warn(ex);
      setError(ex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, params, isLoading, dataSource, isDataSourceInitialized, refreshCount]);
  // queryFilterValues

  if (error) {
    return (
      <ErrorDisplay
        error={error}
        onRetry={() => {
          setError(null);
          setRefreshCount(c => c + 1);
        }}
        title="Data Source Error"
      />
    );
  }

  // TODO: Better way to pass DataSource?
  return (
    <LayoutTemplate
      {...rest}
      data={data.studies}
      dataPath={dataSourcePath}
      dataTotal={data.total}
      dataSource={dataSource}
      isLoadingData={isLoading}
      // Incrementing refreshCount forces the useEffect above to refetch
      onRefresh={() => {
        setData(DEFAULT_DATA);
        setRefreshCount(c => c + 1);
      }}
    />
  );
}

DataSourceWrapper.propTypes = {
  /** Layout Component to wrap with a Data Source */
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.func]).isRequired,
};

export default DataSourceWrapper;

/**
 * Duplicated in `workList`
 * Need generic that can be shared? Isn't this what qs is for?
 * @param {*} query
 */
function _getQueryFilterValues(query, queryLimit) {
  query = new URLSearchParams(query);
  const newParams = new URLSearchParams();
  for (const [key, value] of query) {
    newParams.set(key.toLowerCase(), value);
  }
  query = newParams;

  const pageNumber = _tryParseInt(query.get('pagenumber'), 1);
  const resultsPerPage = _tryParseInt(query.get('resultsperpage'), 25);

  const queryFilterValues = {
    // DCM
    patientId: query.get('mrn'),
    patientName: query.get('patientname'),
    studyDescription: query.get('description'),
    modalitiesInStudy: query.get('modalities') && query.get('modalities').split(','),
    accessionNumber: query.get('accession'),
    //
    startDate: query.get('startdate'),
    endDate: query.get('enddate'),
    page: _tryParseInt(query.get('page'), undefined),
    pageNumber,
    resultsPerPage,
    // Rarely supported server-side
    sortBy: query.get('sortby'),
    sortDirection: query.get('sortdirection'),
    // Offset...
    offset: Math.floor((pageNumber * resultsPerPage) / queryLimit) * (queryLimit - 1),
    config: query.get('configurl'),
  };

  // patientName: good
  // studyDescription: good
  // accessionNumber: good

  // Delete null/undefined keys
  Object.keys(queryFilterValues).forEach(
    key => queryFilterValues[key] == null && delete queryFilterValues[key]
  );

  return queryFilterValues;

  function _tryParseInt(str, defaultValue) {
    let retValue = defaultValue;
    if (str !== null) {
      if (str.length > 0) {
        if (!isNaN(str)) {
          retValue = parseInt(str);
        }
      }
    }
    return retValue;
  }
}
