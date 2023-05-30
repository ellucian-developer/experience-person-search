// Copyright 2021-2023 Ellucian Company L.P. and its affiliates.

import React, { useCallback, useEffect, useMemo } from 'react';
import { useIntl } from 'react-intl';

import { Icon } from '@ellucian/ds-icons/lib';
import { CircularProgress, List, ListItem, ListItemText, makeStyles, Search, TextLink, Typography } from '@ellucian/react-design-system/core'
import { colorFillAlertError, colorTextNeutral500, fontSizeSmall, fontWeightBold, sizingXLarge, spacing30, spacing40 } from '@ellucian/react-design-system/core/styles/tokens';

import { withIntl } from '../i18n/ReactIntlProviderWrapper';

import { useCache, useCardControl, useCardInfo, useExtensionControl, useThemeInfo } from '@ellucian/experience-extension-utils';

import { PersonSearchProvider, usePersonSearch } from '../context/person-search';

// initialize logging for this card
import { initializeLogging } from '../util/log-level';
initializeLogging('default');

const personCacheKey = 'person';

const orderedResultAttributes = [
    'fullName',
    'firstName',
    'lastName',
    'ethosPersonId',
    'bannerId',
    'colleaguePersonId',
    'bannerUdcId',
    'bannerUserName',
    'birthDate',
    'email'
];

const useStyles = makeStyles(() => ({
    root:{
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column'
    },
    searchBox: {
        flex: '0 0 auto',
        marginTop: '2px',
        marginRight: spacing40,
        marginLeft: spacing40
    },
    progressBox: {
        flex: '1 0 70%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    progressInnerBox: {
    },
    instructions: {
        flex: '1 0 100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: spacing40,
        paddingRight: spacing40
    },
    instructionsIcon: {
        height: `${sizingXLarge} !important`,
        width: `${sizingXLarge} !important`,
        marginBottom: spacing30
    },
    instructionsMessage: {
        color: colorTextNeutral500
    },
    resultSummary: {
        flex: '0 0 auto',
        marginTop: spacing40,
        marginRight: spacing40,
        marginLeft: spacing40,
        display: 'flex',
        alignItems: 'baseline'
    },
    resultCount: {
        color: colorTextNeutral500
    },
    resultSummaryText: {
    },
    persons: {
        flex: '1 0 100%',
        overflowY: 'auto'
    },
    name: {
        fontWeight: fontWeightBold
    },
    email: {
        fontSize: fontSizeSmall
    }
}), { index: 2});

const linkTypes = {
    PAGE: 'page',
    URL: 'url'
}

function Card() {
    const classes = useStyles();
    const intl = useIntl();
    const { primaryColor } = useThemeInfo();

    // Experience SDK hooks
    const { storeItem } = useCache();
    const { navigateToPage } = useCardControl();
    const { setErrorMessage } = useExtensionControl();

    const {
        cardId,
        configuration: {
            customConfiguration: {
                searchResultsAttributes,
                erpIdentifier,
                instructionsIconName,
                instructionsMessage,
                instructionsMessageHeader,
                linkNewTab,
                linkType,
                linkUrl,
                pageRoute: route,
                pageAccountId: accountId,
                pagePublisher: publisher,
                pageExtensionName: extensionName,
                pageCardType: cardType
            } = {}
        } = {}
    } = useCardInfo();

    const { data, isError, isLoading, search, searchString, setSearchString } = usePersonSearch();

    const { searchResultsNameAttribute, searchResultAttributesOrdered } = useMemo(() => {
        let searchResultsNameAttribute;
        const searchResultAttributesOrdered = [];
        if (searchResultsAttributes && (searchResultsAttributes?.length > 1 || searchResultsAttributes[0] !== '')) {
            for (const attribute of orderedResultAttributes) {
                if (searchResultsAttributes.includes(attribute)) {
                    if (['fullName', 'firstName', 'lastName'].includes(attribute)) {
                        searchResultsNameAttribute = attribute;
                    } else {
                        searchResultAttributesOrdered.push(attribute);
                    }
                }
            }
        }

        return {
            searchResultsNameAttribute,
            searchResultAttributesOrdered
        };
    }, [searchResultsAttributes]);

    useEffect(() => {
        if (isError) {
            setErrorMessage({
                headerMessage: intl.formatMessage({id: 'PersonSearch.contactAdministrator'}),
                textMessage: intl.formatMessage({id: 'PersonSearch.dataError'}),
                iconName: 'warning',
                iconColor: colorFillAlertError
            });
        }
    }, [isError, setErrorMessage])

    const onPersonClick = useCallback((person, names) => {
        if (linkType === linkTypes.PAGE) {
            // pass the person data via cache
            const data = {
                personId: person.id,
                bannerId: person.bannerId,
                names
            };

            storeItem({data, key: personCacheKey, scope: cardId});

            // open the page
            let navigateRoute = route;
            let id;
            switch(erpIdentifier) {
                case 'ethosPersonId':
                    ({id} = person);
                    break;
                default:
                    id = person[erpIdentifier];
            }
            if (navigateRoute.includes('{{id}}')) {
                navigateRoute = navigateRoute?.replace(/{{id}}/g, id);
            } else {
                navigateRoute = navigateRoute.endsWith('/') ? `${navigateRoute}${id}` : `${navigateRoute}/${id}`;
            }

            const navigateOptions = {
                route: navigateRoute,
                extension: {
                    accountId: accountId,
                    publisher: publisher,
                    extensionName: extensionName,
                    type: cardType
                }
            }
            navigateToPage(navigateOptions);
        } else if (linkType === linkTypes.URL) {
            let id;
            switch(erpIdentifier) {
                case 'ethosPersonId':
                    ({id} = person);
                    break;
                default:
                    id = person[erpIdentifier];
            }
            const url = linkUrl?.replace(/{{id}}/g, id);

            if (linkNewTab) {
                window.open(url, '_person_search');
            } else {
                location.replace(url);
            }
        }
    }, [history, navigateToPage])

    function onClearSearch() {
        setSearchString('');
    }

    return (
        <div className={classes.root}>
            <div className={classes.searchBox}>
                <Search
                    fullWidth
                    onSearchInvoked={() => search()}
                    onChange={event => {
                        setSearchString(event.target.value);
                    }}
                    onClear={onClearSearch}
                    placeholder="Enter Name or ID"
                    value={searchString}
                >

                </Search>
            </div>
            {isLoading && (
                <div className={classes.progressBox}>
                    <div className={classes.progressInnerBox}>
                        <CircularProgress/>
                    </div>
                </div>
            )}
            {!isLoading && (
                <>
                {!data && (
                    <div className={classes.instructions}>
                        {instructionsIconName && (
                            <Icon className={classes.instructionsIcon} style={{ color: primaryColor }} name={instructionsIconName} large/>
                        )}
                        <Typography variant="body1" component="div">
                            {instructionsMessageHeader}
                        </Typography>
                        <Typography className={classes.instructionsMessage} align="center" variant="body2" component="div">
                            {instructionsMessage}
                        </Typography>
                    </div>
                )}
                {data && (
                    <>
                        <div className={classes.resultSummary}>
                            <Typography className={classes.resultCount} variant="caption" component={'div'}>
                                {`Results (${data.length})`}
                            </Typography>
                        </div>
                        <div className={classes.persons}>
                            <List>
                                {data?.map(person => {
                                    const { dateOfBirth, id, names = {}, ...attributes } = person;

                                    const name = names[searchResultsNameAttribute] || names.fullName;

                                    let birthDateLocalized = 'unkown';
                                    if (dateOfBirth) {
                                        const birthDate = new Date(dateOfBirth);
                                        birthDateLocalized = new Date(birthDate.getTime() + (birthDate.getTimezoneOffset() * 60 * 1000)).toLocaleDateString();
                                    }

                                    attributes.birthDate = birthDateLocalized;
                                    attributes.ethosPersonId = id;

                                    return (
                                        <ListItem key={id} button divider onClick={() => onPersonClick(person, names)}>
                                            <ListItemText
                                                classes={{ primary: classes.name}}
                                                primary={name}
                                                secondary={searchResultAttributesOrdered.map(attribute => {
                                                    return (
                                                        <>
                                                        {attribute !== 'email' && (
                                                            <Typography variant="body3">
                                                                {`${intl.formatMessage({ id: `attribute-${attribute}` })}: ${attributes[attribute]}`}
                                                            </Typography>

                                                        )}
                                                        {attribute === 'email' && (
                                                            <TextLink
                                                                className={classes.email}
                                                                href={`mailto:${attributes.email}`}
                                                                onClick={(event) => { event.stopPropagation(); return true }}
                                                            >
                                                                {attributes.email}
                                                            </TextLink>
                                                        )}
                                                        </>
                                                    )
                                                })}
                                            />
                                        </ListItem>
                                    )
                                })}
                            </List>
                        </div>
                    </>
                )}
                </>
            )}
        </div>
    );
}

function CardWithProviders() {
    return (
        <PersonSearchProvider>
            <Card/>
        </PersonSearchProvider>
    )
}

export default withIntl(CardWithProviders);