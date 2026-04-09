import { Link, useRouterState } from '@tanstack/react-router';
import { useGetMetadata, useGetCallerUserProfile } from '../hooks/useQueries';
import LoginButton from './LoginButton';
import { Settings, HelpCircle, Package } from 'lucide-react';
import { Separator } from './ui/separator';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { data: metadata } = useGetMetadata();
  const { data: userProfile } = useGetCallerUserProfile();
  const router = useRouterState();
  const currentPath = router.location.pathname;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
              <img src="/assets/generated/rat-g700-logo.dim_512x512.png" alt="RAT G700" className="h-10 w-10" />
              <div>
                <h1 className="text-xl font-bold tracking-tight">RAT G700</h1>
                {metadata && (
                  <p className="text-xs text-muted-foreground">{metadata.description}</p>
                )}
              </div>
            </Link>
          </div>

          <nav className="flex items-center gap-6">
            <Link
              to="/"
              className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                currentPath === '/' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Package className="h-4 w-4" />
              Builds
            </Link>
            <Link
              to="/help"
              className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                currentPath === '/help' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <HelpCircle className="h-4 w-4" />
              Help
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-3">
              {userProfile && (
                <span className="text-sm text-muted-foreground">
                  {userProfile.name}
                </span>
              )}
              <LoginButton />
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t border-border bg-card py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026. Built with ❤️ using{' '}
          <a href="https://caffeine.ai" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
            caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
