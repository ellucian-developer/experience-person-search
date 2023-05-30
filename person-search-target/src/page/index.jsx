// Copyright 2021-2023 Ellucian Company L.P. and its affiliates.

import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import { usePageInfo } from '@ellucian/experience-extension-utils';

import Profile from './Profile';

export default function Page() {
    const { basePath } = usePageInfo();

    return (
        <Router basename={basePath}>
            <Switch>
                <Route path="/profile/:personId" render={() => (
                    <Profile/>
                )}/>
            </Switch>
        </Router>
    );
}