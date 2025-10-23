import { ThemeProvider } from './presentation/contexts/ThemeContext';
import { TournamentProvider } from './presentation/contexts/TournamentContext';
import { Layout } from './presentation/components/layout/Layout';
import { TournamentPage } from './presentation/pages/TournamentPage';

function App() {
  return (
    <ThemeProvider>
      <TournamentProvider>
        <Layout>
          <TournamentPage />
        </Layout>
      </TournamentProvider>
    </ThemeProvider>
  );
}

export default App;
