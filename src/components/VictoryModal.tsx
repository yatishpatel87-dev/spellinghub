import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RotateCcw, Award, History, Sparkles, Crown, Flame, Users, FileCheck } from 'lucide-react';
import { RoundHistoryItem, TeamConfig, TeamPlayState } from '../types';
import { playVictoryFanfare } from '../utils/sound';
import { CelebrationCanvas } from './CelebrationCanvas';
import { TeamCertificateModal } from './TeamCertificateModal';

interface VictoryModalProps {
  isOpen: boolean;
  winnerTeamId: 'team1' | 'team2';
  team1Config: TeamConfig;
  team2Config: TeamConfig;
  team1State: TeamPlayState;
  team2State: TeamPlayState;
  history: RoundHistoryItem[];
  soundEnabled: boolean;
  targetScore?: number;
  onPlayAgain: () => void;
  onOpenHistory: () => void;
  onChangeTeams?: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  winnerTeamId,
  team1Config,
  team2Config,
  team1State,
  team2State,
  history,
  soundEnabled,
  targetScore = 5,
  onPlayAgain,
  onOpenHistory,
  onChangeTeams,
}) => {
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [firecrackerKey, setFirecrackerKey] = useState(1);
  const winner = winnerTeamId === 'team1' ? team1Config : team2Config;
  const runnerUp = winnerTeamId === 'team1' ? team2Config : team1Config;
  const winnerScore = winnerTeamId === 'team1' ? team1State.score : team2State.score;
  const runnerUpScore = winnerTeamId === 'team1' ? team2State.score : team1State.score;

  React.useEffect(() => {
    if (isOpen) {
      playVictoryFanfare(soundEnabled);

      // Multi-cannon celebratory confetti bursts
      try {
        const count = 240;
        const defaults = {
          origin: { y: 0.68 },
          spread: 90,
          ticks: 300,
          colors: [
            winner.primaryHex,
            winner.accentHex,
            '#fbbf24',
            '#f59e0b',
            '#10b981',
            '#ffffff',
          ],
        };

        // Immediate center fountain
        confetti({
          ...defaults,
          particleCount: Math.floor(count * 0.45),
          spread: 75,
        });

        // Left and right side cannons
        const timer1 = setTimeout(() => {
          confetti({
            ...defaults,
            particleCount: Math.floor(count * 0.35),
            angle: 55,
            spread: 85,
            origin: { x: 0.05, y: 0.65 },
          });
          confetti({
            ...defaults,
            particleCount: Math.floor(count * 0.35),
            angle: 125,
            spread: 85,
            origin: { x: 0.95, y: 0.65 },
          });
        }, 300);

        const timer2 = setTimeout(() => {
          confetti({
            ...defaults,
            particleCount: Math.floor(count * 0.3),
            spread: 110,
            origin: { x: 0.5, y: 0.5 },
          });
        }, 750);

        return () => {
          clearTimeout(timer1);
          clearTimeout(timer2);
        };
      } catch {
        // Confetti handled silently
      }
    }
  }, [isOpen, soundEnabled, winner.primaryHex, winner.accentHex]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden">
        {/* Full-Screen Celebratory Particle Canvas with 10s automatic firecrackers */}
        <CelebrationCanvas
          key={firecrackerKey}
          winnerColorHex={winner.primaryHex}
          durationSeconds={10}
          soundEnabled={soundEnabled}
        />

        {/* Ambient Darkened Backdrop with Radial Victory Glow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-md"
        />

        {/* Pulsing Radial Victory Halo */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: [0.8, 1.25, 1], opacity: [0.2, 0.55, 0.35] }}
          transition={{ duration: 2.4, repeat: Infinity, repeatType: 'reverse' }}
          className="absolute w-[500px] h-[500px] sm:w-[650px] sm:h-[650px] rounded-full pointer-events-none blur-3xl"
          style={{
            background: `radial-gradient(circle, ${winner.primaryHex}55 0%, #f59e0b33 50%, transparent 75%)`,
          }}
        />

        {/* Main Victory Dialog Card with Dramatic 3D Spring Entrance */}
        <motion.div
          initial={{ opacity: 0, scale: 0.45, y: 90, rotateX: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 30 }}
          transition={{
            type: 'spring',
            damping: 18,
            stiffness: 240,
            mass: 0.85,
          }}
          style={{ transformPerspective: 1000 }}
          className="bg-slate-900/95 border-2 border-slate-700/80 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl shadow-black/80 flex flex-col text-center p-6 sm:p-8 relative z-50 backdrop-blur-xl"
        >
          {/* Top Sparkling Trophy Emblem */}
          <div className="mx-auto mb-3 relative flex items-center justify-center">
            {/* Animated Rotating Golden Aura */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute w-32 h-32 rounded-full border border-dashed border-amber-400/40 pointer-events-none"
            />

            {/* Glowing Trophy Base */}
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: [0, 1.35, 1], rotate: [-45, 12, 0] }}
              transition={{
                delay: 0.15,
                type: 'spring',
                damping: 12,
                stiffness: 280,
              }}
              className="w-22 h-22 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-200 flex items-center justify-center shadow-xl shadow-amber-500/50 relative z-10 border-4 border-amber-200/60"
            >
              <Trophy className="w-12 h-12 sm:w-13 sm:h-13 text-slate-950 stroke-[2.3]" />
            </motion.div>

            {/* Accompanying Floating Emblems */}
            <motion.div
              initial={{ scale: 0, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ delay: 0.35, type: 'spring', stiffness: 350 }}
              className="absolute -top-3 -right-2 bg-amber-400 text-slate-950 p-1.5 rounded-full shadow-lg border border-amber-200"
            >
              <Crown className="w-5 h-5 fill-slate-950" />
            </motion.div>

            <motion.div
              initial={{ scale: 0, x: -10 }}
              animate={{ scale: 1, x: 0 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 350 }}
              className="absolute -bottom-1 -left-2 bg-rose-500 text-white p-1 rounded-full shadow-lg"
            >
              <Sparkles className="w-4 h-4" />
            </motion.div>
          </div>

          {/* Champion Badge Banner */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.4 }}
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-extrabold uppercase tracking-widest mb-1 shadow-sm">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Match Champions</span>
            </div>

            <h2
              className="font-display font-black text-3xl sm:text-5xl tracking-tight mt-1 mb-1.5 drop-shadow-md"
              style={{ color: winner.accentHex || '#ffffff' }}
            >
              {winner.name} Wins!
            </h2>

            <p className="text-slate-300 text-xs sm:text-sm mb-5 font-medium">
              Outstanding spelling speed, vocabulary, and accuracy!
            </p>
          </motion.div>

          {/* Final Scoreboard Duel Card */}
          <motion.div
            initial={{ scale: 0.88, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 mb-5 flex items-center justify-around shadow-inner relative overflow-hidden"
          >
            {/* Winner Side */}
            <div className="flex flex-col items-center relative z-10">
              <div className="flex items-center gap-1 mb-1">
                <Award className="w-4 h-4 text-amber-400" />
                <span
                  className="text-xs font-bold truncate max-w-[120px]"
                  style={{ color: winner.accentHex || '#ffffff' }}
                >
                  {winner.name}
                </span>
              </div>
              <span
                className="font-display font-black text-3xl sm:text-4xl leading-none"
                style={{ color: winner.primaryHex || '#10b981' }}
              >
                {winnerScore}
              </span>
              <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider mt-1 px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/30">
                Winner 🏆
              </span>
            </div>

            <div className="text-slate-600 font-black text-base px-2">VS</div>

            {/* Runner Up Side */}
            <div className="flex flex-col items-center relative z-10">
              <span
                className="text-xs font-bold truncate max-w-[120px] mb-1 text-slate-400"
              >
                {runnerUp.name}
              </span>
              <span className="font-display font-black text-3xl sm:text-4xl text-slate-400 leading-none">
                {runnerUpScore}
              </span>
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-1 px-2 py-0.5 rounded bg-slate-800">
                Runner-Up
              </span>
            </div>
          </motion.div>

          {/* Match Word Highlights Preview */}
          {history.length > 0 && (
            <motion.div
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.4 }}
              className="bg-slate-950/50 rounded-xl p-3 mb-5 border border-slate-800/80 text-left"
            >
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-medium">
                <span>Words Mastered ({history.length} rounds)</span>
                <button
                  type="button"
                  onClick={onOpenHistory}
                  className="text-amber-400 hover:text-amber-300 text-[11px] font-semibold underline cursor-pointer"
                >
                  View Definitions
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                {history.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded bg-slate-800/90 border border-slate-700/80 text-xs font-mono font-bold text-slate-200 shadow-sm"
                  >
                    {item.word.word}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Certificate Generation & Firecrackers Feature Banner */}
          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.4 }}
            className="flex flex-col gap-2 mb-4"
          >
            <button
              type="button"
              onClick={() => setIsCertificateOpen(true)}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-400 hover:from-amber-400 hover:to-yellow-300 active:scale-[0.98] text-slate-950 font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-amber-500/30 transition-all font-display border border-amber-200 cursor-pointer"
            >
              <Award className="w-5 h-5 text-slate-950 stroke-[2.4]" />
              <span>પ્રમાણપત્ર મેળવો • View Certificates (બંને ટીમ)</span>
              <Sparkles className="w-4 h-4 text-amber-950" />
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFirecrackerKey((k) => k + 1)}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:scale-[0.98] text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all border border-rose-500/30 shadow-sm cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                <span>ફાયરક્રેકર્સ ફોડો (10s) 🎆</span>
              </button>

              <button
                type="button"
                onClick={onOpenHistory}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:scale-[0.98] text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all border border-slate-700 shadow-sm cursor-pointer"
              >
                <History className="w-3.5 h-3.5 text-slate-400" />
                <span>શબ્દો જુઓ ({history.length})</span>
              </button>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-2.5"
          >
            {onChangeTeams && (
              <button
                type="button"
                onClick={onChangeTeams}
                className="w-full sm:flex-1 py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-amber-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all border border-amber-500/30 shadow-md cursor-pointer"
              >
                <Users className="w-4 h-4" />
                <span>Change Teams</span>
              </button>
            )}

            <button
              type="button"
              onClick={onPlayAgain}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 active:scale-[0.98] text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xl shadow-emerald-500/30 transition-all font-display cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 stroke-[2.5]" />
              <span>Rematch</span>
            </button>
          </motion.div>
        </motion.div>

        {/* Certificate Modal for Both Teams */}
        <TeamCertificateModal
          isOpen={isCertificateOpen}
          onClose={() => setIsCertificateOpen(false)}
          winnerTeamId={winnerTeamId}
          team1Config={team1Config}
          team2Config={team2Config}
          team1State={team1State}
          team2State={team2State}
          history={history}
          targetScore={targetScore}
          onTriggerFirecrackers={() => setFirecrackerKey((k) => k + 1)}
        />
      </div>
    </AnimatePresence>
  );
};

