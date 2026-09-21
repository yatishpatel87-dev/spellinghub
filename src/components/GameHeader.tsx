import React from 'react';
import { motion } from 'motion/react';
import {
  Volume2,
  VolumeX,
  Music,
  RotateCw,
  Settings,
  Trophy,
  History,
  Timer,
  Layout,
  RefreshCw,
  Sparkles,
  Users,
  Crown,
  Flame,
} from 'lucide-react';
import { GameSettings, ScreenOrientation, TeamConfig, TeamPlayState } from '../types';
import { FloatingScoreBadge } from './FloatingScoreBadge';

interface GameHeaderProps {
  roundNumber: number;
  timerSeconds: number;
  totalRoundSeconds: number;
  isRoundActive: boolean;
  team1Config: TeamConfig;
  team2Config: TeamConfig;
  team1State: TeamPlayState;
  team2State: TeamPlayState;
  team1ScoreAnimKey?: number | string | null;
  team2ScoreAnimKey?: number | string | null;
  settings: GameSettings;
  onToggleSound: () => void;
  onToggleMusic: () => void;
  onCycleOrientation: () => void;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  onOpenTeamSetup: () => void;
  onNextRoundManual: () => void;
  onResetMatch: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  roundNumber,
  timerSeconds,
  totalRoundSeconds,
  isRoundActive,
  team1Config,
  team2Config,
  team1State,
  team2State,
  team1ScoreAnimKey,
  team2ScoreAnimKey,
  settings,
  onToggleSound,
  onToggleMusic,
  onCycleOrientation,
  onOpenSettings,
  onOpenHistory,
  onOpenTeamSetup,
  onNextRoundManual,
  onResetMatch,
}) => {
  const timerPercentage =
    totalRoundSeconds > 0 ? (timerSeconds / totalRoundSeconds) * 100 : 100;
  const isTimeCritical = totalRoundSeconds > 0 && timerSeconds <= 8;

  const targetScore = Math.max(1, settings.targetScore);
  const team1Progress = Math.min(100, Math.max(0, (team1State.score / targetScore) * 100));
  const team2Progress = Math.min(100, Math.max(0, (team2State.score / targetScore) * 100));
  const isTeam1MatchPoint = team1State.score === targetScore - 1 && targetScore > 1;
  const isTeam2MatchPoint = team2State.score === targetScore - 1 && targetScore > 1;

  // Dynamic tension & color shift as timer approaches zero
  const getTimerTension = () => {
    if (totalRoundSeconds <= 0) {
      return {
        colorClass: 'text-slate-200',
        sizeClass: 'text-xs sm:text-sm font-bold',
        glowStyle: '',
        pulseGlow: false,
        tickScale: 1,
      };
    }

    if (timerSeconds <= 3) {
      // Climax countdown tension: vibrant scarlet red, large scale, intense glow
      return {
        colorClass: 'text-red-500',
        sizeClass: 'text-sm sm:text-base font-black',
        glowStyle: 'drop-shadow-[0_0_10px_rgba(239,68,68,0.9)]',
        pulseGlow: true,
        tickScale: 1.45,
      };
    } else if (timerSeconds <= 6) {
      // High tension: vivid red-rose, bold font, warm glow
      return {
        colorClass: 'text-rose-400',
        sizeClass: 'text-xs sm:text-sm font-black',
        glowStyle: 'drop-shadow-[0_0_6px_rgba(244,63,94,0.7)]',
        pulseGlow: true,
        tickScale: 1.25,
      };
    } else if (timerSeconds <= 10) {
      // Warning tension: amber-yellow, slightly enlarged
      return {
        colorClass: 'text-amber-300',
        sizeClass: 'text-xs sm:text-sm font-extrabold',
        glowStyle: 'drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]',
        pulseGlow: false,
        tickScale: 1.15,
      };
    }

    // Normal phase: clean white/slate
    return {
      colorClass: 'text-slate-200',
      sizeClass: 'text-xs sm:text-sm font-bold',
      glowStyle: '',
      pulseGlow: false,
      tickScale: 1.05,
    };
  };

  const timerTension = getTimerTension();

  const getOrientationLabel = (o: ScreenOrientation) => {
    switch (o) {
      case 'split-horizontal':
        return 'Side by Side';
      case 'tabletop-opposed':
        return 'Face-to-Face';
      case 'split-vertical':
        return 'Top & Bottom';
    }
  };

  return (
    <header className="bg-slate-950/90 border-b border-slate-800 px-3 py-2 sm:px-5 sm:py-2.5 flex flex-col gap-2 relative z-20 backdrop-blur-md">
      <div className="flex items-center justify-between">
        {/* Left: App Brand & Match Info */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center shadow-md shadow-rose-950/40 text-white font-extrabold font-display text-base">
            <Sparkles className="w-5 h-5 text-amber-100" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-display font-extrabold text-sm sm:text-base tracking-wide text-white">
                Spelling Duel
              </h1>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                2-Player Screen
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Round {roundNumber} • Target: First to {settings.targetScore} pts
            </p>
          </div>
        </div>

        {/* Center: Live Head-to-Head Scoreboard with Target Progress Bars */}
        <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-2xl px-3 py-1.5 sm:px-4 sm:py-2 shadow-inner">
          {/* Team 1 Score & Progress */}
          <div className="flex flex-col items-end min-w-[70px] sm:min-w-[88px]">
            <div className="flex items-center gap-1">
              {isTeam1MatchPoint && (
                <span className="text-[9px] font-extrabold uppercase px-1 py-0.2 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse hidden xs:inline">
                  Match Point
                </span>
              )}
              <span
                className="text-[10px] font-bold uppercase tracking-wider block truncate max-w-[80px] sm:max-w-[100px]"
                style={{ color: team1Config.accentHex || '#fb7185' }}
              >
                {team1Config.name}
              </span>
            </div>

            <div className="flex items-center gap-1.5 mt-0.5">
              {team1State.streak >= 2 && (
                <div
                  className="relative flex items-center justify-center cursor-default"
                  title={`🔥 ${team1Config.name}: ${team1State.streak} Round Win Streak!`}
                >
                  <span className="absolute inset-0 rounded-full bg-amber-400/40 blur-[5px] animate-pulse pointer-events-none" />
                  <Crown className="w-4 h-4 text-amber-300 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.95)] relative z-10 animate-bounce" />
                </div>
              )}
              <div className="relative flex items-baseline gap-1">
                <span
                  className="font-display font-black text-xl sm:text-2xl leading-none"
                  style={{ color: team1Config.primaryHex || '#f43f5e' }}
                >
                  {team1State.score}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold font-mono">
                  /{targetScore}
                </span>
                <FloatingScoreBadge
                  triggerKey={team1ScoreAnimKey ?? null}
                  text="+1"
                  colorHex={team1Config.primaryHex || '#f43f5e'}
                />
              </div>
            </div>

            {/* Team 1 Target Progress Bar */}
            <div
              className="w-full h-1.5 sm:h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50 mt-1.5 relative flex justify-end"
              title={`${team1Config.name}: ${team1State.score}/${targetScore} points (${Math.round(team1Progress)}%)`}
            >
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  isTeam1MatchPoint ? 'shadow-sm shadow-rose-500/80 animate-pulse' : ''
                }`}
                style={{
                  width: `${team1Progress}%`,
                  backgroundColor: team1Config.primaryHex || '#f43f5e',
                }}
              />
            </div>
          </div>

          {/* Center VS & Tension-Animated Round Timer */}
          <div className="mx-2 sm:mx-3 flex flex-col items-center justify-center min-w-[42px] sm:min-w-[48px]">
            <span className="text-[10px] font-extrabold text-slate-500 tracking-wider">VS</span>
            {totalRoundSeconds > 0 && (
              <div className="relative flex items-center justify-center mt-0.5">
                {/* Pulsing warning aura when timer is critical */}
                {timerTension.pulseGlow && isRoundActive && (
                  <motion.div
                    animate={{ scale: [0.85, 1.45, 0.85], opacity: [0.3, 0.75, 0.3] }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -inset-1.5 rounded-full bg-red-500/30 blur-[4px] pointer-events-none"
                  />
                )}
                {/* Animated Scaling & Color-Changing Timer Text */}
                <motion.span
                  key={timerSeconds <= 10 ? timerSeconds : 'timer-stable'}
                  initial={{ scale: timerTension.tickScale }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 550,
                    damping: 14,
                    mass: 0.5,
                  }}
                  className={`font-mono leading-none tracking-tight select-none transition-colors duration-300 ${timerTension.colorClass} ${timerTension.sizeClass} ${timerTension.glowStyle}`}
                >
                  {timerSeconds}s
                </motion.span>
              </div>
            )}
          </div>

          {/* Team 2 Score & Progress */}
          <div className="flex flex-col items-start min-w-[70px] sm:min-w-[88px]">
            <div className="flex items-center gap-1">
              <span
                className="text-[10px] font-bold uppercase tracking-wider block truncate max-w-[80px] sm:max-w-[100px]"
                style={{ color: team2Config.accentHex || '#38bdf8' }}
              >
                {team2Config.name}
              </span>
              {isTeam2MatchPoint && (
                <span className="text-[9px] font-extrabold uppercase px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 animate-pulse hidden xs:inline">
                  Match Point
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="relative flex items-baseline gap-1">
                <span
                  className="font-display font-black text-xl sm:text-2xl leading-none"
                  style={{ color: team2Config.primaryHex || '#06b6d4' }}
                >
                  {team2State.score}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold font-mono">
                  /{targetScore}
                </span>
                <FloatingScoreBadge
                  triggerKey={team2ScoreAnimKey ?? null}
                  text="+1"
                  colorHex={team2Config.primaryHex || '#06b6d4'}
                />
              </div>
              {team2State.streak >= 2 && (
                <div
                  className="relative flex items-center justify-center cursor-default"
                  title={`🔥 ${team2Config.name}: ${team2State.streak} Round Win Streak!`}
                >
                  <span className="absolute inset-0 rounded-full bg-amber-400/40 blur-[5px] animate-pulse pointer-events-none" />
                  <Crown className="w-4 h-4 text-amber-300 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.95)] relative z-10 animate-bounce" />
                </div>
              )}
            </div>

            {/* Team 2 Target Progress Bar */}
            <div
              className="w-full h-1.5 sm:h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50 mt-1.5 relative flex justify-start"
              title={`${team2Config.name}: ${team2State.score}/${targetScore} points (${Math.round(team2Progress)}%)`}
            >
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  isTeam2MatchPoint ? 'shadow-sm shadow-cyan-500/80 animate-pulse' : ''
                }`}
                style={{
                  width: `${team2Progress}%`,
                  backgroundColor: team2Config.primaryHex || '#06b6d4',
                }}
              />
            </div>
          </div>
        </div>

        {/* Right: Quick Controls Bar */}
        <div className="flex items-center space-x-1 sm:space-x-1.5">
          {/* Orientation cycle button */}
          <button
            type="button"
            onClick={onCycleOrientation}
            title={`Screen Layout: ${getOrientationLabel(settings.orientation)} (Click to switch)`}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 active:bg-slate-800 text-slate-300 text-xs font-medium transition-colors"
          >
            <Layout className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline text-[11px]">
              {getOrientationLabel(settings.orientation)}
            </span>
          </button>

          {/* Sound FX Toggle */}
          <button
            type="button"
            onClick={onToggleSound}
            title={settings.soundEnabled ? 'Mute Sound FX' : 'Unmute Sound FX'}
            className="p-1.5 sm:p-2 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            aria-label="Toggle sound FX"
          >
            {settings.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Background Music Toggle */}
          <button
            type="button"
            onClick={onToggleMusic}
            title={
              settings.musicEnabled
                ? `Mute Music (${Math.round((settings.musicVolume ?? 0.35) * 100)}%)`
                : 'Play Background Music'
            }
            className={`p-1.5 sm:p-2 rounded-lg transition-all ${
              settings.musicEnabled
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-600/40 shadow-sm'
                : 'bg-slate-800/90 hover:bg-slate-700 text-slate-500 hover:text-slate-300'
            }`}
            aria-label="Toggle background music"
          >
            <Music className={`w-4 h-4 ${settings.musicEnabled ? 'text-indigo-400 animate-pulse' : ''}`} />
          </button>

          {/* Word History */}
          <button
            type="button"
            onClick={onOpenHistory}
            title="Word History & Definitions"
            className="p-1.5 sm:p-2 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Word History"
          >
            <History className="w-4 h-4" />
          </button>

          {/* Edit Team Names button */}
          <button
            type="button"
            onClick={onOpenTeamSetup}
            title="ટીમના નામ બદલો • Edit Team Names"
            className="p-1.5 sm:p-2 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-amber-300 transition-colors cursor-pointer"
            aria-label="Edit Team Names"
          >
            <Users className="w-4 h-4" />
          </button>

          {/* Match Settings */}
          <button
            type="button"
            onClick={onOpenSettings}
            title="Game Settings"
            className="p-1.5 sm:p-2 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Skip / Next Round or Restart */}
          {!isRoundActive ? (
            <button
              type="button"
              onClick={onNextRoundManual}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-md transition-all"
            >
              <span>Next Round</span>
              <RotateCw className="w-3 h-3" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onResetMatch}
              title="Restart Match"
              className="p-1.5 sm:p-2 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-400 hover:text-red-400 transition-colors"
              aria-label="Restart Match"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Round Timer Progress Bar with Dynamic Tension Gradient */}
      {totalRoundSeconds > 0 && (
        <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              timerSeconds <= 4
                ? 'bg-gradient-to-r from-red-600 via-rose-500 to-red-500 animate-pulse'
                : timerSeconds <= 8
                ? 'bg-gradient-to-r from-amber-500 via-rose-400 to-red-500'
                : timerSeconds <= 14
                ? 'bg-gradient-to-r from-emerald-400 via-amber-400 to-amber-500'
                : 'bg-gradient-to-r from-cyan-500 to-emerald-400'
            }`}
            style={{ width: `${Math.max(0, Math.min(100, timerPercentage))}%` }}
          />
        </div>
      )}
    </header>
  );
};
