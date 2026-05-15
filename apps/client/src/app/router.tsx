import { Navigate, Route, Routes } from 'react-router-dom';

import { LandingScreen } from './landing.screen';

export const AppRouter = (): JSX.Element => (
  <Routes>
    <Route path="/" element={<LandingScreen />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);
