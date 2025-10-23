import { ThemeProvider } from './presentation/contexts/ThemeContext';
import { Layout } from './presentation/components/layout/Layout';

function App() {
  return (
    <ThemeProvider>
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-4xl font-bold mb-4 text-[rgb(var(--color-foreground))]">
            Welcome to Worlds Simulator
          </h2>
          <p className="text-lg text-[rgb(var(--color-muted-foreground))] mb-6">
            Simulate the League of Legends World Championship
          </p>
          <p className="text-sm text-[rgb(var(--color-muted-foreground))]">
            Tournament functionality coming soon...
          </p>
        </div>
      </Layout>
    </ThemeProvider>
  );
}

export default App;
