import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';

const lowercaseLetters = 'abcdefghijklmnopqrstuvwxyz';

export default function App() {
  const [targetLetter, setTargetLetter] = useState('');
  const [gameOver, setGameOver] = useState(true);
  const [timeLeft, setTimeLeft] = useState(700);
  const [score, setScore] = useState(0);
  const [letterTimestamp, setLetterTimestamp] = useState(0);
  const [lastPoints, setLastPoints] = useState(30); // Default to green
  const timerRef = useRef(null);

  const generateLetter = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * lowercaseLetters.length);
    return lowercaseLetters[randomIndex];
  }, []);

  const startGame = useCallback(() => {
    setGameOver(false);
    setTimeLeft(700);
    setScore(0);
    setLastPoints(30);
    const firstLetter = generateLetter();
    setTargetLetter(firstLetter);
    setLetterTimestamp(Date.now());
  }, [generateLetter]);

  const handleKeyDown = useCallback(
    (e) => {
      if (gameOver) return;

      if (e.key === targetLetter) {
        clearTimeout(timerRef.current);

        const reactionTime = Date.now() - letterTimestamp;
        let points = 0;
        if (reactionTime <= 550) {
          points = 30;
        } else if (reactionTime <= 700) {
          points = 20;
        } else {
          points = 10;
        }
        setScore((prev) => prev + points);
        setLastPoints(points);

        const nextLetter = generateLetter();
        setTargetLetter(nextLetter);
        setTimeLeft(700);
        setLetterTimestamp(Date.now());
      } else {
        setGameOver(true);
      }
    },
    [gameOver, targetLetter, generateLetter, letterTimestamp]
  );

  // Listen for keydown to start game when gameOver
  useEffect(() => {
    if (gameOver) {
      const onAnyKey = (e) => {
        startGame();
      };
      document.addEventListener('keydown', onAnyKey, { once: true });
      return () => document.removeEventListener('keydown', onAnyKey, { once: true });
    }
  }, [gameOver, startGame]);

  // Listen for keydown during game
  useEffect(() => {
    if (!gameOver) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [handleKeyDown, gameOver]);

  useEffect(() => {
    if (!gameOver) {
      if (timeLeft > 0) {
        timerRef.current = setTimeout(() => {
          setTimeLeft(timeLeft - 10);
        }, 10);
      } else {
        setGameOver(true);
      }
    } else {
      clearTimeout(timerRef.current);
    }
    return () => clearTimeout(timerRef.current);
  }, [gameOver, timeLeft]);

  // Pie timer helpers
  const describeArc = (x, y, radius, startAngle, endAngle) => {
    const start = polarToCartesian(x, y, radius, startAngle);
    const end = polarToCartesian(x, y, radius, endAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1"; // Corrected largeArcFlag
    return [
      "M", x, y,
      "L", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 1, end.x, end.y, // sweep-flag = 1
      "Z"
    ].join(" ");
  };

  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    // Subtract 90 degrees to make 0 degrees point to the top
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  // Timer color based on lastPoints
  let timerColor = '#888'; // Neutral grey
  if (score > 0) {
    if (lastPoints === 30) {
      timerColor = 'limegreen';
    } else if (lastPoints === 20) {
      timerColor = 'orange';
    } else if (lastPoints === 10) {
      timerColor = 'red';
    }
  }

  // Calculate the angle for the pie fill
  const percent = timeLeft / 700;
  const endAngle = 360 * percent;

  return (
    <div className="game-container">
      {gameOver ? (
        <div className="game-over">
          <h2>Press any key to start</h2>
        </div>
      ) : (
        <div className="game-play">
          <div className="score" style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 16 }}>
            Score: {score}
          </div>
          <div className="timer-wrapper" style={{ position: 'relative' }}>
            <svg className="timer-circle" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="#eee"
              />
              {/* Pie fill path */}
              <path
                d={describeArc(50, 50, 45, 0, 360 - endAngle)}
                fill={timerColor}
              />
            </svg>
            {/* Last points display at top right of timer, diagonal, only after first round */}
            {score > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: 6,
                  right: 12,
                  fontSize: 22,
                  fontWeight: 'bold',
                  color: timerColor,
                  pointerEvents: 'none',
                  userSelect: 'none',
                  textShadow: '1px 1px 4px #fff',
                  zIndex: 2,
                  transform: 'rotate(-25deg)',
                }}
              >
                +{lastPoints}
              </div>
            )}
            <div className="target-letter" style={{ color: 'black' }}>{targetLetter}</div>
          </div>
        </div>
      )}
    </div>
  );
}
