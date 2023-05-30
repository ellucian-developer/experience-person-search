// Copyright 2021-2022 Ellucian Company L.P. and its affiliates.

import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';

import { withStyles } from '@ellucian/react-design-system/core/styles';

import { usePageControl } from '@ellucian/experience-extension-utils';

const styles = () => ({
    root:{}
});

function Page({classes}) {
    const { personId } = useParams();

    // Experience SDK hooks
    const { setPageTitle } = usePageControl();

    useEffect(() => {
        setPageTitle('Profile')
    }, []);

    return (
        <div className={classes.root}>
            {`Profile for user with ID: ${personId}`}
        </div>
    );
}

Page.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Page);