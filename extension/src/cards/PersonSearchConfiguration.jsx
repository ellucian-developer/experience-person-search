// Copyright 2021-2023 Ellucian Company L.P. and its affiliates.

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { icons, Icon } from '@ellucian/ds-icons/lib';
import {
    Dropdown,
    DropdownItem,
    DropdownTypeahead,
    DropdownTypeaheadItem,
    FormControlLabel,
    Grid,
    makeStyles,
    Radio,
    RadioGroup,
    Switch,
    TextField,
    Typography
} from '@ellucian/react-design-system/core';
import { sizingXxLarge } from '@ellucian/react-design-system/core/styles/tokens';
import { useCardControl, useCardInfo, useCache } from '@ellucian/experience-extension-utils';

import { withIntl } from '../i18n/ReactIntlProviderWrapper';

import { dispatchEvent } from '../util/events';

const searchByItems = [
    {
        key: 'colleaguePersonId',
        label: 'Colleague Person ID'
    }, {
        key: 'bannerId',
        label: 'Banner ID'
    }, {
        key: 'bannerUdcId',
        label: 'Banner UDC ID'
    }, {
        key: 'bannerUserName',
        label: 'Banner Username'
    }, {
        key: 'ethosPersonId',
        label: 'Ethos Person ID'
    }, {
        key: 'names',
        label: 'Names'
    }
];

const searchRoles = [
    'any',
    'advisor',
    'alumni',
    'employee',
    'instructor',
    'prospectiveStudent',
    'student',
    'vendor'
];

const searchResultsAttributesItems = [
    {
        key: 'colleaguePersonId',
        label: 'Colleague Person ID'
    }, {
        key: 'bannerId',
        label: 'Banner ID'
    }, {
        key: 'bannerUdcId',
        label: 'Banner UDC ID'
    }, {
        key: 'bannerUserName',
        label: 'Banner Username'
    }, {
        key: 'birthDate',
        label: 'Birth Date'
    }, {
        key: 'email',
        label: 'Email'
    }, {
        key: 'ethosPersonId',
        label: 'Ethos Person ID'
    }, {
        key: 'firstName',
        label: 'First Name'
    }, {
        key: 'fullName',
        label: 'Full Name'
    }, {
        key: 'lastName',
        label: 'Last Name'
    }
];

const searchResultNameAttributes = [ 'fullName', 'firstName', 'lastName' ];

const linkTypes = {
    PAGE: 'page',
    URL: 'url'
}

const erpIdTypes = [
    'bannerId',
    'bannerSourcedId',
    'bannerUdcId',
    'bannerUserName',
    'colleaguePersonId',
    'colleagueUserName',
    'crmAdvanceUserName',
    'elevateId',
    'ethosPersonId',
    'powerCampusId',
    'powerCampusUserName'
];

const useStyles = makeStyles(() => ({
    root: {
        position: 'relative'
    },
    gridItem: {
        maxWidth: '100% !important'
    },
    header: {
        marginBottom: '1rem'
    },
    headerNotFirst: {
        marginBottom: '1rem',
        marginTop: '1rem'
    },
    field: {
        // width: '80%'
        // marginBottom: '1rem'
        maxWidth: '100% !important'
    },
    fieldRow: {
        marginRight: '1rem'
    },
    instructionsIcon: {
        height: `${sizingXxLarge} !important`,
        width: `${sizingXxLarge} !important`
    },
    popperText: {
        maxWidth: '30rem'
    }
}), { index: 2});

function CardConfiguration() {
    const classes = useStyles();
    const intl = useIntl();
    const { removeItem, storeItem } = useCache();

    const {
        setCustomConfiguration,
        setIsCustomConfigurationValid
    } = useCardControl();

    const {
        configuration: {
            customConfiguration: {
                client: {
                    searchResultsAttributes: configSearchResultsAttributes = [],
                    erpIdentifier: configErpIdentifier,
                    instructionsIconName: configInstructionsIconName,
                    instructionsMessage: configInstructionsMessage,
                    instructionsMessageHeader: configInstructionsMessageHeader,
                    linkNewTab: configLinkNewTab = false,
                    linkType: configLinkType = linkTypes.PAGE,
                    linkUrl: configLinkUrl,
                    pageRoute: configPageRoute,
                    pageAccountId: configPageAccountId,
                    pagePublisher: configPagePublisher,
                    pageExtensionName: configPageExtensionName,
                    pageCardType: configPageCardType,
                    previweMode: configPreviewMode
                } = {},
                server: {
                    searchBy: configSearchBy = [],
                    searchRole: configSearchRole = 'any'
                } = {}
            } = {}
        } = {}
    } = useCardInfo();

    const rootRef = useRef();

    const [ previewMode, setPreviewMode ] = useState(configPreviewMode || 'instructions');

    const [ searchBy, setSearchBy ] = useState(configSearchBy);
    const [ searchRole, setSearchRole ] = useState(configSearchRole);

    const [ instructionsIconName, setInstructionsIconName ] = useState(configInstructionsIconName);
    const [ instructionsMessageHeader, setInstructionsMessageHeader ] = useState(configInstructionsMessageHeader || '');
    const [ instructionsMessage, setInstructionsMessage ] = useState(configInstructionsMessage || '');

    const [ searchResultsAttributes, setSearchResultAttributes ] = useState(configSearchResultsAttributes);

    const [ linkType, setLinkType ] = useState(configLinkType);

    const [ pageRoute, setPageRoute ] = useState(configPageRoute || '');
    const [ pageAccountId, setPageAccountId ] = useState(configPageAccountId || '');
    const [ pagePublisher, setPagePublisher ] = useState(configPagePublisher || '');
    const [ pageExtensionName, setPageExtensionName ] = useState(configPageExtensionName || '');
    const [ pageCardType, setPageCardType ] = useState(configPageCardType || '');

    const [ erpIdentifier, setErpIdentifier ] = useState(configErpIdentifier);

    const [ linkNewTab, setLinkNewTab ] = useState(configLinkNewTab) || '';
    const [ linkUrl, setLinkUrl ] = useState(configLinkUrl) || '';

    useEffect(() => {
        const configuration = {
            customConfiguration: {
                client: {
                    erpIdentifier,
                    instructionsIconName,
                    instructionsMessage,
                    instructionsMessageHeader,
                    linkNewTab,
                    linkType,
                    linkUrl,
                    pageRoute,
                    pageAccountId,
                    pagePublisher,
                    pageExtensionName,
                    pageCardType,
                    searchBy,
                    searchResultsAttributes,
                    searchRole
                },
                server: {
                    erpIdentifier,
                    searchBy,
                    searchResultsAttributes,
                    searchRole
                }
            }
        }
        const isValid = searchBy.length > 0 && searchResultsAttributes.length > 0;

        setCustomConfiguration(configuration);
        setIsCustomConfigurationValid(isValid);
    }, [
        erpIdentifier,
        instructionsIconName,
        instructionsMessage,
        instructionsMessageHeader,
        linkNewTab,
        linkType,
        linkUrl,
        pageRoute,
        pageAccountId,
        pagePublisher,
        pageExtensionName,
        pageCardType,
        searchBy,
        searchResultsAttributes,
        searchRole
    ]);

    useEffect(() => {
        return () => {
            // remove the preview mode from cache
            removeItem({ key: 'preview-mode', options: { session: true }});
        }
    }, []);

    useEffect(() => {
        if (rootRef.current) {
            // Hack until fixed
            // rendering has happened, look for DropdownTypeahead to fix the width
            const dropdownTypeaheadElement = rootRef.current.querySelector('.eds-inline-search');
            if (dropdownTypeaheadElement) {
                dropdownTypeaheadElement.style.maxWidth = '100%';
            }
        }
    }, [rootRef.current]);

    function onPreviewModeChange({ target: { value } }) {
        setPreviewMode(value);

        // inform card of the previw mode. Using cache and dispatch to preserve mode through
        // card configuration save remounts
        storeItem({ key: 'preview-mode', data: { mode: value }, options: { session: true }});
        dispatchEvent({ name: 'set-preview-mode', data: { mode: value } });
    }

    function onSearchByChange({ target: { value } }) {
        setSearchBy(value);
    }

    function onSearchRoleChange({ target: { value } }) {
        setSearchRole(value);
    }

    function onIconChange(value ) {
        setInstructionsIconName(value);
    }

    function onMessageHeaderChange({ target: { value } }) {
        setInstructionsMessageHeader(value);
    }

    function onMessageChange({ target: { value } }) {
        setInstructionsMessage(value);
    }

    const onSearchResultAttributesChange = useCallback(({ target: { value } }) => {
        // only allow one of the names to be selected
        const isNameAttribute = attribute => searchResultNameAttributes.includes(attribute);

        const names = value.filter(isNameAttribute);

        let newValue = value;
        if (names.length > 1) {
            newValue = value.filter(attribute => !(isNameAttribute(attribute) && searchResultsAttributes.includes(attribute)));
        }

        setSearchResultAttributes(newValue);
    }, [searchResultsAttributes])

    function onLinkTypeChange({ target: { value } }) {
        setLinkType(value);
    }

    function onPageRouteChange({ target: { value } }) {
        setPageRoute(value);
    }

    function onPageAccountIdChange({ target: { value } }) {
        setPageAccountId(value);
    }

    function onPagePublisherChange({ target: { value } }) {
        setPagePublisher(value);
    }

    function onPageExtensionNameChange({ target: { value } }) {
        setPageExtensionName(value);
    }

    function onPageCardTypeChange({ target: { value } }) {
        setPageCardType(value);
    }

    function onErpIdentifierChange({ target: { value } }) {
        setErpIdentifier(value);
    }

    function onLinkNewTab({ target: { checked } }) {
        setLinkNewTab(checked);
    }

    function onLinkUrlChange({ target: { value } }) {
        setLinkUrl(value);
    }

    return (
        <div className={classes.root} ref={rootRef}>
            <Grid container spacing={4}>
                <Grid item xs={12} lg={6}>
                    <Grid container spacing={2} direction='column'>
                        <Grid item classes={{ item: classes.gridItem }}>
                            <Typography variant='h4' component='div'>
                                {intl.formatMessage({id: 'search-header'})}
                            </Typography>
                        </Grid>
                        <Grid item classes={{ item: classes.gridItem }}>
                            <Dropdown
                                className={classes.field}
                                label={intl.formatMessage({id: 'search-by'})}
                                onChange={onSearchByChange}
                                multiple
                                required={true}
                                value={searchBy}
                                helperText={intl.formatMessage({id: 'search-by-instructions'})}
                            >
                                {searchByItems.map(item => {
                                    return (
                                        <DropdownItem
                                            key={item.key}
                                            label={item.label}
                                            value={item.key}
                                        />
                                    );
                                })}
                            </Dropdown>
                        </Grid>
                        <Grid item classes={{ item: classes.gridItem }}>
                            <Dropdown
                                className={classes.field}
                                label={intl.formatMessage({id: 'search-role'})}
                                onChange={onSearchRoleChange}
                                value={searchRole}
                                helperText={intl.formatMessage({id: 'search-role-instructions'})}
                            >
                                {searchRoles.map(role => {
                                return (
                                    <DropdownItem
                                        key={role}
                                        label={role}
                                        value={role}
                                    />
                                    );
                                })}
                            </Dropdown>
                        </Grid>
                        <Grid item classes={{ item: classes.gridItem }}>
                            <Typography variant='h4' component='div'>
                                {intl.formatMessage({id: 'search-results-header'})}
                            </Typography>
                        </Grid>
                        <Grid item classes={{ item: classes.gridItem }}>
                            <Dropdown
                                className={classes.field}
                                label={intl.formatMessage({id: 'search-results-attributes'})}
                                onChange={onSearchResultAttributesChange}
                                multiple
                                required={true}
                                value={searchResultsAttributes}
                                helperText={intl.formatMessage({id: 'search-results-instructions'})}
                            >
                                {searchResultsAttributesItems.map(item => {
                                    return (
                                        <DropdownItem
                                            key={item.key}
                                            label={item.label}
                                            value={item.key}
                                        />
                                    );
                                })}
                            </Dropdown>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12} lg={6}>
                    <Grid container spacing={2} direction={'column'}>
                        <Grid item classes={{ item: classes.gridItem }}>
                            <Typography variant='h4' component='div'>
                                {intl.formatMessage({id: 'search-instructions-header'})}
                            </Typography>
                        </Grid>
                        <Grid item classes={{ item: classes.gridItem }}>
                            <DropdownTypeahead
                                id='instructions-icon-dropdown-typeahead'
                                label={intl.formatMessage({id: 'instructions-icon'})}
                                onChange={onIconChange}
                                value={instructionsIconName}
                                showItemIcon
                                helperText={intl.formatMessage({id: 'instructions-icon-instructions'})}
                            >
                                {icons.map(iconName => {
                                    return (
                                        <DropdownTypeaheadItem
                                            key={iconName}
                                            LeftIconComponent={<Icon name={iconName} />}
                                            label={iconName}
                                            value={iconName}
                                        />
                                    );
                                })}
                            </DropdownTypeahead>
                        </Grid>
                        <Grid item classes={{ item: classes.gridItem }}>
                            <TextField
                                id='card-message-header'
                                className={classes.field}
                                label={intl.formatMessage({id: 'instructions-header'})}
                                onChange={onMessageHeaderChange}
                                placeholder={intl.formatMessage({ id: 'enter-message-header'})}
                                value={instructionsMessageHeader}
                                type='text'
                                helperText={intl.formatMessage({id: 'instructions-header-instructions'})}
                            />
                        </Grid>
                        <Grid item classes={{ item: classes.gridItem }}>
                            <TextField
                                id='card-message'
                                className={classes.field}
                                label={intl.formatMessage({id: 'instructions-message'})}
                                onChange={onMessageChange}
                                placeholder={intl.formatMessage({ id: 'enter-description-text' })}
                                value={instructionsMessage}
                                type='text'
                                helperText={intl.formatMessage({id: 'instructions-message-instructions'})}
                            />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12} lg={6}>
                    <Grid container spacing={2} direction={'column'}>
                        <Grid item classes={{ item: classes.gridItem }}>
                            <Typography variant='h4' component='div'>
                                {intl.formatMessage({id: 'link-header'})}
                            </Typography>
                        </Grid>
                        <Grid item classes={{ item: classes.gridItem }}>
                            <Dropdown
                                className={classes.field}
                                label={intl.formatMessage({id: 'erp-identifier'})}
                                onChange={onErpIdentifierChange}
                                value={erpIdentifier}
                                helperText={intl.formatMessage({id: 'erp-identifier-instructions'})}
                            >
                                {erpIdTypes.map(type => {
                                    return (
                                        <DropdownItem
                                            key={type}
                                            label={type}
                                            value={type}
                                        />
                                    );
                                })}
                            </Dropdown>
                        </Grid>
                        <Grid item classes={{ item: classes.gridItem }}>
                            <RadioGroup
                                onChange={onLinkTypeChange}
                                value={linkType}
                                row
                            >
                                <FormControlLabel
                                    value={linkTypes.PAGE}
                                    control={<Radio/>}
                                    label={intl.formatMessage({id: 'link-type-page'})}
                                />
                                <FormControlLabel
                                    value={linkTypes.URL}
                                    control={<Radio/>}
                                    label={intl.formatMessage({id: 'link-type-url'})}
                                />
                            </RadioGroup>
                        </Grid>
                        {linkType === linkTypes.PAGE && (
                            <>
                                <Grid item classes={{ item: classes.gridItem }}>
                                    <TextField
                                        className={classes.field}
                                        label={intl.formatMessage({id: 'page-route'})}
                                        onChange={onPageRouteChange}
                                        placeholder={intl.formatMessage({ id: 'page-route-placeholder'})}
                                        value={pageRoute}
                                        type='text'
                                        helperText={intl.formatMessage({id: 'page-route-instructions'})}
                                    />
                                </Grid>
                                <Grid item classes={{ item: classes.gridItem }}>
                                    <TextField
                                        className={classes.field}
                                        label={intl.formatMessage({id: 'page-account-id'})}
                                        onChange={onPageAccountIdChange}
                                        placeholder={intl.formatMessage({ id: 'page-account-id-placeholder'})}
                                        value={pageAccountId}
                                        type='text'
                                        helperText={intl.formatMessage({id: 'page-account-id-instructions'})}
                                    />
                                </Grid>
                                <Grid item classes={{ item: classes.gridItem }}>
                                    <TextField
                                        className={classes.field}
                                        label={intl.formatMessage({id: 'page-publisher'})}
                                        onChange={onPagePublisherChange}
                                        placeholder={intl.formatMessage({ id: 'page-publisher-placeholder'})}
                                        value={pagePublisher}
                                        type='text'
                                        helperText={intl.formatMessage({id: 'page-publisher-instructions'})}
                                    />
                                </Grid>
                                <Grid item classes={{ item: classes.gridItem }}>
                                    <TextField
                                        className={classes.field}
                                        label={intl.formatMessage({id: 'page-extension-name'})}
                                        onChange={onPageExtensionNameChange}
                                        placeholder={intl.formatMessage({ id: 'page-extension-name-placeholder'})}
                                        value={pageExtensionName}
                                        type='text'
                                        helperText={intl.formatMessage({id: 'page-extension-name-instructions'})}
                                    />
                                </Grid>
                                <Grid item classes={{ item: classes.gridItem }}>
                                    <TextField
                                        className={classes.field}
                                        label={intl.formatMessage({id: 'page-card-type'})}
                                        onChange={onPageCardTypeChange}
                                        placeholder={intl.formatMessage({ id: 'page-card-type-placeholder'})}
                                        value={pageCardType}
                                        type='text'
                                        helperText={intl.formatMessage({id: 'page-card-type-instructions'})}
                                    />
                                </Grid>
                            </>
                        )}
                        {linkType === linkTypes.URL && (
                            <>
                                <Grid item classes={{ item: classes.gridItem }}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={linkNewTab}
                                                onChange={onLinkNewTab}
                                                value="linkNewTab"
                                                helperText={intl.formatMessage({id: 'open-in-new-tab-instructions'})}
                                            />
                                        }
                                        label={intl.formatMessage({ id: 'link-new-tab'})}
                                    />
                                </Grid>
                                <Grid item classes={{ item: classes.gridItem }}>
                                    <TextField
                                        className={classes.field}
                                        label={intl.formatMessage({id: 'link-url'})}
                                        onChange={onLinkUrlChange}
                                        placeholder={intl.formatMessage({ id: 'link-url-placeholder'})}
                                        value={linkUrl}
                                        type='text'
                                        helperText={intl.formatMessage({id: 'link-url-instructions'})}
                                    />
                                </Grid>
                            </>
                        )}
                    </Grid>
                </Grid>
                <Grid item xs={12} lg={6}>
                    <Grid container spacing={2} direction={'column'}>
                        <Grid item classes={{ item: classes.gridItem }}>
                            <Typography variant='h4' component='div'>
                                {intl.formatMessage({id: 'preview-mode-header'})}
                            </Typography>
                        </Grid>
                        <Grid item classes={{ item: classes.gridItem }}>
                            <RadioGroup
                                onChange={onPreviewModeChange}
                                value={previewMode}
                                row
                            >
                                <FormControlLabel
                                    value='instructions'
                                    control={<Radio/>}
                                    label={intl.formatMessage({id: 'preview-mode-instructions'})}
                                />
                                <FormControlLabel
                                    value='results'
                                    control={<Radio/>}
                                    label={intl.formatMessage({id: 'preview-mode-results'})}
                                />
                            </RadioGroup>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </div>
    )
}

export default withIntl(CardConfiguration);