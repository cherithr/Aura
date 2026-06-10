import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { MainLayout } from './components/layout';
import { Dashboard } from './components/dashboard/Dashboard';
import { KanbanBoard } from './components/kanban';
import { TimelineView } from './components/timeline/TimelineView';
import { ContextGraph } from './components/context-graph/ContextGraph';
import { TelemetryFeed } from './components/telemetry/TelemetryFeed';
import { TeamView } from './components/collaboration/TeamView';
import { SettingsView } from './components/settings/SettingsView';
import { AuthPage } from './components/auth/AuthPage';
import { useUIStore } from './store';
import type { ViewMode } from './types';

const views: Record<ViewMode, React.ComponentType> = {
  dashboard: Dashboard,
  kanban: KanbanBoard,
  timeline: TimelineView,
  'context-graph': ContextGraph,
  telemetry: TelemetryFeed,
  team: TeamView,
  settings: SettingsView,
};

function AppContent() {
  const { user, loading, signOut } = useAuth();
  const { currentView, setCommandCenterOpen, setTaskModalOpen, setProjectModalOpen, commandCenterOpen } = useUIStore();

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Command/Ctrl + K - Open Command Center
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandCenterOpen(!commandCenterOpen);
        return;
      }

      // N - New Task
      if (e.key === 'n' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setTaskModalOpen(true);
        return;
      }

      // P - New Project
      if (e.key === 'p' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setProjectModalOpen(true);
        return;
      }

      // Escape - Close modals
      if (e.key === 'Escape') {
        setCommandCenterOpen(false);
        setTaskModalOpen(false);
        setProjectModalOpen(false);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandCenterOpen, setCommandCenterOpen, setTaskModalOpen, setProjectModalOpen]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-aura-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-aura-primary to-aura-primary-light flex items-center justify-center animate-pulse">
            <span className="text-white text-xl">A</span>
          </div>
          <div className="text-aura-text-secondary text-sm">Loading...</div>
        </div>
      </div>
    );
  }

  // Show auth page if not logged in
  if (!user) {
    return <AuthPage />;
  }

  // Main app
  const CurrentView = views[currentView] || Dashboard;

  return (
    <MainLayout signOut={signOut}>
      <AnimatePresence mode="wait">
        <CurrentView />
      </AnimatePresence>
    </MainLayout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
