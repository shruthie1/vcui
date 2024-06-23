// AppRouter.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Idle from './idle';

const AppRouter = () => {
    return (
        <Router>
            <Routes>
                <Route path="/:profile/:chatId" element={<Idle />} />
                <Route path="/:profile/:chatId/:defvid" element={<Idle />} />
                <Route path="/:profile/:chatId/:defvid/:force" element={<Idle />} />
            </Routes>
        </Router>
    );
};

export default AppRouter;
