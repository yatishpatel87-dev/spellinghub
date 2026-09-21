import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  DifficultyLevel,
  GameSettings,
  LetterTile,
  RoundHistoryItem,
  ScreenOrientation,
  TeamColor,
  TeamConfig,
  TeamPlayState,
  WordItem,
} from './types';
import { getMatchWords, scrambleWord, shuffleArray } from './data/words';
import {
  playSuccessChime,
  playTileReturn,
  playTileTap,
  playTimerTick,
  playWrongBuzz,
  speakWord,
  setMusicEnabled,
  setMusicVolume,
} from './utils/sound';
import { TeamBoard } from './components/TeamBoard';
import { GameHeader } from './components/GameHeader';
import { SettingsModal } from './components/SettingsModal';
import { VictoryModal } from './components/VictoryModal';
import { RoundReviewModal } from './components/RoundReviewModal';
import { TeamSetupModal } from './components/TeamSetupModal';

const DEFAULT_SETTINGS: GameSettings = {
  targetScore: 5,
  roundDurationSeconds: 40,
  difficulty: 'all',
  category: 'All Categories',
  orientation: 'split-horizontal',
  soundEnabled: true,
  musicEnabled: true,
  musicVolume: 0.35,
  showGujaratiHints: true,
  autoCheckOnFill: true,
};

const DEFAULT_TEAM_1: TeamConfig = {
  id: 'team1',
  name: 'Team Red',
  color: 'ruby',
  primaryHex: '#f43f5e',
  accentHex: '#fb7185',
};

const DEFAULT_TEAM_2: TeamConfig = {
  id: 'team2',
  name: 'Team Blue',
  color: 'azure',
  primaryHex: '#06b6d4',
  accentHex: '#38bdf8',
};

const COLOR_HEX_MAP: Record<TeamColor, { primary: string; accent: string }> = {
  ruby: { primary: '#f43f5e', accent: '#fb7185' },
  azure: { primary: '#06b6d4', accent: '#38bdf8' },
  emerald: { primary: '#10b981', accent: '#34d399' },
  amber: { primary: '#f59e0b', accent: '#fbbf24' },
  violet: { primary: '#8b5cf6', accent: '#a78bfa' },
};

export default function App() {
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [team1Config, setTeam1Config] = useState<TeamConfig>(DEFAULT_TEAM_1);
  const [team2Config, setTeam2Config] = useState<TeamConfig>(DEFAULT_TEAM_2);

  // Match state
  const [wordQueue, setWordQueue] = useState<WordItem[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentWord, setCurrentWord] = useState<WordItem | null>(null);
  const [roundNumber, setRoundNumber] = useState(1);
  const [timerSeconds, setTimerSeconds] = useState(DEFAULT_SETTINGS.roundDurationSeconds);
  const [isRoundActive, setIsRoundActive] = useState(false);
  const [roundWinnerTeamId, setRoundWinnerTeamId] = useState<string | null>(null);
  const [matchWinnerTeamId, setMatchWinnerTeamId] = useState<'team1' | 'team2' | null>(null);
  const [history, setHistory] = useState<RoundHistoryItem[]>([]);
  const [cumulativeHistory, setCumulativeHistory] = useState<RoundHistoryItem[]>([]);
  const [matchNumber, setMatchNumber] = useState(1);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isTeamSetupOpen, setIsTeamSetupOpen] = useState(true);

  // Teams in-game state
  const [team1State, setTeam1State] = useState<TeamPlayState>({
    teamId: 'team1',
    score: 0,
    streak: 0,
    currentAnswer: [],
    availableTiles: [],
    isSolved: false,
    isWrongShake: false,
    revealedIndices: [],
  });

  const [team2State, setTeam2State] = useState<TeamPlayState>({
    teamId: 'team2',
    score: 0,
    streak: 0,
    currentAnswer: [],
    availableTiles: [],
    isSolved: false,
    isWrongShake: false,
    revealedIndices: [],
  });

  // Score +1 floating animation triggers
  const [team1ScoreAnimKey, setTeam1ScoreAnimKey] = useState<number | null>(null);
  const [team2ScoreAnimKey, setTeam2ScoreAnimKey] = useState<number | null>(null);

  const roundTimerRef = useRef<NodeJS.Timeout | null>(null);
  const nextRoundTimerRef = useRef<NodeJS.Timeout | null>(null);
  const roundStartTimeRef = useRef<number>(Date.now());
  const roundAttemptsRef = useRef<{
    team1: { correct: number; wrong: number };
    team2: { correct: number; wrong: number };
  }>({
    team1: { correct: 0, wrong: 0 },
    team2: { correct: 0, wrong: 0 },
  });

  // Setup a new round for a given word
  const initRound = (word: WordItem, activeSettings: GameSettings, activateTimer = true) => {
    if (roundTimerRef.current) clearInterval(roundTimerRef.current);
    if (nextRoundTimerRef.current) clearTimeout(nextRoundTimerRef.current);

    roundStartTimeRef.current = Date.now();
    roundAttemptsRef.current = {
      team1: { correct: 0, wrong: 0 },
      team2: { correct: 0, wrong: 0 },
    };
    setCurrentWord(word);
    setRoundWinnerTeamId(null);
    setTimerSeconds(activeSettings.roundDurationSeconds);
    setIsRoundActive(activateTimer);

    const t1Tiles = scrambleWord(word.word, 't1');
    const t2Tiles = scrambleWord(word.word, 't2');

    setTeam1State((prev) => ({
      ...prev,
      currentAnswer: [],
      availableTiles: t1Tiles,
      isSolved: false,
      isWrongShake: false,
      revealedIndices: [],
    }));

    setTeam2State((prev) => ({
      ...prev,
      currentAnswer: [],
      availableTiles: t2Tiles,
      isSolved: false,
      isWrongShake: false,
      revealedIndices: [],
    }));
  };

  // Initialize word queue and start match
  const startNewMatch = useCallback(
    (customSettings?: GameSettings, forceActivate = false) => {
      if (roundTimerRef.current) clearInterval(roundTimerRef.current);
      if (nextRoundTimerRef.current) clearTimeout(nextRoundTimerRef.current);

      const activeSettings = customSettings || settings;
      const freshWords = getMatchWords(activeSettings.difficulty, activeSettings.category, 40);

      if (matchWinnerTeamId) {
        setMatchNumber((prev) => prev + 1);
      }

      setWordQueue(freshWords);
      setCurrentWordIndex(0);
      setRoundNumber(1);
      setMatchWinnerTeamId(null);
      setHistory([]);
      setTeam1ScoreAnimKey(null);
      setTeam2ScoreAnimKey(null);

      setTeam1State({
        teamId: 'team1',
        score: 0,
        streak: 0,
        currentAnswer: [],
        availableTiles: [],
        isSolved: false,
        isWrongShake: false,
        revealedIndices: [],
      });

      setTeam2State({
        teamId: 'team2',
        score: 0,
        streak: 0,
        currentAnswer: [],
        availableTiles: [],
        isSolved: false,
        isWrongShake: false,
        revealedIndices: [],
      });

      if (freshWords.length > 0) {
        initRound(freshWords[0], activeSettings, forceActivate);
      }
    },
    [settings]
  );

  // Handle saving team names before game starts
  const handleSaveTeamsAndStart = (
    name1: string,
    name2: string,
    color1: TeamColor,
    color2: TeamColor
  ) => {
    const updatedT1: TeamConfig = {
      ...team1Config,
      name: name1,
      color: color1,
      primaryHex: COLOR_HEX_MAP[color1].primary,
      accentHex: COLOR_HEX_MAP[color1].accent,
    };
    const updatedT2: TeamConfig = {
      ...team2Config,
      name: name2,
      color: color2,
      primaryHex: COLOR_HEX_MAP[color2].primary,
      accentHex: COLOR_HEX_MAP[color2].accent,
    };

    setTeam1Config(updatedT1);
    setTeam2Config(updatedT2);
    setIsTeamSetupOpen(false);

    // Start active match
    startNewMatch(settings, true);
  };

  // Mount on first load
  useEffect(() => {
    startNewMatch();
    return () => {
      if (roundTimerRef.current) clearInterval(roundTimerRef.current);
      if (nextRoundTimerRef.current) clearTimeout(nextRoundTimerRef.current);
    };
  }, []);

  // Timer Countdown effect
  useEffect(() => {
    if (!isRoundActive || settings.roundDurationSeconds <= 0) return;

    roundTimerRef.current = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          if (roundTimerRef.current) clearInterval(roundTimerRef.current);
          handleRoundTimeout();
          return 0;
        }
        if (prev <= 6 && prev > 1) {
          playTimerTick(settings.soundEnabled);
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (roundTimerRef.current) clearInterval(roundTimerRef.current);
    };
  }, [isRoundActive, settings.roundDurationSeconds, settings.soundEnabled]);

  // Handle time out when neither team solves
  const handleRoundTimeout = () => {
    setIsRoundActive(false);
    playWrongBuzz(settings.soundEnabled);
    setRoundWinnerTeamId('draw');

    const timeSpent =
      settings.roundDurationSeconds > 0
        ? settings.roundDurationSeconds
        : roundStartTimeRef.current > 0
        ? Math.max(1, Math.round((Date.now() - roundStartTimeRef.current) / 1000))
        : 30;

    if (currentWord) {
      const historyEntry: RoundHistoryItem = {
        roundNumber,
        matchNumber,
        word: currentWord,
        winnerTeamId: 'draw',
        timeTakenSeconds: timeSpent,
        team1Submissions: { ...roundAttemptsRef.current.team1 },
        team2Submissions: { ...roundAttemptsRef.current.team2 },
      };
      setHistory((prev) => [...prev, historyEntry]);
      setCumulativeHistory((prev) => [...prev, historyEntry]);
    }

    // Reset streaks on a draw/timeout
    setTeam1State((prev) => ({ ...prev, streak: 0 }));
    setTeam2State((prev) => ({ ...prev, streak: 0 }));

    // Auto advance to next round after 3 seconds
    nextRoundTimerRef.current = setTimeout(() => {
      advanceToNextRound();
    }, 3200);
  };

  // Advance to next round
  const advanceToNextRound = () => {
    if (matchWinnerTeamId) return;

    const nextIndex = currentWordIndex + 1;
    let pool = wordQueue;
    if (nextIndex >= pool.length) {
      pool = getMatchWords(settings.difficulty, settings.category, 30);
      setWordQueue(pool);
      setCurrentWordIndex(0);
      initRound(pool[0], settings);
      setRoundNumber((r) => r + 1);
      return;
    }

    setCurrentWordIndex(nextIndex);
    setRoundNumber((r) => r + 1);
    initRound(pool[nextIndex], settings);
  };

  // Team Solves correctly
  const handleTeamWinRound = (winningTeamId: 'team1' | 'team2') => {
    if (!isRoundActive || !currentWord) return;

    setIsRoundActive(false);
    if (roundTimerRef.current) clearInterval(roundTimerRef.current);

    setRoundWinnerTeamId(winningTeamId);
    playSuccessChime(settings.soundEnabled);

    // Confetti on winning side
    try {
      const isTeam1 = winningTeamId === 'team1';
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { x: isTeam1 ? 0.3 : 0.7, y: 0.6 },
        colors: isTeam1 ? ['#f43f5e', '#fb7185', '#ffffff'] : ['#06b6d4', '#38bdf8', '#ffffff'],
      });
    } catch {
      // Ignored
    }

    const now = Date.now();
    const timeSpent =
      roundStartTimeRef.current > 0
        ? Math.max(0.5, Math.round(((now - roundStartTimeRef.current) / 1000) * 10) / 10)
        : settings.roundDurationSeconds > 0
        ? Math.max(1, settings.roundDurationSeconds - timerSeconds)
        : 1;

    // Record history
    const historyEntry: RoundHistoryItem = {
      roundNumber,
      matchNumber,
      word: currentWord,
      winnerTeamId: winningTeamId,
      timeTakenSeconds: timeSpent,
      team1Submissions: { ...roundAttemptsRef.current.team1 },
      team2Submissions: { ...roundAttemptsRef.current.team2 },
    };
    setHistory((prev) => [...prev, historyEntry]);
    setCumulativeHistory((prev) => [...prev, historyEntry]);

    // Update scores
    let newTeam1Score = team1State.score;
    let newTeam2Score = team2State.score;

    if (winningTeamId === 'team1') {
      newTeam1Score += 1;
      setTeam1ScoreAnimKey(Date.now());
      setTeam1State((prev) => ({
        ...prev,
        score: prev.score + 1,
        streak: prev.streak + 1,
        isSolved: true,
      }));
      setTeam2State((prev) => ({
        ...prev,
        streak: 0,
      }));
    } else {
      newTeam2Score += 1;
      setTeam2ScoreAnimKey(Date.now());
      setTeam2State((prev) => ({
        ...prev,
        score: prev.score + 1,
        streak: prev.streak + 1,
        isSolved: true,
      }));
      setTeam1State((prev) => ({
        ...prev,
        streak: 0,
      }));
    }

    // Check if match won
    if (newTeam1Score >= settings.targetScore) {
      setMatchWinnerTeamId('team1');
      return;
    }
    if (newTeam2Score >= settings.targetScore) {
      setMatchWinnerTeamId('team2');
      return;
    }

    // Next round after 2.6s
    nextRoundTimerRef.current = setTimeout(() => {
      advanceToNextRound();
    }, 2600);
  };

  // Validation function for answer
  const checkAnswer = (teamId: 'team1' | 'team2', currentAnswer: LetterTile[]) => {
    if (!currentWord || !isRoundActive) return;

    const assembledWord = currentAnswer.map((t) => t.char).join('').toUpperCase();
    const targetWordStr = currentWord.word.toUpperCase();

    if (assembledWord === targetWordStr) {
      roundAttemptsRef.current[teamId].correct += 1;
      handleTeamWinRound(teamId);
    } else {
      roundAttemptsRef.current[teamId].wrong += 1;
      // Wrong guess
      playWrongBuzz(settings.soundEnabled);
      if (teamId === 'team1') {
        setTeam1State((prev) => ({ ...prev, isWrongShake: true }));
        setTimeout(() => {
          setTeam1State((prev) => ({ ...prev, isWrongShake: false }));
        }, 500);
      } else {
        setTeam2State((prev) => ({ ...prev, isWrongShake: true }));
        setTimeout(() => {
          setTeam2State((prev) => ({ ...prev, isWrongShake: false }));
        }, 500);
      }
    }
  };

  // Tile Selection for a Team
  const handleTileSelect = (teamId: 'team1' | 'team2', tile: LetterTile) => {
    if (!isRoundActive || !currentWord) return;

    const targetLength = currentWord.word.length;
    playTileTap(settings.soundEnabled);

    if (teamId === 'team1') {
      if (team1State.currentAnswer.length >= targetLength) return;
      const nextAnswer = [...team1State.currentAnswer, tile];
      const nextAvailable = team1State.availableTiles.filter((t) => t.id !== tile.id);

      setTeam1State((prev) => ({
        ...prev,
        currentAnswer: nextAnswer,
        availableTiles: nextAvailable,
      }));

      if (settings.autoCheckOnFill && nextAnswer.length === targetLength) {
        checkAnswer('team1', nextAnswer);
      }
    } else {
      if (team2State.currentAnswer.length >= targetLength) return;
      const nextAnswer = [...team2State.currentAnswer, tile];
      const nextAvailable = team2State.availableTiles.filter((t) => t.id !== tile.id);

      setTeam2State((prev) => ({
        ...prev,
        currentAnswer: nextAnswer,
        availableTiles: nextAvailable,
      }));

      if (settings.autoCheckOnFill && nextAnswer.length === targetLength) {
        checkAnswer('team2', nextAnswer);
      }
    }
  };

  // Remove Tile from answer rack back to pool
  const handleAnswerTileRemove = (teamId: 'team1' | 'team2', index: number) => {
    if (!isRoundActive) return;
    playTileReturn(settings.soundEnabled);

    if (teamId === 'team1') {
      const tileToRemove = team1State.currentAnswer[index];
      if (!tileToRemove) return;
      const nextAnswer = team1State.currentAnswer.filter((_, i) => i !== index);
      const nextAvailable = [...team1State.availableTiles, tileToRemove];

      setTeam1State((prev) => ({
        ...prev,
        currentAnswer: nextAnswer,
        availableTiles: nextAvailable,
      }));
    } else {
      const tileToRemove = team2State.currentAnswer[index];
      if (!tileToRemove) return;
      const nextAnswer = team2State.currentAnswer.filter((_, i) => i !== index);
      const nextAvailable = [...team2State.availableTiles, tileToRemove];

      setTeam2State((prev) => ({
        ...prev,
        currentAnswer: nextAnswer,
        availableTiles: nextAvailable,
      }));
    }
  };

  // Clear all answer letters back to pool
  const handleClearAnswer = (teamId: 'team1' | 'team2') => {
    if (!isRoundActive) return;
    playTileReturn(settings.soundEnabled);

    if (teamId === 'team1') {
      if (team1State.currentAnswer.length === 0) return;
      setTeam1State((prev) => ({
        ...prev,
        availableTiles: [...prev.availableTiles, ...prev.currentAnswer],
        currentAnswer: [],
      }));
    } else {
      if (team2State.currentAnswer.length === 0) return;
      setTeam2State((prev) => ({
        ...prev,
        availableTiles: [...prev.availableTiles, ...prev.currentAnswer],
        currentAnswer: [],
      }));
    }
  };

  // Shuffle available tiles
  const handleShuffleTiles = (teamId: 'team1' | 'team2') => {
    if (!isRoundActive) return;
    playTileTap(settings.soundEnabled);

    if (teamId === 'team1') {
      setTeam1State((prev) => ({
        ...prev,
        availableTiles: shuffleArray(prev.availableTiles),
      }));
    } else {
      setTeam2State((prev) => ({
        ...prev,
        availableTiles: shuffleArray(prev.availableTiles),
      }));
    }
  };

  // Use Hint (Reveals next correct letter)
  const handleUseHint = (teamId: 'team1' | 'team2') => {
    if (!isRoundActive || !currentWord) return;

    const targetChars = currentWord.word.toUpperCase().split('');
    const state = teamId === 'team1' ? team1State : team2State;

    // Find first slot that is unrevealed or incorrect
    let slotToFill = -1;
    for (let i = 0; i < targetChars.length; i++) {
      if (!state.revealedIndices.includes(i)) {
        slotToFill = i;
        break;
      }
    }

    if (slotToFill === -1) return;

    const neededChar = targetChars[slotToFill];

    // Find tile with this char from availableTiles or misplaced currentAnswer
    let tileToPlace: LetterTile | undefined;
    const availableIndex = state.availableTiles.findIndex((t) => t.char === neededChar);

    if (availableIndex !== -1) {
      tileToPlace = state.availableTiles[availableIndex];
      const nextAvailable = state.availableTiles.filter((_, i) => i !== availableIndex);
      const nextAnswer = [...state.currentAnswer, tileToPlace];
      const nextRevealed = [...state.revealedIndices, slotToFill];

      if (teamId === 'team1') {
        setTeam1State((prev) => ({
          ...prev,
          currentAnswer: nextAnswer,
          availableTiles: nextAvailable,
          revealedIndices: nextRevealed,
        }));
        if (settings.autoCheckOnFill && nextAnswer.length === targetChars.length) {
          checkAnswer('team1', nextAnswer);
        }
      } else {
        setTeam2State((prev) => ({
          ...prev,
          currentAnswer: nextAnswer,
          availableTiles: nextAvailable,
          revealedIndices: nextRevealed,
        }));
        if (settings.autoCheckOnFill && nextAnswer.length === targetChars.length) {
          checkAnswer('team2', nextAnswer);
        }
      }
    }
  };

  // Screen orientation cycle
  const cycleOrientation = () => {
    setSettings((prev) => {
      const next: ScreenOrientation =
        prev.orientation === 'split-horizontal'
          ? 'tabletop-opposed'
          : prev.orientation === 'tabletop-opposed'
          ? 'split-vertical'
          : 'split-horizontal';
      return { ...prev, orientation: next };
    });
  };

  // Keyboard shortcut listener for simultaneous desktop play
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSettingsOpen || isHistoryOpen || isTeamSetupOpen || !isRoundActive || !currentWord) return;

      const key = e.key.toUpperCase();
      if (/^[A-Z]$/.test(key)) {
        // Find matching letter in Team 1 if available
        const t1Tile = team1State.availableTiles.find((t) => t.char === key);
        if (t1Tile) {
          handleTileSelect('team1', t1Tile);
        }
      } else if (e.key === 'Backspace') {
        if (team1State.currentAnswer.length > 0) {
          handleAnswerTileRemove('team1', team1State.currentAnswer.length - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isSettingsOpen,
    isHistoryOpen,
    isRoundActive,
    currentWord,
    team1State.availableTiles,
    team1State.currentAnswer,
  ]);

  // Synchronize background music with user settings and volume
  useEffect(() => {
    const volume = settings.musicVolume ?? 0.35;
    setMusicVolume(volume);
    setMusicEnabled(settings.musicEnabled, volume);

    // If browser suspended AudioContext until user gesture, resume on first click/tap
    const handleFirstUserGesture = () => {
      if (settings.musicEnabled) {
        setMusicEnabled(true, settings.musicVolume ?? 0.35);
      }
    };

    window.addEventListener('pointerdown', handleFirstUserGesture, { once: true });
    window.addEventListener('keydown', handleFirstUserGesture, { once: true });

    return () => {
      window.removeEventListener('pointerdown', handleFirstUserGesture);
      window.removeEventListener('keydown', handleFirstUserGesture);
    };
  }, [settings.musicEnabled, settings.musicVolume]);

  if (!currentWord) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-950 text-white font-display">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Preparing English Spelling Duel arena...</p>
        </div>
      </div>
    );
  }

  // Dynamic layout styling based on orientation
  const isTabletop = settings.orientation === 'tabletop-opposed';
  const isVertical = settings.orientation === 'split-vertical';
  const isHorizontal = settings.orientation === 'split-horizontal';

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 overflow-hidden text-slate-100 font-sans select-none">
      {/* Top Universal Game Header */}
      <GameHeader
        roundNumber={roundNumber}
        timerSeconds={timerSeconds}
        totalRoundSeconds={settings.roundDurationSeconds}
        isRoundActive={isRoundActive}
        team1Config={team1Config}
        team2Config={team2Config}
        team1State={team1State}
        team2State={team2State}
        team1ScoreAnimKey={team1ScoreAnimKey}
        team2ScoreAnimKey={team2ScoreAnimKey}
        settings={settings}
        onToggleSound={() =>
          setSettings((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))
        }
        onToggleMusic={() =>
          setSettings((prev) => ({ ...prev, musicEnabled: !prev.musicEnabled }))
        }
        onCycleOrientation={cycleOrientation}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenTeamSetup={() => setIsTeamSetupOpen(true)}
        onNextRoundManual={advanceToNextRound}
        onResetMatch={() => startNewMatch()}
      />

      {/* Main Dual Playing Surface */}
      <main
        className={`flex-1 p-2 sm:p-3 md:p-4 gap-2 sm:gap-3 md:gap-4 overflow-hidden ${
          isHorizontal
            ? 'grid grid-cols-2 h-full'
            : isVertical || isTabletop
            ? 'grid grid-rows-2 h-full'
            : 'grid grid-cols-2 h-full'
        }`}
      >
        {/* Team 1 Board */}
        <div className="flex-1 h-full min-h-0 overflow-hidden flex">
          <TeamBoard
            teamConfig={team1Config}
            playState={team1State}
            targetWord={currentWord}
            isRoundActive={isRoundActive}
            roundWinnerTeamId={roundWinnerTeamId}
            showGujaratiHints={settings.showGujaratiHints}
            isRotated180={false}
            scoreAnimKey={team1ScoreAnimKey}
            onTileSelect={(tile) => handleTileSelect('team1', tile)}
            onAnswerTileRemove={(idx) => handleAnswerTileRemove('team1', idx)}
            onClearAnswer={() => handleClearAnswer('team1')}
            onShuffleTiles={() => handleShuffleTiles('team1')}
            onUseHint={() => handleUseHint('team1')}
            onSubmitAnswer={() => checkAnswer('team1', team1State.currentAnswer)}
          />
        </div>

        {/* Middle Visual Divider for Tabletop / Split Mode */}
        {isTabletop && (
          <div className="flex items-center justify-center py-0.5 relative z-10">
            <div className="w-full border-t-2 border-dashed border-slate-700/60 flex items-center justify-center">
              <span className="bg-slate-900 border border-slate-700 px-3 py-0.5 rounded-full text-[10px] text-amber-400 font-bold uppercase tracking-widest shadow">
                Face-to-Face Tabletop Line
              </span>
            </div>
          </div>
        )}

        {/* Team 2 Board */}
        <div className="flex-1 h-full min-h-0 overflow-hidden flex">
          <TeamBoard
            teamConfig={team2Config}
            playState={team2State}
            targetWord={currentWord}
            isRoundActive={isRoundActive}
            roundWinnerTeamId={roundWinnerTeamId}
            showGujaratiHints={settings.showGujaratiHints}
            isRotated180={isTabletop}
            scoreAnimKey={team2ScoreAnimKey}
            onTileSelect={(tile) => handleTileSelect('team2', tile)}
            onAnswerTileRemove={(idx) => handleAnswerTileRemove('team2', idx)}
            onClearAnswer={() => handleClearAnswer('team2')}
            onShuffleTiles={() => handleShuffleTiles('team2')}
            onUseHint={() => handleUseHint('team2')}
            onSubmitAnswer={() => checkAnswer('team2', team2State.currentAnswer)}
          />
        </div>
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={(newSettings) => setSettings(newSettings)}
        team1Config={team1Config}
        team2Config={team2Config}
        onSaveTeamConfigs={(t1, t2) => {
          setTeam1Config(t1);
          setTeam2Config(t2);
        }}
        onRestartMatchWithSettings={() => startNewMatch()}
      />

      {/* Word History & Dictionary Modal */}
      <RoundReviewModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        allMatchesHistory={cumulativeHistory}
        team1Config={team1Config}
        team2Config={team2Config}
      />

      {/* Victory Celebration Modal */}
      {matchWinnerTeamId && (
        <VictoryModal
          isOpen={!!matchWinnerTeamId}
          winnerTeamId={matchWinnerTeamId}
          team1Config={team1Config}
          team2Config={team2Config}
          team1State={team1State}
          team2State={team2State}
          history={history}
          soundEnabled={settings.soundEnabled}
          targetScore={settings.targetScore}
          onPlayAgain={() => startNewMatch()}
          onOpenHistory={() => setIsHistoryOpen(true)}
          onChangeTeams={() => {
            setMatchWinnerTeamId(null);
            setIsTeamSetupOpen(true);
          }}
        />
      )}

      {/* Pre-Game Team Name Registration Modal */}
      <TeamSetupModal
        isOpen={isTeamSetupOpen}
        team1Config={team1Config}
        team2Config={team2Config}
        targetScore={settings.targetScore}
        onSaveAndStart={handleSaveTeamsAndStart}
      />
    </div>
  );
}
