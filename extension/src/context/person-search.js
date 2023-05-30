// Copyright 2021-2023 Ellucian Company L.P. and its affiliates.

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import log from 'loglevel';

import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';

import { useCardInfo, useCache, useData } from '@ellucian/experience-extension-utils';

import { fetchPersonSearch } from '../data/person-search';

import { useEventListener } from '../util/events';

const logger = log.getLogger('default');

const Context = createContext()

const queryClient = new QueryClient();

const employeeSearchCacheKey = 'person-search';

const serviceUrl = process.env.SERVICE_URL || 'http://localhost:3000/api';

const previewData = [
    {
        id: '00000000-0000-0000-0000-000000000000',
        bannerId: '987654321',
        bannerUdcId: '3C9CBAC304ED3872E0440003BA1015A4',
        bannerUserName: 'bhansen',
        dateOfBirth: new Date(0).toLocaleDateString(),
        names: {
            fullName: 'Bret Hansen',
            firstName: 'Bret',
            lastName: 'Hansen'
        },
        email: 'preview@my.edu',
        colleaguePersonId: 'PreviewId'
    }
];
const previewSearchString = 'hansen';

function ProviderInternal({children}) {
    const { getItem, removeItem, storeItem } = useCache();

    const { getExtensionJwt } = useData();

    const {
        serverConfigContext: {
            cardPrefix
        }
    } = useCardInfo();

    // slightly fragile way to determine the card is being previewed in Card Configuration
    const showPreview = cardPrefix === 'preview:';

    const [ previewMode, setPreviewMode ] = useState('instructions');
    const [ loadDataFromQuery, setLoadDataFromQuery ] = useState(false);
    const [ cachedData, setCachedData ] = useState();
    const [ searchString, setSearchString ] = useState('');
    const [ cachedSearchString, setCachedSearchString ] = useState('');

    const idQuery = useQuery(
        ['person-search', {getExtensionJwt, serviceUrl, searchString}],
        fetchPersonSearch,
        {
            enabled: Boolean(loadDataFromQuery && searchString && getExtensionJwt && serviceUrl),
            refetchOnMount: false,
            refetchOnWindowFocus: false
        }
    );
    const { data, isError: idIsError, isFetching: idIsFetching } = idQuery;

    useEffect(() => {
        if (!showPreview) {
            const { data: cachedData } = getItem({ key: employeeSearchCacheKey });
            if (cachedData) {
                const { data, searchString } = cachedData;
                setCachedData(data);
                setCachedSearchString(searchString);
                setSearchString(searchString);
            }
        } else {
            // preview mode is cached for the preview remounts as configuration saved
            const { data: previewData } = getItem({ key: 'preview-mode', options: { session: true } });
            if (previewData) {
                const { mode } = previewData;
                setPreviewMode(mode);
            }
        }
    }, []);

    useEffect(() => {
        if (showPreview) {
            if (previewMode !== 'instructions') {
                setCachedData(previewData);
                setSearchString(previewSearchString);

            } else {
                // clear the data
                setCachedData(undefined);
                setSearchString('');
            }
        }
    }, [ previewMode ]);

    useEffect(() => {
        if (data) {
            setLoadDataFromQuery(false);
        }
    }, [data])

    useEffect(() => {
        if (data) {
            storeItem({
                key: employeeSearchCacheKey,
                data: { data, searchString }
            });
        }
    }, [data]);

    const setPreviewHandler = useCallback(({mode}) => {
        setPreviewMode(mode);
    }, []);

    useEventListener({ name: 'set-preview-mode', handler: setPreviewHandler });

    const contextValue = useMemo(() => {
        return {
            searchString: searchString === '' ? cachedSearchString : searchString,
            setSearchString: searchString => {
                setSearchString(searchString);
                setCachedSearchString(searchString);
                setCachedData(undefined);
                removeItem({ key: employeeSearchCacheKey });
            },
            data: data || cachedData,
            isError: idIsError,
            isLoading: idIsFetching,
            search: () => {
                setLoadDataFromQuery(true);
                queryClient.invalidateQueries({ queryKey: ['person-search'] })
            }
        }
    }, [
        cachedData,
        cachedSearchString,
        data,
        idIsError,
        idIsFetching,
        searchString,
        setLoadDataFromQuery,
        setCachedSearchString,
        setSearchString
    ]);

    useEffect(() => {
        logger.debug('EmployeeSearchProvider mounted');
        return () => {
            logger.debug('EmployeeSearchProvider unmounted');
        }
    }, []);

    return (
        <Context.Provider value={contextValue}>
            {children}
        </Context.Provider>
    )
}

ProviderInternal.propTypes = {
    children: PropTypes.object.isRequired
}

export function PersonSearchProvider({children}) {
    return (
        <QueryClientProvider client={queryClient}>
            <ProviderInternal>
                {children}
            </ProviderInternal>
        </QueryClientProvider>
    )
}

PersonSearchProvider.propTypes = {
    children: PropTypes.object.isRequired
}

export function usePersonSearch() {
    return useContext(Context);
}
