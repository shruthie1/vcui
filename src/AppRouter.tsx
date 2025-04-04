// AppRouter.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Idle from './idle';

export interface RouteParams {
    profile: string;
    chatId: string;
    defvid?: string;
    force?: string;
}

const AppRouter: React.FC = () => {
    return (
        <Router>
            <Switch>
                <Route path="/:profile/:chatId" component={Idle} />
                <Route path="/:profile/:chatId/:defvid" component={Idle} />
                <Route path="/:profile/:chatId/:defvid/:force" component={Idle} />
            </Switch>
        </Router>
    );
};

export default AppRouter;
