import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';

const lowercaseLetters = 'abcdefghijklmnopqrstuvwxyz';
const uppercaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export default function App() {
  const [targetLetter, setTargetLetter] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(1200); // Make the initial timer slightly faster
  const [gameOver, setGameOver] = useState(true); // Start in pre-game state
  const timerRef = useRef(null);
  const [availableLetters, setAvailableLetters] = useState(lowercaseLetters);
  const [letterTimestamp, setLetterTimestamp] = useState(0); // Timestamp when the current letter appeared
  const [speedIndicator, setSpeedIndicator] = useState(''); // To display 'average', 'good', 'amazing'
  const [gameStartTime, setGameStartTime] = useState(0); // Timestamp when the game started
  const [roundCount, setRoundCount] = useState(0); // Track successful rounds
  const inputRef = useRef(null); // Ref for the hidden input

  // Basic mobile detection (can be improved)
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);

  // Effect to update the available letters based on ROUND COUNT
  useEffect(() => {
    let currentPool = lowercaseLetters;
    // Lower round thresholds (e.g., 15, 30, 45 rounds)
    if (roundCount >= 45) { // Round 45+: All capitals
      currentPool += uppercaseLetters;
    } else if (roundCount >= 30) { // Round 30-44: Add first 15 capitals
      currentPool += uppercaseLetters.substring(0, 15);
    } else if (roundCount >= 15) { // Round 15-29: Add first 5 capitals
      currentPool += uppercaseLetters.substring(0, 5);
    }

    // Update state only if the pool has changed
    setAvailableLetters((prevAvailableLetters) => {
        if (currentPool !== prevAvailableLetters) {
            console.log(`Round: ${roundCount}, Updated letter pool size: ${currentPool.length}`);
            return currentPool;
        }
        return prevAvailableLetters; // No change needed
    });

  }, [roundCount]); // Rerun effect only when roundCount changes

  const generateLetter = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * availableLetters.length);
    const letter = availableLetters[randomIndex];
    console.log('Generated letter:', letter, 'from pool size:', availableLetters.length);
    return letter;
  }, [availableLetters]);

  // Function to focus the hidden input on mobile
  const focusInput = useCallback(() => {
    if (isMobile && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isMobile]); // Dependency on isMobile

  const startGame = useCallback(() => {
    setScore(0);
    setTimeLeft(1200);
    setGameOver(false);
    const initialLetters = lowercaseLetters;
    setAvailableLetters(initialLetters);
    const firstLetterIndex = Math.floor(Math.random() * initialLetters.length);
    const firstLetter = initialLetters[firstLetterIndex];
    setTargetLetter(firstLetter);
    setLetterTimestamp(Date.now());
    setSpeedIndicator('');
    setGameStartTime(Date.now()); // Keep gameStartTime if needed elsewhere, or remove if not
    setRoundCount(0); // Reset round count on new game
    console.log('startGame set targetLetter to:', firstLetter);
    focusInput(); // Focus input on game start
  }, [focusInput]); // Add focusInput dependency

  const handleKeyDown = useCallback((e) => {
    // If game is over (or hasn't started), listen for 'R' to start/restart
    if (gameOver) {
      if (e.key.toLowerCase() === 'r') {
        console.log("Starting/Restarting game with 'R' key");
        startGame();
      }
      return; // Ignore other keys when game is over/not started
    }

    // --- Game is active ---
    if (!/^[a-zA-Z]$/.test(e.key)) return;
    if (!targetLetter) return; // Should not happen if game is active

    console.log("Pressed:", e.key, "Target:", targetLetter);

    if (e.key === targetLetter) {
      clearTimeout(timerRef.current);

      // --- Calculate Reaction Time & Score ---
      const reactionTime = Date.now() - letterTimestamp;
      let points = 0;
      let indicator = '';

      // Define time thresholds - Increase threshold for "Amazing!"
      if (reactionTime <= 500) { // Changed from 400ms to 500ms
        points = 30;
        indicator = 'Amazing!';
      } else if (reactionTime <= 800) { // Keep "Good!" threshold
        points = 20;
        indicator = 'Good!';
      } else { // Average or slower
        points = 10;
        indicator = 'Average';
      }
      console.log(`Reaction: ${reactionTime}ms, Points: ${points}, Indicator: ${indicator}`);

      setScore((prevScore) => prevScore + points);
      setSpeedIndicator(indicator); // Set the indicator text
      setRoundCount((prevRoundCount) => prevRoundCount + 1); // Increment round count

      // --- Generate Next Letter & Record Timestamp ---
      const nextLetter = generateLetter();
      setTargetLetter(nextLetter);
      setLetterTimestamp(Date.now()); // Record timestamp for the new letter
      focusInput(); // Re-focus input after correct key

    } else {
      setGameOver(true); // End the game on wrong key
      setSpeedIndicator(''); // Clear indicator on game over
    }
  }, [targetLetter, gameOver, generateLetter, startGame, letterTimestamp, focusInput]); // Add focusInput dependency

  // Effect for adding/removing the keydown listener (no change needed)
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Timer effect (no change needed)
  useEffect(() => {
    if (!gameOver && targetLetter) {
      clearTimeout(timerRef.current);
      const currentLetter = targetLetter;
      timerRef.current = setTimeout(() => {
        setGameOver((prevGameOver) => {
          if (!prevGameOver && targetLetter === currentLetter) {
            return true;
          }
          return prevGameOver;
        });
      }, timeLeft);
    } else { // Clear timer if game is over or targetLetter is missing
      clearTimeout(timerRef.current);
    }
    return () => clearTimeout(timerRef.current);
  }, [targetLetter, timeLeft, gameOver]);

  return (
    <div className="game-container">
      {/* Hidden Input for Mobile Keyboard */}
      <input
        ref={inputRef}
        type="text"
        readOnly // Prevent actual typing in this field if possible
        style={{
          position: 'absolute',
          left: '-9999px', // Move off-screen
          top: '-9999px',
          opacity: 0, // Make invisible
          pointerEvents: 'none', // Prevent interaction
        }}
        // Optional: Handle input event to clear it immediately if needed
        onInput={(e) => e.target.value = ''}
      />

      <h1>Type the Letter Game</h1>
      {gameOver ? (
        <div className="game-over">
          {/* Check score and targetLetter to differentiate initial state from actual game over */}
          {score === 0 && targetLetter === '' ? (
            <h2>Press 'R' to Start</h2>
          ) : (
            <>
              <h2>Game Over!</h2>
              <p>Your score: {score}</p>
              <button onClick={startGame}>Restart Game</button>
              <p>(Or press 'R')</p>
            </>
          )}
        </div>
      ) : (
        // Add onClick to game area to help focus input on mobile taps
        <div className="game-play" onClick={focusInput}>
          <p>Press the following letter:</p>
          <div className="target-letter">{targetLetter || '...'}</div>
          {/* Conditionally apply the 'amazing' or 'good' class */}
          {speedIndicator && (
            <p className={`speed-indicator ${
              speedIndicator === 'Amazing!' ? 'amazing' : speedIndicator === 'Good!' ? 'good' : '' // Average uses base style
            }`}>
              {speedIndicator}
            </p>
          )}
          <p>Score: {score}</p>
          <p>Rounds: {roundCount}</p>
        </div>
      )}
    </div>
  );
}
