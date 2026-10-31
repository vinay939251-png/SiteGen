import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { TopBar } from './components/layout/TopBar';
import { LeftPanel } from './components/panels/LeftPanel';
import { RightPanel } from './components/panels/RightPanel';
import { BottomPanel } from './components/panels/BottomPanel';
import { SceneCanvas } from './components/building/SceneCanvas';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { ScenarioModal } from './components/scenarios/ScenarioModal';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <>
      <AnimatePresence>
        {isLoading && <LoadingScreen onComplete={handleLoadComplete} />}
      </AnimatePresence>

      <div className="app-layout" style={{ opacity: isLoading ? 0 : 1, transition: 'opacity 0.4s ease' }}>
        <TopBar />
        <div className="app-content">
          <LeftPanel />
          <SceneCanvas />
          <RightPanel />
        </div>
        <BottomPanel />
      </div>

      <ScenarioModal />
    </>
  );
}
