/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DataProvider } from './store/DataContext';
import { Layout } from './components/Layout';
import Today from './pages/Today';
import CalendarPage from './pages/Calendar';
import Tasks from './pages/Tasks';
import Study from './pages/Study';
import WeeklyReport from './pages/WeeklyReport';
import Subjects from './pages/Subjects';
import Settings from './pages/Settings';

export default function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Today />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="study" element={<Study />} />
            <Route path="weekly-report" element={<WeeklyReport />} />
            <Route path="subjects" element={<Subjects />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DataProvider>
  );
}
