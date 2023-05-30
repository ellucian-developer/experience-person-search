// Copyright 2021-2023 Ellucian Company L.P. and its affiliates.

import { fetchJsonData } from './json-data';

import log from 'loglevel';
const logger = log.getLogger('default');

export async function fetchPersonSearch({ queryKey }) {
    // eslint-disable-next-line no-unused-vars
    const [ _, { getExtensionJwt, serviceUrl, searchString }] = queryKey;

    try {
        const start = new Date();

        const searchParams = new URLSearchParams({
            searchString
        });

        const url = `${serviceUrl}/person-search?${searchParams.toString()}`;

        const { data, error } = await fetchJsonData({
            url,
            getJwt: getExtensionJwt
        });

        logger.debug('Lambda fetch time:', new Date().getTime() - start.getTime());

        if (error) {
            logger.debug('fetch received an error', error);
            return [];
            // throw new Error(error);
        }

        return  data;
    } catch (error) {
        logger.error('unable to fetch data: ', error);
        throw error;
    }
}
