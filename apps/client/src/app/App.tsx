import { Providers } from './providers';
import { AppRouter } from './router';

export const App = (): JSX.Element => (
  <Providers>
    <AppRouter />
  </Providers>
);
