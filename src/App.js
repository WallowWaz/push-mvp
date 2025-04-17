import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import { submitScore, fetchLeaderboard } from './score';

const lowercaseLetters = 'abcdefghijklmnopqrstuvwxyz';

export default function App() {
  const [targetLetter, setTargetLetter] = useState('');
  const [phase, setPhase] = useState('start'); // 'start' | 'playing' | 'gameover'
  const [timeLeft, setTimeLeft] = useState(700);
  const [score, setScore] = useState(0);
  const [letterTimestamp, setLetterTimestamp] = useState(0);
  const [lastPoints, setLastPoints] = useState(30);
  const [leaderboard, setLeaderboard] = useState([]);
  const [username, setUsername] = useState('');
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const timerRef = useRef(null);

  const generateLetter = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * lowercaseLetters.length);
    return lowercaseLetters[randomIndex];
  }, []);

  const startGame = useCallback(() => {
    setPhase('playing');
    setTimeLeft(700);
    setScore(0);
    setLastPoints(30);
    setScoreSubmitted(false);
    const firstLetter = generateLetter();
    setTargetLetter(firstLetter);
    setLetterTimestamp(Date.now());
  }, [generateLetter]);

  const handleKeyDown = useCallback(
    (e) => {
      if (phase !== 'playing') return;

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
        setPhase('gameover');
      }
    },
    [phase, targetLetter, generateLetter, letterTimestamp]
  );

  // Listen for keydown to start game from start screen
  useEffect(() => {
    if (phase === 'start') {
      const onAnyKey = (e) => {
        setPhase('playing');
        setTimeLeft(700);
        setScore(0);
        setLastPoints(30);
        setScoreSubmitted(false);
        const firstLetter = generateLetter();
        setTargetLetter(firstLetter);
        setLetterTimestamp(Date.now());
      };
      document.addEventListener('keydown', onAnyKey, { once: true });
      return () => document.removeEventListener('keydown', onAnyKey, { once: true });
    }
  }, [phase, generateLetter]);

  // Listen for keydown during game
  useEffect(() => {
    if (phase === 'playing') {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [handleKeyDown, phase]);

  // Timer effect
  useEffect(() => {
    if (phase === 'playing') {
      if (timeLeft > 0) {
        timerRef.current = setTimeout(() => {
          setTimeLeft(timeLeft - 10);
        }, 10);
      } else {
        setPhase('gameover');
      }
    } else {
      clearTimeout(timerRef.current);
    }
    return () => clearTimeout(timerRef.current);
  }, [phase, timeLeft]);

  // Fetch leaderboard when game is over
  useEffect(() => {
    if (phase === 'gameover') {
      fetchLeaderboard().then(setLeaderboard);
    }
  }, [phase]);

  // Submit score when user submits
  const handleSubmitScore = async () => {
    if (username && score > 0 && !scoreSubmitted) {
      await submitScore(username, score);
      setScoreSubmitted(true);
      fetchLeaderboard().then(setLeaderboard);
    }
  };

  // Pie timer helpers
  const describeArc = (x, y, radius, startAngle, endAngle) => {
    const start = polarToCartesian(x, y, radius, startAngle);
    const end = polarToCartesian(x, y, radius, endAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
      "M", x, y,
      "L", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 1, end.x, end.y,
      "Z"
    ].join(" ");
  };

  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  // Timer color based on lastPoints
  let timerColor = '#888';
  if (phase === 'playing' && score > 0) {
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
      {phase === 'start' && (
        <div className="start-screen">
          <h2>Press any key to start</h2>
        </div>
      )}
      {phase === 'playing' && (
        <div className="game-play">
          <div className="score" style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 16 }}>
            Score: {score}
          </div>
          <div className="timer-wrapper" style={{ position: 'relative' }}>
            <svg className="timer-circle" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="#eee"
              />
              <path
                d={describeArc(50, 50, 45, 0, 360 - endAngle)}
                fill={timerColor}
              />
            </svg>
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
      {phase === 'gameover' && (
        <div className="game-over">
          <h2>Game Over</h2>
          <div style={{ fontSize: 24, margin: '20px 0' }}>
            Your Score: <strong>{score}</strong>
          </div>
          <div style={{ margin: '16px 0' }}>
            <input
              type="text"
              placeholder="Enter your name"
              value={username}
              maxLength={16}
              onChange={e => setUsername(e.target.value)}
              style={{ fontSize: 18, padding: 4, marginRight: 8 }}
              disabled={scoreSubmitted}
            />
            <button
              className="matte-btn"
              onClick={handleSubmitScore}
              disabled={!username || scoreSubmitted || score === 0}
              style={{ marginRight: 8 }}
            >
              Submit Score
            </button>
            <button
              className="matte-btn"
              onClick={() => setPhase('start')}
            >
              Restart
            </button>
          </div>
          <h3>Leaderboard</h3>
          <ol style={{ textAlign: 'left', maxWidth: 300, margin: '0 auto' }}>
            {leaderboard.map((entry, idx) => (
              <li key={idx}>
                {entry.username || 'Anonymous'}: {entry.score}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
