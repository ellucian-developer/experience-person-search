// Copyright 2021-2023 Ellucian Company L.P. and its affiliates.

import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import httpHeaderNormalizer from '@middy/http-header-normalizer';
import { StatusCodes } from 'http-status-codes';
import { fetchSearch } from './data/person-search.js';
import { experienceUtil, lambdaUtil } from '@ellucian/experience-extension-server-util';

import { logUtil } from '@ellucian/experience-extension-server-util';
logUtil.initializeLogging();
const logger = logUtil.getLogger();

async function _handler (event) {
    logger.debug('inbound event: ', event);

    const {
        jwt: {
            card: { cardServerConfigurationApiUrl } = {}
        } = {},
        queryStringParameters: {
            searchString
        } = {}
    } = event;

    // temporarily server configuration is optional until the patch is appllied to Experience
    let error = false;
    let serverErpIdentifier, serverSearchBy, serverSearchRole, serverSearchResultsAttributes;
    try {
        const extensionApiToken = process.env.EXTENSION_API_TOKEN;
        console.log('extensionApiToken', extensionApiToken);

        // eslint-disable-next-line no-unused-vars
        const { config, error: cardServerConfigurationError } = await experienceUtil.getCardServerConfiguration({
            url: cardServerConfigurationApiUrl,
            token: extensionApiToken
        });

        console.log('config', config);

        ({ erpIdentifier: serverErpIdentifier, searchBy: serverSearchBy, searchRole: serverSearchRole, searchResultsAttributes: serverSearchResultsAttributes } = config || {});
    }
    catch (error) {
        console.error("Unable to fetch server configuration", error);
    }

    const erpIdentifier = serverErpIdentifier;
    const searchBy = serverSearchBy;
    const searchRole = serverSearchRole;
    const searchResultsAttributes = serverSearchResultsAttributes;

    const apiKey = process.env.API_KEY;
    if (apiKey && !error) {
        const data = await fetchSearch({ apiKey, erpIdentifier, searchResultsAttributes, searchRole, searchBy, searchString });

        if (!error) {
            return lambdaUtil.buildResponse({
                statusCode: StatusCodes.OK,
                body: data
            });
        } else {
            const throwError = new Error(JSON.stringify({ error }));
            throwError.statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
            throw throwError;
        }
    } else {
        const throwError = new Error(JSON.stringify({ error }));
        throwError.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;

        throw throwError;
    }
}

export const handler = middy(_handler);

handler.use(httpHeaderNormalizer());
handler.use(httpErrorHandler());
handler.use(lambdaUtil.jwtAuthorizeMiddy({ options: { secret: process.env.JWT_SECRET } }));
