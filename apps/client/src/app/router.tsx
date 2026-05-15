import { Navigate, Route, Routes } from 'react-router-dom';

import { AuthGuard } from '../features/auth/auth.guard';
import { LoginScreen } from '../features/auth/login.screen';
import { RegisterScreen } from '../features/auth/register.screen';
import { LobbyScreen } from '../features/lobby/lobby.screen';
import { RoomScreen } from '../features/room/room.screen';

export const AppRouter = (): JSX.Element => (
  <Routes>
    <Route path="/login" element={<LoginScreen />} />
    <Route path="/register" element={<RegisterScreen />} />
    <Route
      path="/lobby"
      element={
        <AuthGuard>
          <LobbyScreen />
        </AuthGuard>
      }
    />
    <Route
      path="/room/:roomId"
      element={
        <AuthGuard>
          <RoomScreen />
        </AuthGuard>
      }
    />
    <Route path="/" element={<Navigate to="/lobby" replace />} />
    <Route path="*" element={<Navigate to="/lobby" replace />} />
  </Routes>
);
