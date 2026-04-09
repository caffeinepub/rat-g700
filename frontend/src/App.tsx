import { createRouter, RouterProvider, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import AuthGate from './components/AuthGate';
import ProfileSetupDialog from './components/ProfileSetupDialog';
import AppShell from './components/AppShell';
import BuildsPage from './pages/BuildsPage';
import BuildDetailPage from './pages/BuildDetailPage';
import HelpAboutPage from './pages/HelpAboutPage';
import FirstRunSetupPage from './pages/FirstRunSetupPage';
import { useGetMetadata } from './hooks/useQueries';

function Layout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

function AppContent() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched: profileFetched } = useGetCallerUserProfile();
  const { data: metadata, isLoading: metadataLoading, isFetched: metadataFetched } = useGetMetadata();

  const isAuthenticated = !!identity;

  // Show profile setup if authenticated but no profile exists
  const showProfileSetup = isAuthenticated && !profileLoading && profileFetched && userProfile === null;

  // Show first-run setup if authenticated, has profile, but no metadata
  const showFirstRunSetup = isAuthenticated && !metadataLoading && metadataFetched && metadata === null && userProfile !== null;

  if (showProfileSetup) {
    return <ProfileSetupDialog />;
  }

  if (showFirstRunSetup) {
    return <FirstRunSetupPage />;
  }

  return <Outlet />;
}

const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: AppContent,
});

const buildsRoute = createRoute({
  getParentRoute: () => indexRoute,
  path: '/',
  component: BuildsPage,
});

const buildDetailRoute = createRoute({
  getParentRoute: () => indexRoute,
  path: '/build/$buildId',
  component: BuildDetailPage,
});

const helpRoute = createRoute({
  getParentRoute: () => indexRoute,
  path: '/help',
  component: HelpAboutPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute.addChildren([buildsRoute, buildDetailRoute, helpRoute]),
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <AuthGate>
      <RouterProvider router={router} />
    </AuthGate>
  );
}
