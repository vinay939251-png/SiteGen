/* ─── Loading Screen ─── */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LOADING_STEPS = [
  'Initializing SiteGen...',
  'Loading Hyderabad site data...',
  'Applying zoning parameters...',
  'Generating development envelope...',
  'Calculating feasibility...',
  'Preparing 3D visualization...',
];

export function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setStep((prev) => {
        if (prev >= LOADING_STEPS.length - 1) {
          clearInterval(stepInterval);
          setTimeout(onComplete, 150);
          return prev;
        }
        return prev + 1;
      });
    }, 90);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 4;
      });
    }, 15);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  return (
    <motion.div
      className="loading-screen"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onComplete}
      title="Click to skip"
    >
      <div className="loading-content">
        <motion.div
          className="loading-logo"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="loading-logo-text">SITEGEN</span>
          <span className="loading-logo-sub">Land Feasibility Intelligence</span>
        </motion.div>

        <div className="loading-progress-container">
          <div className="loading-progress-bar">
            <motion.div
              className="loading-progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            className="loading-step-text"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            {LOADING_STEPS[step]}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
