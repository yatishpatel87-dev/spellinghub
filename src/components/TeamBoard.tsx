import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Volume2,
  Shuffle,
  RotateCcw,
  Lightbulb,
  CheckCircle2,
  XCircle,
  Flame,
  Languages,
  HelpCircle,
  Crown,
} from 'lucide-react';
import { LetterTile, TeamConfig, TeamPlayState, WordItem } from '../types';
import { speakWord } from '../utils/sound';
import { FloatingScoreBadge } from './FloatingScoreBadge';

interface TeamBoardProps {
  teamConfig: TeamConfig;
  playState: TeamPlayState;
  targetWord: WordItem;
  isRoundActive: boolean;
  roundWinnerTeamId: string | null;
  showGujaratiHints: boolean;
  isRotated180?: boolean;
  scoreAnimKey?: number | string | null;
  onTileSelect: (tile: LetterTile) => void;
  onAnswerTileRemove: (index: number) => void;
  onClearAnswer: () => void;
  onShuffleTiles: () => void;
  onUseHint: () => void;
  onSubmitAnswer: () => void;
}

export const TeamBoard: React.FC<TeamBoardProps> = ({
  teamConfig,
  playState,
  targetWord,
  isRoundActive,
  roundWinnerTeamId,
  showGujaratiHints,
  isRotated180 = false,
  scoreAnimKey,
  onTileSelect,
  onAnswerTileRemove,
  onClearAnswer,
  onShuffleTiles,
  onUseHint,
  onSubmitAnswer,
}) => {
  const [showMeaningTooltip, setShowMeaningTooltip] = React.useState(false);
  const targetLetters = targetWord.word.toUpperCase().split('');
  const isWinner = roundWinnerTeamId === teamConfig.id;
  const isOtherTeamWinner = roundWinnerTeamId && roundWinnerTeamId !== teamConfig.id;

  // Color theme variables based on team
  const isRuby = teamConfig.color === 'ruby';
  const isAzure = teamConfig.color === 'azure';
  const isEmerald = teamConfig.color === 'emerald';
  const isAmber = teamConfig.color === 'amber';

  const themeClasses = {
    bgGradient: isRuby
      ? 'from-rose-950/40 via-slate-900 to-slate-950 border-rose-500/30'
      : isAzure
      ? 'from-cyan-950/40 via-slate-900 to-slate-950 border-cyan-500/30'
      : isEmerald
      ? 'from-emerald-950/40 via-slate-900 to-slate-950 border-emerald-500/30'
      : 'from-amber-950/40 via-slate-900 to-slate-950 border-amber-500/30',
    headerBadge: isRuby
      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
      : isAzure
      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
      : isEmerald
      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
      : 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    tileBtn: isRuby
      ? 'bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white shadow-rose-900/50 border-rose-400'
      : isAzure
      ? 'bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white shadow-cyan-900/50 border-cyan-400'
      : isEmerald
      ? 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-emerald-900/50 border-emerald-400'
      : 'bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white shadow-amber-900/50 border-amber-400',
    tileSlotActive: isRuby
      ? 'border-rose-500/80 bg-rose-950/30 text-rose-100'
      : isAzure
      ? 'border-cyan-500/80 bg-cyan-950/30 text-cyan-100'
      : isEmerald
      ? 'border-emerald-500/80 bg-emerald-950/30 text-emerald-100'
      : 'border-amber-500/80 bg-amber-950/30 text-amber-100',
    accentText: isRuby
      ? 'text-rose-400'
      : isAzure
      ? 'text-cyan-400'
      : isEmerald
      ? 'text-emerald-400'
      : 'text-amber-400',
    accentRing: isRuby
      ? 'focus:ring-rose-500'
      : isAzure
      ? 'focus:ring-cyan-500'
      : isEmerald
      ? 'focus:ring-emerald-500'
      : 'focus:ring-amber-500',
  };

  const isFullAnswer = playState.currentAnswer.length === targetLetters.length;

  return (
    <div
      id={`team-board-${teamConfig.id}`}
      className={`relative flex flex-col h-full w-full rounded-2xl border bg-gradient-to-b ${themeClasses.bgGradient} p-3 sm:p-4 shadow-xl overflow-hidden transition-transform duration-300 ${
        isRotated180 ? 'rotate-180' : ''
      } ${playState.isWrongShake ? 'animate-shake ring-2 ring-red-500' : ''}`}
    >
      {/* Round Won / Solved Overlay */}
      <AnimatePresence>
        {isWinner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 text-center"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mb-3 animate-pop shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-400" />
            </div>
            <span className="text-xl sm:text-2xl font-bold font-display text-emerald-400 tracking-wide">
              ROUND WINNER!
            </span>
            <p className="text-slate-300 text-sm mt-1">
              Correct word was <span className="text-white font-bold tracking-widest">{targetWord.word}</span>
            </p>
            <div className="mt-2 text-xs text-slate-400">
              {targetWord.gujaratiMeaning}
            </div>
            <div className="mt-3 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-xs text-emerald-300 font-semibold">
              +1 Point & Streak Bonus!
            </div>
          </motion.div>
        )}

        {isOtherTeamWinner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/70 backdrop-blur-[2px] p-4 text-center"
          >
            <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-2">
              <XCircle className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-slate-300 font-semibold text-sm">Opponent was faster!</p>
            <p className="text-slate-400 text-xs mt-1">
              Word: <span className="text-slate-200 font-mono font-bold tracking-wider">{targetWord.word}</span>
            </p>
            <p className="text-slate-500 text-[11px] mt-0.5">{targetWord.gujaratiMeaning}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Team Top Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80">
        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
          <div
            className={`w-3 h-3 rounded-full ${
              isRuby ? 'bg-rose-500' : isAzure ? 'bg-cyan-500' : isEmerald ? 'bg-emerald-500' : 'bg-amber-500'
            } ring-2 ring-white/20`}
          />
          <h2 className="font-bold font-display text-base sm:text-lg tracking-wide text-white">
            {teamConfig.name}
          </h2>
          {/* Small Win Streak Counter Badge */}
          {playState.streak >= 2 && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold tracking-tight px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 via-yellow-500/25 to-amber-500/20 text-amber-300 border border-amber-400/40 shadow-sm shadow-amber-500/10 animate-pulse whitespace-nowrap"
              title={`${teamConfig.name}: ${playState.streak} Round Win Streak!`}
            >
              <Flame className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
              <span>{playState.streak} Win Streak</span>
            </motion.div>
          )}
        </div>

        {/* Team Score badge with glowing crown icon when on win streak */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium hidden xs:inline">Score</span>
          <div className="flex items-center gap-1.5">
            {playState.streak >= 2 && (
              <div
                className="relative flex items-center justify-center cursor-default"
                title={`🔥 ${teamConfig.name} is on a ${playState.streak}-round win streak!`}
              >
                <span className="absolute inset-0 rounded-full bg-amber-400/40 blur-[6px] animate-pulse pointer-events-none" />
                <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.95)] relative z-10 animate-bounce" />
              </div>
            )}
            <div
              className={`relative px-3 py-0.5 sm:py-1 rounded-xl font-display font-extrabold text-lg sm:text-xl border shadow-inner ${themeClasses.headerBadge}`}
            >
              {playState.score}
              <FloatingScoreBadge
                triggerKey={scoreAnimKey ?? (isWinner ? playState.score : null)}
                text="+1"
                colorHex={teamConfig.primaryHex}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Clue & Word Hint Box */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 sm:p-3 mb-3 flex flex-col gap-1.5 shadow-sm">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium text-[11px]">
              {targetWord.category}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-400 text-[11px] italic">
              {targetWord.partOfSpeech}
            </span>
            <span className="text-[11px] text-slate-500">
              {targetWord.word.length} letters
            </span>
          </div>

          {/* Pronunciation & Clue Audio */}
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={() => speakWord(targetWord.word)}
              title="Pronounce word audio"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white transition-all"
              aria-label="Speak pronunciation"
            >
              <Volume2 className="w-4 h-4" />
            </button>

            {/* Gujarati meaning trigger */}
            <button
              type="button"
              onClick={() => setShowMeaningTooltip(!showMeaningTooltip)}
              title="Gujarati Meaning / ગુજરાતી અર્થ"
              className={`p-1.5 rounded-lg transition-all text-xs flex items-center gap-1 ${
                showMeaningTooltip || showGujaratiHints
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Languages className="w-3.5 h-3.5" />
              <span className="text-[10px] font-medium hidden sm:inline">અર્થ</span>
            </button>
          </div>
        </div>

        {/* English Clue Sentence / Definition */}
        <p className="text-slate-200 text-xs sm:text-sm leading-relaxed font-medium">
          {targetWord.clueSentence}
        </p>

        {/* Definition */}
        <p className="text-slate-400 text-[11px] leading-tight line-clamp-2">
          {targetWord.definition}
        </p>

        {/* Gujarati Clue Bar (Shown if toggled or user setting is enabled) */}
        {(showMeaningTooltip || showGujaratiHints) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-1 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-xs bg-amber-950/20 px-2 py-1 rounded-md border border-amber-500/20"
          >
            <span className="text-slate-400 text-[11px]">ગુજરાતી અર્થ:</span>
            <span className="text-amber-300 font-bold text-xs sm:text-sm tracking-wide font-sans">
              {targetWord.gujaratiMeaning}
            </span>
          </motion.div>
        )}
      </div>

      {/* Answer Slots Rack */}
      <div className="flex-1 flex flex-col justify-center items-center py-2">
        <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5 flex items-center gap-1">
          <span>Arrange Spelling</span>
          <span className="text-slate-500 text-[10px]">
            ({playState.currentAnswer.length}/{targetLetters.length})
          </span>
        </div>

        {/* Target Answer Slots */}
        <div className="flex flex-wrap justify-center items-center gap-1.5 sm:gap-2 max-w-full px-2 py-1">
          {targetLetters.map((_, idx) => {
            const placedTile = playState.currentAnswer[idx];
            const isRevealedHint = playState.revealedIndices.includes(idx);

            return (
              <motion.button
                key={`slot-${teamConfig.id}-${idx}`}
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={() => placedTile && onAnswerTileRemove(idx)}
                disabled={!isRoundActive || !placedTile}
                title={placedTile ? 'Tap to remove letter' : `Slot ${idx + 1}`}
                className={`w-8 h-10 xs:w-9 xs:h-11 sm:w-11 sm:h-13 md:w-12 md:h-14 rounded-xl flex items-center justify-center font-display font-extrabold text-base xs:text-lg sm:text-2xl transition-all relative border-2 ${
                  placedTile
                    ? `${themeClasses.tileSlotActive} shadow-md border-solid cursor-pointer`
                    : 'border-dashed border-slate-700/80 bg-slate-900/40 text-transparent'
                }`}
              >
                {placedTile ? (
                  <span className="animate-pop">{placedTile.char}</span>
                ) : (
                  <span className="text-xs text-slate-600 font-normal">{idx + 1}</span>
                )}

                {isRevealedHint && (
                  <span
                    title="Hint letter"
                    className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full flex items-center justify-center text-[9px] text-slate-900 font-black shadow"
                  >
                    ★
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        {playState.currentAnswer.length > 0 && (
          <p className="text-[10px] text-slate-400 mt-1">
            Tap a letter above to remove it
          </p>
        )}
      </div>

      {/* Scrambled Available Letter Tiles Pool */}
      <div className="mt-auto pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
          <span className="font-semibold tracking-wider uppercase text-[10px]">
            Tap Letters to Build Word:
          </span>
          <span className="text-[10px] text-slate-500">
            {playState.availableTiles.length} left
          </span>
        </div>

        <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 min-h-[52px] sm:min-h-[64px] items-center py-1">
          {playState.availableTiles.length === 0 ? (
            <div className="text-center py-2 text-xs text-slate-500 font-medium italic">
              All letters placed! Checking spelling...
            </div>
          ) : (
            playState.availableTiles.map((tile) => (
              <motion.button
                key={tile.id}
                type="button"
                whileHover={{ scale: 1.06, y: -2 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => isRoundActive && onTileSelect(tile)}
                disabled={!isRoundActive}
                className={`w-9 h-11 xs:w-10 xs:h-12 sm:w-12 sm:h-14 md:w-13 md:h-15 rounded-xl border-b-4 flex items-center justify-center font-display font-extrabold text-lg sm:text-2xl shadow-lg transition-transform cursor-pointer active:translate-y-1 ${themeClasses.tileBtn}`}
              >
                {tile.char}
              </motion.button>
            ))
          )}
        </div>

        {/* Action Controls Bar */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mt-2 pt-2 border-t border-slate-800/60">
          {/* Shuffle */}
          <button
            type="button"
            onClick={onShuffleTiles}
            disabled={!isRoundActive || playState.availableTiles.length <= 1}
            title="Shuffle available letters"
            className="flex items-center justify-center gap-1 py-2 px-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 active:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 text-xs font-semibold transition-colors"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Shuffle</span>
          </button>

          {/* Clear */}
          <button
            type="button"
            onClick={onClearAnswer}
            disabled={!isRoundActive || playState.currentAnswer.length === 0}
            title="Clear and reset letters"
            className="flex items-center justify-center gap-1 py-2 px-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 active:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 text-xs font-semibold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Clear</span>
          </button>

          {/* Hint */}
          <button
            type="button"
            onClick={onUseHint}
            disabled={
              !isRoundActive ||
              playState.revealedIndices.length >= targetLetters.length - 1 ||
              isFullAnswer
            }
            title="Reveal next correct letter (-50 pts bonus)"
            className="flex items-center justify-center gap-1 py-2 px-1 rounded-lg bg-amber-950/40 border border-amber-500/30 hover:bg-amber-900/50 active:bg-amber-950/60 disabled:opacity-40 disabled:cursor-not-allowed text-amber-300 text-xs font-semibold transition-colors"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden xs:inline">Hint</span>
          </button>

          {/* Submit / Check */}
          <button
            type="button"
            onClick={onSubmitAnswer}
            disabled={!isRoundActive || !isFullAnswer}
            title="Submit Word"
            className={`flex items-center justify-center gap-1 py-2 px-1 rounded-lg font-bold text-xs transition-all ${
              isFullAnswer && isRoundActive
                ? 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-lg shadow-emerald-900/50 animate-pulse'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Check</span>
          </button>
        </div>
      </div>
    </div>
  );
};
