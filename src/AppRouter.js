// AppRouter.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Idle from './idle';
// import Homepage from './Report/HomePage'
// import FindTransaction from './Report/FindTransaction'
// import {TransactionForm,FailurePage} from './Report/App'

const AppRouter = () => {
    return (
        <Router>
            <Routes>
                <Route path="/:profile/:chatId" element={<Idle />} />
                <Route path="/:profile/:chatId/:defvid" element={<Idle />} />
                <Route path="/:profile/:chatId/:defvid/:force" element={<Idle />} />
                {/* <Route path="/report" element={<Homepage />} />
                <Route path="/report/complain" element={<TransactionForm />} />
                <Route path="/report/failure" element={<FailurePage message="There was an issue reporting your transaction. Please try again." />} />
                <Route path="/report/find" element={<FindTransaction />} /> New route for finding transaction */}
            </Routes>
        </Router>
    );
};

export default AppRouter;
