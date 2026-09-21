import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Swords,
  Sparkles,
  Shuffle,
  Trophy,
  Play,
  Check,
} from 'lucide-react';
import { TeamColor, TeamConfig } from '../types';

interface TeamSetupModalProps {
  isOpen: boolean;
  team1Config: TeamConfig;
  team2Config: TeamConfig;
  targetScore: number;
  onSaveAndStart: (team1Name: string, team2Name: string, t1Color: TeamColor, t2Color: TeamColor) => void;
}

const COLOR_OPTIONS: { id: TeamColor; name: string; primary: string; accent: string }[] = [
  { id: 'ruby', name: 'Ruby Red', primary: '#f43f5e', accent: '#fb7185' },
  { id: 'azure', name: 'Azure Blue', primary: '#06b6d4', accent: '#38bdf8' },
  { id: 'emerald', name: 'Emerald Green', primary: '#10b981', accent: '#34d399' },
  { id: 'amber', name: 'Amber Gold', primary: '#f59e0b', accent: '#fbbf24' },
  { id: 'violet', name: 'Royal Violet', primary: '#8b5cf6', accent: '#a78bfa' },
];

const PRESET_NAMES_TEAM1 = [
  'Team Lions',
  'Red Warriors',
  'Super Spellers',
  'Fire Dragons',
  'Team Red',
  'Thunderbolt',
  'Word Wizards',
  'The Titans',
];

const PRESET_NAMES_TEAM2 = [
  'Team Tigers',
  'Blue Strikers',
  'Speed Masters',
  'Ice Hawks',
  'Team Blue',
  'Lightning',
  'Grammar Kings',
  'The Champions',
];

export const TeamSetupModal: React.FC<TeamSetupModalProps> = ({
  isOpen,
  team1Config,
  team2Config,
  targetScore,
  onSaveAndStart,
}) => {
  const [t1Name, setT1Name] = useState(team1Config.name || 'Team Red');
  const [t2Name, setT2Name] = useState(team2Config.name || 'Team Blue');
  const [t1Color, setT1Color] = useState<TeamColor>(team1Config.color || 'ruby');
  const [t2Color, setT2Color] = useState<TeamColor>(team2Config.color || 'azure');

  if (!isOpen) return null;

  const currentT1Color = COLOR_OPTIONS.find((c) => c.id === t1Color) || COLOR_OPTIONS[0];
  const currentT2Color = COLOR_OPTIONS.find((c) => c.id === t2Color) || COLOR_OPTIONS[1];

  const handleRandomizeNames = () => {
    const r1 = PRESET_NAMES_TEAM1[Math.floor(Math.random() * PRESET_NAMES_TEAM1.length)];
    const r2 = PRESET_NAMES_TEAM2[Math.floor(Math.random() * PRESET_NAMES_TEAM2.length)];
    setT1Name(r1);
    setT2Name(r2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalT1 = t1Name.trim() || 'Team 1';
    const finalT2 = t2Name.trim() || 'Team 2';
    onSaveAndStart(finalT1, finalT2, t1Color, t2Color);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
        {/* Ambient background glow */}
        <div
          className="absolute w-[500px] h-[500px] rounded-full pointer-events-none blur-3xl opacity-20"
          style={{
            background: `radial-gradient(circle, ${currentT1Color.primary} 0%, ${currentT2Color.primary} 100%)`,
          }}
        />

        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 25 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 24 }}
          className="bg-slate-900 border-2 border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl p-5 sm:p-7 relative z-10 flex flex-col my-auto"
        >
          {/* Header */}
          <div className="text-center mb-5">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-600 text-white shadow-lg shadow-rose-950/50 mb-2">
              <Swords className="w-6 h-6" />
            </div>
            <div className="inline-block mx-auto">
              <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full mb-1 inline-block">
                નવી રમત સેટઅપ • New Match Setup
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight">
              બંને ટીમના નામ લખો
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
              Enter names for Team 1 and Team 2 before entering the battle arena!
            </p>
          </div>

          {/* Form for Team Names */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Team 1 Card */}
              <div
                className="bg-slate-950/70 border-2 rounded-2xl p-3.5 sm:p-4 flex flex-col gap-3 transition-colors"
                style={{ borderColor: `${currentT1Color.primary}60` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-3.5 h-3.5 rounded-full ring-2 ring-white/20"
                      style={{ backgroundColor: currentT1Color.primary }}
                    />
                    <span
                      className="text-xs font-bold uppercase tracking-wider"
                      style={{ color: currentT1Color.accent }}
                    >
                      Team 1 (ટીમ ૧)
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">Player 1</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    ટીમ ૧ નું નામ (Team 1 Name)
                  </label>
                  <input
                    type="text"
                    value={t1Name}
                    onChange={(e) => setT1Name(e.target.value)}
                    maxLength={18}
                    placeholder="દા.ત. Team Red"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-semibold focus:outline-none focus:ring-2 placeholder-slate-500 transition-all"
                    style={{
                      borderColor: `${currentT1Color.primary}80`,
                    }}
                    autoFocus
                  />
                </div>

                {/* Color Selector */}
                <div>
                  <label className="block text-[10px] text-slate-400 font-medium mb-1">
                    ટીમ રંગ (Team Color)
                  </label>
                  <div className="flex items-center gap-1.5">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setT1Color(c.id)}
                        title={c.name}
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                          t1Color === c.id ? 'ring-2 ring-white scale-110 shadow-md' : 'opacity-60 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: c.primary }}
                      >
                        {t1Color === c.id && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {PRESET_NAMES_TEAM1.slice(0, 4).map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setT1Name(name)}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-medium transition-colors border border-slate-700/60"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Team 2 Card */}
              <div
                className="bg-slate-950/70 border-2 rounded-2xl p-3.5 sm:p-4 flex flex-col gap-3 transition-colors"
                style={{ borderColor: `${currentT2Color.primary}60` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-3.5 h-3.5 rounded-full ring-2 ring-white/20"
                      style={{ backgroundColor: currentT2Color.primary }}
                    />
                    <span
                      className="text-xs font-bold uppercase tracking-wider"
                      style={{ color: currentT2Color.accent }}
                    >
                      Team 2 (ટીમ ૨)
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">Player 2</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    ટીમ ૨ નું નામ (Team 2 Name)
                  </label>
                  <input
                    type="text"
                    value={t2Name}
                    onChange={(e) => setT2Name(e.target.value)}
                    maxLength={18}
                    placeholder="દા.ત. Team Blue"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-semibold focus:outline-none focus:ring-2 placeholder-slate-500 transition-all"
                    style={{
                      borderColor: `${currentT2Color.primary}80`,
                    }}
                  />
                </div>

                {/* Color Selector */}
                <div>
                  <label className="block text-[10px] text-slate-400 font-medium mb-1">
                    ટીમ રંગ (Team Color)
                  </label>
                  <div className="flex items-center gap-1.5">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setT2Color(c.id)}
                        title={c.name}
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                          t2Color === c.id ? 'ring-2 ring-white scale-110 shadow-md' : 'opacity-60 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: c.primary }}
                      >
                        {t2Color === c.id && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {PRESET_NAMES_TEAM2.slice(0, 4).map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setT2Name(name)}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-medium transition-colors border border-slate-700/60"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Target & Match Preview Info */}
            <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Target: First to <strong className="text-white">{targetScore} points</strong> wins the trophy</span>
              </div>
              <button
                type="button"
                onClick={handleRandomizeNames}
                className="flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                title="Randomize both team names"
              >
                <Shuffle className="w-3 h-3" />
                <span>Randomize</span>
              </button>
            </div>

            {/* Start Button */}
            <div className="flex items-center gap-3 mt-1">
              <button
                type="submit"
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 active:scale-[0.98] text-slate-950 font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 transition-all font-display cursor-pointer"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>રમત શરૂ કરો • Start Spelling Duel</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
