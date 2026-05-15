# Auth feature

Fase 1. Implementar:

- `auth.api.ts` — `register`, `login`, `refresh`, `logout` (POST `/api/v1/auth/*`)
- `useLogin`, `useRegister` — React Query mutations
- `LoginScreen`, `RegisterScreen` — React components
- `auth.guard.tsx` — redirect a `/login` cuando no haya sesión

No tocar `engine/` ni `network/` desde aquí.
