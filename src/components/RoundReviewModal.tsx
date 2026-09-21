import React, { useState, useMemo } from 'react';
import { X, Volume2, BookOpen, Zap, Timer, Gauge, Target } from 'lucide-react';
import { RoundHistoryItem, TeamConfig } from '../types';
import { speakWord } from '../utils/sound';

interface RoundReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: RoundHistoryItem[];
  allMatchesHistory?: RoundHistoryItem[];
  team1Config: TeamConfig;
  team2Config: TeamConfig;
}

interface TeamEfficiencyMetrics {
  wordsSolved: number;
  totalSolveTime: number;
  avgTimePerWord: string | null;
  correctSubmissions: number;
  wrongSubmissions: number;
  totalSubmissions: number;
  accuracyPercentage: number;
  winRate: number;
}

function computeTeamEfficiency(rounds: RoundHistoryItem[], teamId: 'team1' | 'team2'): TeamEfficiencyMetrics {
  const wonRounds = rounds.filter((r) => r.winnerTeamId === teamId);
  const wordsSolved = wonRounds.length;
  const totalSolveTime = wonRounds.reduce((sum, r) => sum + (r.timeTakenSeconds || 0), 0);

  const avgTimePerWord = wordsSolved > 0 ? (totalSolveTime / wordsSolved).toFixed(1) : null;

  let correctSubmissions = 0;
  let wrongSubmissions = 0;

  rounds.forEach((r) => {
    const subs = teamId === 'team1' ? r.team1Submissions : r.team2Submissions;
    if (subs) {
      correctSubmissions += subs.correct || 0;
      wrongSubmissions += subs.wrong || 0;
    } else if (r.winnerTeamId === teamId) {
      correctSubmissions += 1;
    }
  });

  const totalSubmissions = correctSubmissions + wrongSubmissions;
  let accuracyPercentage = 0;
  if (totalSubmissions > 0) {
    accuracyPercentage = Math.round((correctSubmissions / totalSubmissions) * 100);
  } else if (wordsSolved > 0) {
    accuracyPercentage = 100;
  }

  const winRate = rounds.length > 0 ? Math.round((wordsSolved / rounds.length) * 100) : 0;

  return {
    wordsSolved,
    totalSolveTime,
    avgTimePerWord,
    correctSubmissions,
    wrongSubmissions,
    totalSubmissions,
    accuracyPercentage,
    winRate,
  };
}

export const RoundReviewModal: React.FC<RoundReviewModalProps> = ({
  isOpen,
  onClose,
  history,
  allMatchesHistory,
  team1Config,
  team2Config,
}) => {
  const [selectedScope, setSelectedScope] = useState<'all' | 'current'>('all');

  // Fallback to history if allMatchesHistory is not provided or empty
  const cumulativeRounds = useMemo(() => {
    if (allMatchesHistory && allMatchesHistory.length > 0) {
      return allMatchesHistory;
    }
    return history;
  }, [allMatchesHistory, history]);

  const hasMultipleMatches = useMemo(() => {
    if (!allMatchesHistory || allMatchesHistory.length <= history.length) return false;
    const uniqueMatches = new Set(allMatchesHistory.map((h) => h.matchNumber || 1));
    return uniqueMatches.size > 1 || allMatchesHistory.length > history.length;
  }, [allMatchesHistory, history]);

  const activeDataset = useMemo(() => {
    if (selectedScope === 'all') {
      return cumulativeRounds;
    }
    return history;
  }, [selectedScope, cumulativeRounds, history]);

  // Compute efficiency metrics for both teams
  const t1Metrics = useMemo(() => computeTeamEfficiency(activeDataset, 'team1'), [activeDataset]);
  const t2Metrics = useMemo(() => computeTeamEfficiency(activeDataset, 'team2'), [activeDataset]);

  // Comparative efficiency highlights
  const isT1Faster =
    t1Metrics.avgTimePerWord !== null &&
    (t2Metrics.avgTimePerWord === null || parseFloat(t1Metrics.avgTimePerWord) < parseFloat(t2Metrics.avgTimePerWord));
  const isT2Faster =
    t2Metrics.avgTimePerWord !== null &&
    (t1Metrics.avgTimePerWord === null || parseFloat(t2Metrics.avgTimePerWord) < parseFloat(t1Metrics.avgTimePerWord));

  const isT1MoreAccurate =
    t1Metrics.accuracyPercentage > 0 &&
    t1Metrics.accuracyPercentage > t2Metrics.accuracyPercentage;
  const isT2MoreAccurate =
    t2Metrics.accuracyPercentage > 0 &&
    t2Metrics.accuracyPercentage > t1Metrics.accuracyPercentage;

  // Find the fastest solve record across activeDataset
  const solvedRounds = activeDataset.filter(
    (item) =>
      (item.winnerTeamId === 'team1' || item.winnerTeamId === 'team2') &&
      item.timeTakenSeconds > 0
  );

  const fastestRound =
    solvedRounds.length > 0
      ? solvedRounds.reduce((best, curr) =>
          curr.timeTakenSeconds < best.timeTakenSeconds ? curr : best
        )
      : null;

  const fastestTime = fastestRound ? fastestRound.timeTakenSeconds : null;
  const fastestTeamConfig = fastestRound
    ? fastestRound.winnerTeamId === 'team1'
      ? team1Config
      : team2Config
    : null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/50 shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <h3 className="font-display font-bold text-lg text-white">
              Words Dictionary & Review ({activeDataset.length})
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="overflow-y-auto flex-1 p-4 space-y-3">
          {/* Round Efficiency & Team Performance Section */}
          <div
            id="round-efficiency-section"
            className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 shadow-inner"
          >
            {/* Efficiency Header & Scope Selector */}
            <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                  <Gauge className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm text-white tracking-wide flex items-center gap-1.5 flex-wrap">
                    <span>Round Efficiency</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-slate-800 text-slate-300 border border-slate-700">
                      {selectedScope === 'all' && hasMultipleMatches
                        ? `Across Completed Matches (${activeDataset.length} rounds)`
                        : `Current Match (${activeDataset.length} rounds)`}
                    </span>
                  </h4>
                </div>
              </div>

              {/* View Scope Toggle if multiple matches exist */}
              {hasMultipleMatches && (
                <div className="flex items-center p-0.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedScope('all')}
                    className={`px-2.5 py-0.5 rounded-md font-semibold transition-colors ${
                      selectedScope === 'all'
                        ? 'bg-cyan-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All Matches
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedScope('current')}
                    className={`px-2.5 py-0.5 rounded-md font-semibold transition-colors ${
                      selectedScope === 'current'
                        ? 'bg-cyan-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Current
                  </button>
                </div>
              )}
            </div>

            {/* Side-by-Side Team Efficiency Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Team 1 Efficiency Card */}
              <div
                id="team1-efficiency-card"
                className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 flex flex-col gap-2.5 relative overflow-hidden"
                style={{ borderTopColor: team1Config.primaryHex || '#f43f5e', borderTopWidth: '3px' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: team1Config.primaryHex }}
                    />
                    <span
                      className="font-display font-bold text-sm truncate"
                      style={{ color: team1Config.primaryHex }}
                    >
                      {team1Config.name}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-slate-300 px-2 py-0.5 rounded bg-slate-800 border border-slate-700/60 shrink-0">
                    {t1Metrics.wordsSolved} Solved
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* Average Time per Word */}
                  <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-0.5">
                      <span className="flex items-center gap-1 font-medium">
                        <Timer className="w-3 h-3 text-cyan-400" />
                        Avg Time
                      </span>
                      {isT1Faster && t1Metrics.wordsSolved > 0 && (
                        <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-300 font-bold">
                          ⚡ Faster
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="font-display font-black text-lg text-white font-mono">
                        {t1Metrics.avgTimePerWord ? `${t1Metrics.avgTimePerWord}s` : '—'}
                      </span>
                      <span className="text-[10px] text-slate-400">/ word</span>
                    </div>
                    <span className="text-[10px] text-slate-500 truncate mt-0.5">
                      {t1Metrics.wordsSolved > 0 ? `${t1Metrics.totalSolveTime.toFixed(1)}s total` : 'No solves yet'}
                    </span>
                  </div>

                  {/* Accuracy Percentage */}
                  <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-0.5">
                      <span className="flex items-center gap-1 font-medium">
                        <Target className="w-3 h-3 text-emerald-400" />
                        Accuracy
                      </span>
                      {isT1MoreAccurate && (
                        <span className="text-[9px] px-1 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                          🎯 Leader
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="font-display font-black text-lg text-white font-mono">
                        {t1Metrics.totalSubmissions > 0 || t1Metrics.wordsSolved > 0
                          ? `${t1Metrics.accuracyPercentage}%`
                          : '—'}
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${t1Metrics.accuracyPercentage}%`,
                          backgroundColor: team1Config.primaryHex || '#f43f5e',
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 truncate mt-0.5">
                      {t1Metrics.totalSubmissions > 0
                        ? `${t1Metrics.correctSubmissions}/${t1Metrics.totalSubmissions} guesses correct`
                        : `${t1Metrics.wordsSolved} clean solves`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Team 2 Efficiency Card */}
              <div
                id="team2-efficiency-card"
                className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 flex flex-col gap-2.5 relative overflow-hidden"
                style={{ borderTopColor: team2Config.primaryHex || '#06b6d4', borderTopWidth: '3px' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: team2Config.primaryHex }}
                    />
                    <span
                      className="font-display font-bold text-sm truncate"
                      style={{ color: team2Config.primaryHex }}
                    >
                      {team2Config.name}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-slate-300 px-2 py-0.5 rounded bg-slate-800 border border-slate-700/60 shrink-0">
                    {t2Metrics.wordsSolved} Solved
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* Average Time per Word */}
                  <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-0.5">
                      <span className="flex items-center gap-1 font-medium">
                        <Timer className="w-3 h-3 text-cyan-400" />
                        Avg Time
                      </span>
                      {isT2Faster && t2Metrics.wordsSolved > 0 && (
                        <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-300 font-bold">
                          ⚡ Faster
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="font-display font-black text-lg text-white font-mono">
                        {t2Metrics.avgTimePerWord ? `${t2Metrics.avgTimePerWord}s` : '—'}
                      </span>
                      <span className="text-[10px] text-slate-400">/ word</span>
                    </div>
                    <span className="text-[10px] text-slate-500 truncate mt-0.5">
                      {t2Metrics.wordsSolved > 0 ? `${t2Metrics.totalSolveTime.toFixed(1)}s total` : 'No solves yet'}
                    </span>
                  </div>

                  {/* Accuracy Percentage */}
                  <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-0.5">
                      <span className="flex items-center gap-1 font-medium">
                        <Target className="w-3 h-3 text-emerald-400" />
                        Accuracy
                      </span>
                      {isT2MoreAccurate && (
                        <span className="text-[9px] px-1 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                          🎯 Leader
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="font-display font-black text-lg text-white font-mono">
                        {t2Metrics.totalSubmissions > 0 || t2Metrics.wordsSolved > 0
                          ? `${t2Metrics.accuracyPercentage}%`
                          : '—'}
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${t2Metrics.accuracyPercentage}%`,
                          backgroundColor: team2Config.primaryHex || '#06b6d4',
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 truncate mt-0.5">
                      {t2Metrics.totalSubmissions > 0
                        ? `${t2Metrics.correctSubmissions}/${t2Metrics.totalSubmissions} guesses correct`
                        : `${t2Metrics.wordsSolved} clean solves`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Speed Demon Spotlight Card */}
          {fastestRound && fastestTeamConfig && (
            <div
              id="speed-demon-spotlight"
              className="p-3 sm:p-3.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 border border-amber-500/40 flex items-center justify-between gap-3 shadow-md shadow-amber-500/5"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-500 flex items-center justify-center text-slate-950 font-black shadow-md shadow-orange-500/25 shrink-0">
                  <Zap className="w-5 h-5 fill-slate-950 stroke-[2.5]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      id="speed-demon-header-badge"
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-sm"
                    >
                      <Zap className="w-3 h-3 fill-slate-950" />
                      Speed Demon
                    </span>
                    <span className="text-xs text-amber-300 font-bold font-mono">
                      {fastestRound.timeTakenSeconds}s Record
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 truncate">
                    <strong
                      style={{ color: fastestTeamConfig.primaryHex || '#fbbf24' }}
                    >
                      {fastestTeamConfig.name}
                    </strong>{' '}
                    completed <span className="text-white font-bold">&ldquo;{fastestRound.word.word}&rdquo;</span> fastest in Round #{fastestRound.roundNumber}!
                  </p>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-amber-500/30 text-xs font-mono font-bold text-amber-300 shrink-0">
                <Timer className="w-3.5 h-3.5 text-amber-400" />
                <span>{fastestRound.timeTakenSeconds}s</span>
              </div>
            </div>
          )}

          {/* Word Dictionary List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
              Dictionary & Solved Words ({activeDataset.length})
            </h4>

            {activeDataset.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-sm">
                No rounds completed yet. Play some words to see efficiency stats and dictionary!
              </div>
            ) : (
              activeDataset.map((item, idx) => {
                const winnerName =
                  item.winnerTeamId === 'team1'
                    ? team1Config.name
                    : item.winnerTeamId === 'team2'
                    ? team2Config.name
                    : 'Time Out / Draw';

                const winnerColor =
                  item.winnerTeamId === 'team1'
                    ? 'text-rose-400 border-rose-500/30 bg-rose-500/10'
                    : item.winnerTeamId === 'team2'
                    ? 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10'
                    : 'text-slate-400 border-slate-700 bg-slate-800';

                const isFastest =
                  fastestTime !== null &&
                  item.timeTakenSeconds === fastestTime &&
                  (item.winnerTeamId === 'team1' || item.winnerTeamId === 'team2');

                return (
                  <div
                    key={idx}
                    id={`round-review-item-${idx}`}
                    className={`border rounded-xl p-3.5 flex flex-col gap-2 transition-all ${
                      isFastest
                        ? 'bg-slate-950/90 border-amber-500/50 shadow-md shadow-amber-500/5 ring-1 ring-amber-500/30'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-black text-xl text-white tracking-wide">
                          {item.word.word}
                        </span>
                        <button
                          type="button"
                          onClick={() => speakWord(item.word.word)}
                          title="Listen to pronunciation"
                          className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                          {item.word.partOfSpeech}
                        </span>
                        {item.matchNumber && item.matchNumber > 1 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-850 text-slate-500 border border-slate-800">
                            Match #{item.matchNumber}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        {isFastest && (
                          <span
                            id={`speed-demon-badge-${idx}`}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-slate-950 font-black text-[10px] tracking-wide shadow-sm shadow-amber-500/25 animate-pulse"
                          >
                            <Zap className="w-3 h-3 fill-slate-950 stroke-[2.5]" />
                            <span>SPEED DEMON</span>
                          </span>
                        )}

                        {item.timeTakenSeconds > 0 && (
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded-full border font-mono flex items-center gap-1 ${
                              isFastest
                                ? 'text-amber-300 border-amber-500/40 bg-amber-500/15 font-bold'
                                : 'text-slate-400 border-slate-700 bg-slate-900/80'
                            }`}
                          >
                            <Timer className="w-3 h-3" />
                            {item.timeTakenSeconds}s
                          </span>
                        )}

                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${winnerColor}`}
                        >
                          Solved by: {winnerName}
                        </span>
                      </div>
                    </div>

                    {/* Gujarati meaning */}
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-slate-500">ગુજરાતી:</span>
                      <span className="text-amber-300 font-semibold">
                        {item.word.gujaratiMeaning}
                      </span>
                    </div>

                    {/* Definition */}
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {item.word.definition}
                    </p>

                    {/* Example sentence */}
                    <p className="text-[11px] text-slate-400 italic">
                      &ldquo;{item.word.clueSentence.replace('____', item.word.word)}&rdquo;
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-center shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
          >
            Close Dictionary
          </button>
        </div>
      </div>
    </div>
  );
};
