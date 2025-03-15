// AppRouter.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
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
            <Routes>
                <Route path="/:profile/:chatId" Component={Idle} />
                <Route path="/:profile/:chatId/:defvid" Component={Idle} />
                <Route path="/:profile/:chatId/:defvid/:force" Component={Idle} />
            </Routes>
        </Router>
    );
};

export default AppRouter;
