import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import './TypingTest.css';
import StatsPanel from './StatsPanel';
import Graph from './Graph';
import Login from './Login';

function TypingTest({ user, onLogin, onLogout, onBack }) {
  const [showLogin, setShowLogin] = useState(false);
  const [text, setText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [isTestActive, setIsTestActive] = useState(false);
  const [isTestComplete, setIsTestComplete] = useState(false);
  const [testDuration, setTestDuration] = useState(30);
  const [testType, setTestType] = useState('words');
  const [textLength, setTextLength] = useState(45);
  
  // Stats (real-time)
  const [wpm, setWpm] = useState(0);
  const [rawWpm, setRawWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [characters, setCharacters] = useState({ typed: 0, correct: 0, incorrect: 0, extra: 0, missed: 0 });
  const [consistency, setConsistency] = useState(0);
  
  // Final results
  const [finalResults, setFinalResults] = useState(null);
  
  // Real-time tracking
  const [wpmHistory, setWpmHistory] = useState([]);
  const [errorHistory, setErrorHistory] = useState([]);
  const [timeHistory, setTimeHistory] = useState([]);
  const statsIntervalRef = useRef(null);

  // Keystroke tracking (to count all mistakes, including corrected ones)
  const keystrokeStatsRef = useRef({
    totalKeystrokes: 0,      // Total characters typed (including backspaced)
    correctKeystrokes: 0,     // Correct characters typed
    incorrectKeystrokes: 0    // Incorrect characters typed (even if later corrected)
  });

  const inputRef = useRef(null);

  const resetTest = () => {
    setUserInput('');
    setStartTime(null);
    setIsTestActive(false);
    setIsTestComplete(false);
    setWpm(0);
    setRawWpm(0);
    setAccuracy(100);
    setCharacters({ typed: 0, correct: 0, incorrect: 0, extra: 0, missed: 0 });
    setConsistency(0);
    setWpmHistory([]);
    setErrorHistory([]);
    setTimeHistory([]);
    setFinalResults(null);
    // Reset keystroke tracking
    keystrokeStatsRef.current = {
      totalKeystrokes: 0,
      correctKeystrokes: 0,
      incorrectKeystrokes: 0
    };
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const loadNewText = useCallback(async (resetInput = true) => {
    try {
      const response = await axios.get('/api/text', {
        params: { type: testType, length: textLength }
      });
      setText(response.data.text);
      // Only reset input if explicitly requested (for new test button)
      // When continuing during active test, keep the test active and just update text
      if (resetInput) {
        resetTest();
      } else {
        // Just reset the input to continue typing, keep test active
        // Use setTimeout to ensure focus happens after state update
        setUserInput('');
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, 100);
      }
    } catch (error) {
      console.error('Error loading text:', error);
    }
  }, [testType, textLength]);

  // Only load text on initial mount or when test type changes
  useEffect(() => {
    if (!isTestActive && !isTestComplete) {
      loadNewText();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testType]);

  // Load text on initial mount only
  useEffect(() => {
    loadNewText();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Only reset horizontal scroll on mount (preserve vertical scroll)
  useEffect(() => {
    // Only reset horizontal scroll position once on mount
    if (document.documentElement) {
      document.documentElement.scrollLeft = 0;
    }
    if (document.body) {
      document.body.scrollLeft = 0;
    }
  }, []);

  const calculateStats = () => {
    if (!startTime) return;

    const elapsedSeconds = (Date.now() - startTime) / 1000;
    const elapsedMinutes = elapsedSeconds / 60;

    // Calculate characters stats
    let correct = 0;
    let incorrect = 0;
    let extra = 0;
    let missed = 0;

    const textChars = text.split('');
    const inputChars = userInput.split('');

    for (let i = 0; i < Math.max(textChars.length, inputChars.length); i++) {
      if (i < inputChars.length && i < textChars.length) {
        if (inputChars[i] === textChars[i]) {
          correct++;
        } else {
          incorrect++;
        }
      } else if (i < inputChars.length) {
        extra++;
      } else if (i < textChars.length) {
        missed++;
      }
    }

    const totalTyped = correct + incorrect + extra;

    // Calculate WPM (words = 5 characters)
    const wordsTyped = correct / 5;
    const rawWordsTyped = totalTyped / 5;
    
    const currentWpm = elapsedMinutes > 0 ? Math.round(wordsTyped / elapsedMinutes) : 0;
    const currentRawWpm = elapsedMinutes > 0 ? Math.round(rawWordsTyped / elapsedMinutes) : 0;
    
    // Calculate accuracy using keystroke tracking (includes all mistakes, even corrected ones)
    const keystrokeStats = keystrokeStatsRef.current;
    const currentAccuracy = keystrokeStats.totalKeystrokes > 0 
      ? Math.round((keystrokeStats.correctKeystrokes / keystrokeStats.totalKeystrokes) * 100) 
      : 100;

    setWpm(currentWpm);
    setRawWpm(currentRawWpm);
    setAccuracy(currentAccuracy);
    setCharacters({
      typed: totalTyped,
      correct,
      incorrect,
      extra,
      missed
    });

    // Update history
    const currentSecond = Math.floor(elapsedSeconds);
    if (currentSecond > 0 && currentSecond <= testDuration) {
      setWpmHistory(prev => {
        // Ensure array is large enough
        const newHistory = [...prev];
        while (newHistory.length < currentSecond) {
          newHistory.push(undefined);
        }
        newHistory[currentSecond - 1] = currentWpm;
        
        // Calculate consistency (coefficient of variation of WPM)
        // Filter out undefined values and very early zero values (first 2 seconds)
        // to get more representative consistency
        const allValues = newHistory.filter(v => v !== undefined);
        // Skip first 2 seconds as they often have 0 or very low WPM
        const validHistory = allValues.length > 2 ? allValues.slice(2) : allValues;
        
        if (validHistory.length >= 2) {
          const mean = validHistory.reduce((a, b) => a + b, 0) / validHistory.length;
          
          if (mean > 0) {
            const variance = validHistory.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / validHistory.length;
            const stdDev = Math.sqrt(variance);
            
            // Consistency calculation using coefficient of variation
            // CV = stdDev / mean (measures relative variability)
            // For typing tests, we want to reward consistency
            // Formula: 100 - min(100, CV * 100)
            // This gives: CV=0 → 100%, CV=0.5 → 50%, CV=1.0 → 0%
            const coefficientOfVariation = stdDev / mean;
            // Cap at 1.0 to prevent negative values, then scale
            const cappedCV = Math.min(coefficientOfVariation, 1.0);
            const currentConsistency = Math.max(0, Math.round((1 - cappedCV) * 100));
            setConsistency(currentConsistency);
          } else {
            // Mean is 0 - can't calculate
            setConsistency(0);
          }
        } else if (allValues.length >= 2) {
          // Use all values if we don't have enough after filtering
          const mean = allValues.reduce((a, b) => a + b, 0) / allValues.length;
          if (mean > 0) {
            const variance = allValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / allValues.length;
            const stdDev = Math.sqrt(variance);
            const coefficientOfVariation = stdDev / mean;
            const cappedCV = Math.min(coefficientOfVariation, 1.0);
            const currentConsistency = Math.max(0, Math.round((1 - cappedCV) * 100));
            setConsistency(currentConsistency);
          } else {
            setConsistency(0);
          }
        } else {
          // Not enough data points yet - default to 100%
          setConsistency(100);
        }
        
        return newHistory;
      });
      setErrorHistory(prev => {
        const newHistory = [...prev];
        // Track cumulative incorrect keystrokes (includes corrected mistakes)
        const keystrokeStats = keystrokeStatsRef.current;
        newHistory[currentSecond - 1] = keystrokeStats.incorrectKeystrokes;
        return newHistory;
      });
      setTimeHistory(prev => {
        const newHistory = [...prev];
        newHistory[currentSecond - 1] = currentSecond;
        return newHistory;
      });
    }

    // Check if test is complete (only if test is still active)
    const remainingTime = testDuration - elapsedSeconds;
    
    // If time runs out, finish the test
    if (!isTestComplete && remainingTime <= 0) {
      finishTest();
    }
    // If user finishes typing current text but still has time, load new text
    else if (!isTestComplete && userInput === text && remainingTime > 0) {
      // User finished current text, load new text to continue (don't reset test state)
      loadNewText(false);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const recalculateFinalStats = async (currentInput) => {
    if (!startTime || !isTestComplete) return;

    // Calculate characters stats with current input (including post-timer input)
    let correct = 0;
    let incorrect = 0;
    let extra = 0;
    let missed = 0;

    const textChars = text.split('');
    const inputChars = currentInput.split('');

    for (let i = 0; i < Math.max(textChars.length, inputChars.length); i++) {
      if (i < inputChars.length && i < textChars.length) {
        if (inputChars[i] === textChars[i]) {
          correct++;
        } else {
          incorrect++;
        }
      } else if (i < inputChars.length) {
        extra++;
      } else if (i < textChars.length) {
        missed++;
      }
    }

    const totalTyped = correct + incorrect + extra;

    // Calculate WPM (words = 5 characters) - use test duration for WPM calculation
    const wordsTyped = correct / 5;
    const rawWordsTyped = totalTyped / 5;
    
    // Use test duration in minutes, not elapsed time (which includes post-timer typing)
    const testDurationMinutes = testDuration / 60;
    const finalWpm = testDurationMinutes > 0 ? Math.round(wordsTyped / testDurationMinutes) : 0;
    const finalRawWpm = testDurationMinutes > 0 ? Math.round(rawWordsTyped / testDurationMinutes) : 0;
    
    // Calculate accuracy using keystroke tracking (includes all mistakes, even corrected ones)
    const keystrokeStats = keystrokeStatsRef.current;
    const finalAccuracy = keystrokeStats.totalKeystrokes > 0 
      ? Math.max(0, Math.round((keystrokeStats.correctKeystrokes / keystrokeStats.totalKeystrokes) * 100))
      : 100;

    setWpm(finalWpm);
    setRawWpm(finalRawWpm);
    setAccuracy(finalAccuracy);
    setCharacters({
      typed: totalTyped,
      correct,
      incorrect,
      extra,
      missed
    });

    // Calculate consistency from history
    // Filter out undefined values and very early zero values (first 2 seconds)
    const allValues = wpmHistory.filter(v => v !== undefined);
    const validHistory = allValues.length > 2 ? allValues.slice(2) : allValues;
    
    let finalConsistency = 100;
    if (validHistory.length >= 2) {
      const mean = validHistory.reduce((a, b) => a + b, 0) / validHistory.length;
      
      if (mean > 0) {
        const variance = validHistory.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / validHistory.length;
        const stdDev = Math.sqrt(variance);
        
        // Consistency calculation using coefficient of variation
        const coefficientOfVariation = stdDev / mean;
        const cappedCV = Math.min(coefficientOfVariation, 1.0);
        finalConsistency = Math.max(0, Math.round((1 - cappedCV) * 100));
      } else {
        finalConsistency = 0;
      }
    } else if (allValues.length >= 2) {
      // Use all values if we don't have enough after filtering
      const mean = allValues.reduce((a, b) => a + b, 0) / allValues.length;
      if (mean > 0) {
        const variance = allValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / allValues.length;
        const stdDev = Math.sqrt(variance);
        const coefficientOfVariation = stdDev / mean;
        const cappedCV = Math.min(coefficientOfVariation, 1.0);
        finalConsistency = Math.max(0, Math.round((1 - cappedCV) * 100));
      } else {
        finalConsistency = 0;
      }
    } else {
      // Not enough data points - default to 100%
      finalConsistency = 100;
    }
    setConsistency(finalConsistency);

    // Update final results with all mistakes included
    setFinalResults({
      wpm: finalWpm,
      rawWpm: finalRawWpm,
      accuracy: finalAccuracy,
      characters: {
        typed: totalTyped,
        correct,
        incorrect,
        extra,
        missed
      },
      errors: keystrokeStats.incorrectKeystrokes,
      consistency: Math.max(0, finalConsistency),
      testType,
      testDuration
    });

    // Save updated result to database if user is logged in
    if (user) {
      try {
        await axios.post('/api/results', {
          wpm: finalWpm,
          accuracy: finalAccuracy,
          rawWpm: finalRawWpm,
          characters: totalTyped,
          errors: keystrokeStats.incorrectKeystrokes, // Use incorrect keystrokes (includes corrected mistakes)
          testType: `${testType} ${testDuration}`,
          testDuration,
          consistency: Math.max(0, finalConsistency)
        });
      } catch (error) {
        console.error('Error saving result:', error);
      }
    }
  };

  const finishTest = async () => {
    // Prevent multiple calls
    if (isTestComplete) return;
    
    setIsTestActive(false);
    setIsTestComplete(true);
    
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
    }

    // Final stats calculation (without calling finishTest again)
    if (!startTime) return;

    // Calculate characters stats - use current userInput
    let correct = 0;
    let incorrect = 0;
    let extra = 0;
    let missed = 0;

    const textChars = text.split('');
    const inputChars = userInput.split('');

    for (let i = 0; i < Math.max(textChars.length, inputChars.length); i++) {
      if (i < inputChars.length && i < textChars.length) {
        if (inputChars[i] === textChars[i]) {
          correct++;
        } else {
          incorrect++;
        }
      } else if (i < inputChars.length) {
        extra++;
      } else if (i < textChars.length) {
        missed++;
      }
    }

    const totalTyped = correct + incorrect + extra;

    // Calculate WPM (words = 5 characters) - use test duration for consistency
    const wordsTyped = correct / 5;
    const rawWordsTyped = totalTyped / 5;
    
    // Use test duration in minutes for WPM calculation
    const testDurationMinutes = testDuration / 60;
    const finalWpm = testDurationMinutes > 0 ? Math.round(wordsTyped / testDurationMinutes) : 0;
    const finalRawWpm = testDurationMinutes > 0 ? Math.round(rawWordsTyped / testDurationMinutes) : 0;
    
    // Calculate accuracy using keystroke tracking (includes all mistakes, even corrected ones)
    const keystrokeStats = keystrokeStatsRef.current;
    const finalAccuracy = keystrokeStats.totalKeystrokes > 0 
      ? Math.max(0, Math.round((keystrokeStats.correctKeystrokes / keystrokeStats.totalKeystrokes) * 100))
      : 100;
    
    // Log keystroke stats for debugging
    console.log('Final Stats Calculation:', {
      textLength: textChars.length,
      inputLength: inputChars.length,
      totalTyped,
      correct,
      incorrect,
      extra,
      missed,
      accuracy: finalAccuracy,
      keystrokeStats: {
        totalKeystrokes: keystrokeStats.totalKeystrokes,
        correctKeystrokes: keystrokeStats.correctKeystrokes,
        incorrectKeystrokes: keystrokeStats.incorrectKeystrokes
      },
      userInput: userInput.substring(0, 50) + '...'
    });

    setWpm(finalWpm);
    setRawWpm(finalRawWpm);
    setAccuracy(finalAccuracy);
    setCharacters({
      typed: totalTyped,
      correct,
      incorrect,
      extra,
      missed
    });

    // Calculate consistency from history
    // Filter out undefined values and very early zero values (first 2 seconds)
    const allValues = wpmHistory.filter(v => v !== undefined);
    const validHistory = allValues.length > 2 ? allValues.slice(2) : allValues;
    
    let finalConsistency = 100;
    if (validHistory.length >= 2) {
      const mean = validHistory.reduce((a, b) => a + b, 0) / validHistory.length;
      
      if (mean > 0) {
        const variance = validHistory.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / validHistory.length;
        const stdDev = Math.sqrt(variance);
        
        // Consistency calculation using coefficient of variation
        const coefficientOfVariation = stdDev / mean;
        const cappedCV = Math.min(coefficientOfVariation, 1.0);
        finalConsistency = Math.max(0, Math.round((1 - cappedCV) * 100));
      } else {
        finalConsistency = 0;
      }
    } else if (allValues.length >= 2) {
      // Use all values if we don't have enough after filtering
      const mean = allValues.reduce((a, b) => a + b, 0) / allValues.length;
      if (mean > 0) {
        const variance = allValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / allValues.length;
        const stdDev = Math.sqrt(variance);
        const coefficientOfVariation = stdDev / mean;
        const cappedCV = Math.min(coefficientOfVariation, 1.0);
        finalConsistency = Math.max(0, Math.round((1 - cappedCV) * 100));
      } else {
        finalConsistency = 0;
      }
    } else {
      // Not enough data points - default to 100%
      finalConsistency = 100;
    }
    setConsistency(finalConsistency);

    // Store final results
    setFinalResults({
      wpm: finalWpm,
      rawWpm: finalRawWpm,
      accuracy: finalAccuracy,
      characters: {
        typed: totalTyped,
        correct,
        incorrect,
        extra,
        missed
      },
      errors: keystrokeStats.incorrectKeystrokes,
      consistency: Math.max(0, finalConsistency),
      testType,
      testDuration
    });

    // Save initial result to database (will be updated if user continues typing)
    if (user) {
      try {
        await axios.post('/api/results', {
          wpm: finalWpm,
          accuracy: finalAccuracy,
          rawWpm: finalRawWpm,
          characters: totalTyped,
          errors: keystrokeStats.incorrectKeystrokes, // Use incorrect keystrokes (includes corrected mistakes)
          testType: `${testType} ${testDuration}`,
          testDuration,
          consistency: Math.max(0, finalConsistency)
        });
      } catch (error) {
        console.error('Error saving result:', error);
      }
    }
  };

  useEffect(() => {
    if (isTestActive && startTime) {
      // Update stats every second
      statsIntervalRef.current = setInterval(() => {
        calculateStats();
      }, 1000);

      return () => {
        if (statsIntervalRef.current) {
          clearInterval(statsIntervalRef.current);
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTestActive, startTime, userInput, text, testDuration]);



  const handleInputChange = (e) => {
    const value = e.target.value;
    const oldValue = userInput;
    
    // Prevent input if test is complete
    if (isTestComplete) {
      return; // Don't update state, input will remain at old value
    }
    
    // Check if countdown has reached 0 BEFORE processing input
    if (startTime) {
      const elapsedSeconds = (Date.now() - startTime) / 1000;
      const remainingTime = testDuration - elapsedSeconds;
      if (remainingTime <= 0) {
        // Timer has reached zero - prevent input and finish test
        finishTest();
        return; // Don't update state, input will remain at old value
      }
    }
    
    // Track keystrokes (to count all mistakes including corrected ones)
    if (value.length > oldValue.length) {
      // Character(s) were added (could be single char or paste)
      const lengthDiff = value.length - oldValue.length;
      
      if (lengthDiff === 1) {
        // Single character added
        const addedChar = value[value.length - 1];
        const currentPosition = oldValue.length;
        
        keystrokeStatsRef.current.totalKeystrokes++;
        
        // Check if the added character is correct
        if (currentPosition < text.length) {
          if (addedChar === text[currentPosition]) {
            keystrokeStatsRef.current.correctKeystrokes++;
          } else {
            keystrokeStatsRef.current.incorrectKeystrokes++;
          }
        } else {
          // Typing beyond the text length - count as incorrect (extra character)
          keystrokeStatsRef.current.incorrectKeystrokes++;
        }
      } else {
        // Multiple characters added (paste operation)
        // Count each character individually
        for (let i = oldValue.length; i < value.length; i++) {
          const addedChar = value[i];
          const currentPosition = i;
          
          keystrokeStatsRef.current.totalKeystrokes++;
          
          if (currentPosition < text.length) {
            if (addedChar === text[currentPosition]) {
              keystrokeStatsRef.current.correctKeystrokes++;
            } else {
              keystrokeStatsRef.current.incorrectKeystrokes++;
            }
          } else {
            // Typing beyond the text length
            keystrokeStatsRef.current.incorrectKeystrokes++;
          }
        }
      }
    } else if (value.length < oldValue.length) {
      // Character(s) were removed (backspace) - don't count as keystroke for accuracy
      // The mistakes were already counted when they were typed, so we keep the stats
    }
    // If length is the same but content changed, it's likely a replacement
    // We'll track it by comparing the changed characters
    else if (value !== oldValue) {
      // Find the first difference
      let diffStart = 0;
      while (diffStart < value.length && diffStart < oldValue.length && value[diffStart] === oldValue[diffStart]) {
        diffStart++;
      }
      
      // Count new characters from the difference point
      for (let i = diffStart; i < value.length; i++) {
        const char = value[i];
        keystrokeStatsRef.current.totalKeystrokes++;
        
        if (i < text.length) {
          if (char === text[i]) {
            keystrokeStatsRef.current.correctKeystrokes++;
          } else {
            keystrokeStatsRef.current.incorrectKeystrokes++;
          }
        } else {
          keystrokeStatsRef.current.incorrectKeystrokes++;
        }
      }
    }
    
    if (!isTestActive && value.length > 0) {
      setIsTestActive(true);
      setStartTime(Date.now());
    }

    setUserInput(value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab' || e.key === 'Enter') {
      e.preventDefault();
      if (isTestComplete) {
        loadNewText();
      }
    }
  };

  const getDisplayText = () => {
    const textChars = text.split('');
    const inputChars = userInput.split('');
    const result = [];

    for (let i = 0; i < textChars.length; i++) {
      const char = textChars[i];
      let className = 'char';

      if (i < inputChars.length) {
        if (inputChars[i] === char) {
          className += ' correct';
        } else {
          className += ' incorrect';
        }
      } else if (i === inputChars.length) {
        className += ' current';
      }

      result.push(
        <span key={i} className={className}>
          {char === ' ' ? ' ' : char}
        </span>
      );
    }

    // Show extra characters
    for (let i = textChars.length; i < inputChars.length; i++) {
      result.push(
        <span key={`extra-${i}`} className="char extra">
          {inputChars[i] === ' ' ? ' ' : inputChars[i]}
        </span>
      );
    }

    return result;
  };

  return (
    <div className="typing-test-container">
      <div className="content-wrapper">
      <div className="header">
        <h1>MatthewWrite</h1>
        <div className="user-info">
          {onBack && (
            <button onClick={onBack} className="back-btn">Back to Dashboard</button>
          )}
          {user ? (
            <>
              <span>Welcome, {user.username}</span>
              <button onClick={onLogout} className="logout-btn">Logout</button>
            </>
          ) : (
            <>
              <span className="login-prompt">Sign in to save your results</span>
              <button onClick={() => setShowLogin(true)} className="login-btn">Sign In</button>
            </>
          )}
        </div>
      </div>

      {showLogin && (
        <div className="login-modal-overlay" onClick={() => setShowLogin(false)}>
          <div className="login-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setShowLogin(false)}>×</button>
            <Login onLogin={(userData, authToken) => {
              onLogin(userData, authToken);
              setShowLogin(false);
            }} />
          </div>
        </div>
      )}

      <div className="test-controls">
        <div className="control-group">
          <label>Test Type:</label>
          <select 
            value={testType} 
            onChange={(e) => setTestType(e.target.value)}
            disabled={isTestActive}
          >
            <option value="words">Words</option>
            <option value="sentences">Sentences</option>
            <option value="mixed">Mixed</option>
          </select>
        </div>
        <div className="control-group">
          <label>Duration:</label>
          <select 
            value={testDuration} 
            onChange={(e) => setTestDuration(parseInt(e.target.value))}
            disabled={isTestActive}
          >
            <option value="15">15s</option>
            <option value="30">30s</option>
            <option value="60">60s</option>
            <option value="120">120s</option>
          </select>
        </div>
        <div className="control-group">
          <label>Length:</label>
          <input
            type="number"
            value={textLength}
            onChange={(e) => {
              const newLength = parseInt(e.target.value) || 45;
              if (newLength >= 10 && newLength <= 200) {
                setTextLength(newLength);
              }
            }}
            disabled={isTestActive || isTestComplete}
            min="10"
            max="200"
          />
        </div>
        <button 
          onClick={loadNewText} 
          className="new-test-btn"
          disabled={isTestActive}
        >
          New Test
        </button>
      </div>

      <div className="main-content">
        <StatsPanel 
          wpm={wpm}
          accuracy={accuracy}
          rawWpm={rawWpm}
          characters={characters}
          consistency={consistency}
          testType={testType}
          testDuration={testDuration}
          time={startTime ? Math.max(0, testDuration - Math.floor((Date.now() - startTime) / 1000)) : testDuration}
          errors={keystrokeStatsRef.current.incorrectKeystrokes}
        />

        <div className="typing-area">
          <div className="text-display">
            {getDisplayText()}
          </div>
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="typing-input"
            disabled={isTestComplete}
            readOnly={isTestComplete}
            autoFocus={!isTestComplete}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
          {isTestComplete && (
            <div className="test-complete">
              <p>Test Complete! Press Tab or Enter for a new test.</p>
            </div>
          )}
        </div>

      </div>

      <div className="graph-section">
        <Graph 
          wpmHistory={wpmHistory}
          errorHistory={errorHistory}
          timeHistory={timeHistory}
          testDuration={testDuration}
        />
      </div>

      {/* Final Results Section */}
      {finalResults && (
        <div className="final-results-section">
          <h2>Final Results</h2>
          <div className="final-results-grid">
            <div className="final-stat-item">
              <div className="final-stat-label">wpm</div>
              <div className="final-stat-value">{finalResults.wpm}</div>
            </div>
            <div className="final-stat-item">
              <div className="final-stat-label">acc</div>
              <div className="final-stat-value">{finalResults.accuracy}%</div>
            </div>
            <div className="final-stat-item">
              <div className="final-stat-label">test type</div>
              <div className="final-stat-details">
                <div className="final-stat-detail-value">time {finalResults.testDuration}</div>
                <div className="final-stat-detail-value">{finalResults.testType}</div>
              </div>
            </div>
            <div className="final-stat-item">
              <div className="final-stat-label">raw</div>
              <div className="final-stat-value">{finalResults.rawWpm}</div>
            </div>
            <div className="final-stat-item">
              <div className="final-stat-label">characters</div>
              <div className="final-stat-value">
                {finalResults.characters.typed}/{finalResults.characters.incorrect}/{finalResults.characters.extra}/{finalResults.characters.missed}
              </div>
            </div>
            <div className="final-stat-item">
              <div className="final-stat-label">error letter count</div>
              <div className="final-stat-value">{finalResults.errors || 0}</div>
            </div>
            <div className="final-stat-item">
              <div className="final-stat-label">consistency</div>
              <div className="final-stat-value">{finalResults.consistency}%</div>
            </div>
            <div className="final-stat-item">
              <div className="final-stat-label">time</div>
              <div className="final-stat-value">{finalResults.testDuration}s</div>
              <div className="final-stat-subtext">
                {(() => {
                  const hours = Math.floor(finalResults.testDuration / 3600);
                  const minutes = Math.floor((finalResults.testDuration % 3600) / 60);
                  const secs = finalResults.testDuration % 60;
                  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
                })()} session
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default TypingTest;

