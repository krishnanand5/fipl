import React, { useEffect, useRef, useState } from 'react';
import styles from './SplashScreen.module.css';
import confetti from 'canvas-confetti';

// Types
interface Winner {
  year: string;
  team: string;
}

interface SplashScreenProps {
  onComplete: () => void;
}

// Constants
const MESSAGE_DURATION = 1800; // 1.8 seconds per message
const INITIAL_DELAY = 0; // No initial delay

const historicalWinners: Winner[] = [
  { year: '2018', team: 'PZC' },
  { year: '2019', team: 'DT' },
  { year: '2020', team: 'UUCC' },
  { year: '2021', team: 'UUCC' },
  { year: '2022', team: 'UUCC' },
  { year: '2023', team: 'UUCC' },
  { year: '2024', team: 'PPT' },
];

// Confetti configuration
const confettiConfig = {
  startVelocity: 40,
  spread: 360,
  ticks: 100,
  zIndex: 0,
  gravity: 0.8,
  scalar: 1.5,
  colors: [
    '#FFD700', // Gold
    '#FF6B6B', // Coral Red
    '#4ECDC4', // Turquoise
    '#45B7D1', // Sky Blue
    '#96CEB4', // Mint
    '#FFEEAD', // Cream
    '#D4A5A5', // Dusty Rose
    '#9B59B6', // Purple
    '#E74C3C', // Bright Red
    '#2ECC71'  // Emerald
  ]
};

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  // Refs
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sequenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // State
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [show2025, setShow2025] = useState(false);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [displayedWinners, setDisplayedWinners] = useState<Winner[]>([]);
  const [sequenceComplete, setSequenceComplete] = useState(false);

  // Handlers
  const handleInteraction = async () => {
    if (!hasInteracted && audioRef.current) {
      try {
        await audioRef.current.play();
        setHasInteracted(true);
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    }
  };

  const triggerConfetti = () => {
    // Multiple bursts from different positions
    confetti({
      ...confettiConfig,
      particleCount: 300,
      origin: { x: 0.2, y: 0.3 },
      scalar: 2
    });
    confetti({
      ...confettiConfig,
      particleCount: 300,
      origin: { x: 0.8, y: 0.3 },
      scalar: 2
    });
    confetti({
      ...confettiConfig,
      particleCount: 300,
      origin: { x: 0.5, y: 0.3 },
      scalar: 2
    });

    // Additional bursts after a short delay
    setTimeout(() => {
      confetti({
        ...confettiConfig,
        particleCount: 200,
        origin: { x: 0.3, y: 0.4 },
        scalar: 2
      });
      confetti({
        ...confettiConfig,
        particleCount: 200,
        origin: { x: 0.7, y: 0.4 },
        scalar: 2
      });
    }, 500);
  };

  // Effects
  useEffect(() => {
    if (!isAudioPlaying) return;

    let currentStep = 0;
    const totalSteps = historicalWinners.length + 2; // historical winners + 2025 + congratulations

    const showNextStep = () => {
      if (currentStep < historicalWinners.length) {
        // Historical winners (2018-2024)
        const currentWinner = historicalWinners[currentStep];
        setCurrentIndex(currentStep);
        setShow2025(false);
        setShowCongratulations(false);
        
        // Add winner to displayed list after animation
        setTimeout(() => {
          setDisplayedWinners(prev => [...prev, currentWinner]);
        }, MESSAGE_DURATION * 0.8);
      } else if (currentStep === historicalWinners.length) {
        // 2025 winner
        setCurrentIndex(-1);
        setShow2025(true);
        setShowCongratulations(false);

        // Add 2025 winner to Hall of Fame after animation
        setTimeout(() => {
          setDisplayedWinners(prev => [...prev, { year: '2025', team: 'PPT' }]);
        }, MESSAGE_DURATION * 0.8);
      } else if (currentStep === historicalWinners.length + 1) {
        // Final congratulations
        setCurrentIndex(-1);
        setShow2025(false);
        setShowCongratulations(true);
        triggerConfetti();
      }

      currentStep++;
    };

    // Start with first winner
    const initialTimeout = setTimeout(() => {
      showNextStep();
      
      // Then start the interval for subsequent messages
      const interval = setInterval(() => {
        if (currentStep >= totalSteps) {
          clearInterval(interval);
          setSequenceComplete(true);
          onComplete();
          return;
        }
        showNextStep();
      }, MESSAGE_DURATION);

      // Cleanup function
      return () => {
        clearInterval(interval);
      };
    }, INITIAL_DELAY);

    return () => {
      clearTimeout(initialTimeout);
    };
  }, [isAudioPlaying, onComplete]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => {
      setIsAudioPlaying(true);
    };

    const handleEnded = () => {};

    const handleError = (error: Event) => {
      console.error('Audio error:', error);
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  // Render helpers
  const renderContent = () => {
    if (!hasInteracted) {
      return (
        <h1 className={styles.text}>
          TOUCH TO BEGIN
        </h1>
      );
    }

    if (showCongratulations) {
      return (
        <h1 className={styles.text}>
          CONGRATULATIONS PPT!
        </h1>
      );
    }

    if (show2025) {
      return (
        <h1 className={styles.text}>
          2025 - PPT
        </h1>
      );
    }

    if (currentIndex >= 0) {
      const winner = historicalWinners[currentIndex];
      return (
        <h1 className={styles.text}>
          {winner.year} - {winner.team}
        </h1>
      );
    }

    return null;
  };

  // Don't render if sequence is complete
  if (sequenceComplete) {
    return null;
  }

  return (
    <div 
      className={styles.splashContainer} 
      onClick={handleInteraction}
      style={{ cursor: 'pointer' }}
    >
      <canvas ref={canvasRef} className={styles.canvas} />
      {renderContent()}
      {hasInteracted && (
        <div className={styles.hallOfFame}>
          <h2 className={styles.hallOfFameTitle}>HALL OF FAME</h2>
          <div className={styles.winnersList}>
            {displayedWinners.map((winner, index) => (
              <div key={winner.year} className={styles.winnerEntry} style={{ animationDelay: `${index * 0.1}s` }}>
                <div className={styles.winnerYear}>{winner.year}</div>
                <div className={styles.winnerTeam}>{winner.team}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      <audio
        ref={audioRef}
        src="/fipl/assets/audio/splash.mp3"
        preload="auto"
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default SplashScreen; 