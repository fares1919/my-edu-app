import { BrowserRouter } from 'react-router-dom';
import { AppProviders } from './providers';
import { AppRouter } from './router';
import { AppShell } from './layout/AppShell';

export function App() {
  return (
    <BrowserRouter>
      <AppProviders>
        <AppShell>
          <AppRouter />
        </AppShell>
      </AppProviders>
    </BrowserRouter>
  );
}
