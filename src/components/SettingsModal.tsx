import React from 'react';
import {
  X,
  Check,
  Sliders,
  Monitor,
  Globe,
  Shield,
  RefreshCcw,
  Music,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { GameSettings, TeamConfig, DifficultyLevel, ScreenOrientation } from '../types';
import { WORD_CATEGORIES } from '../data/words';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onSaveSettings: (newSettings: GameSettings) => void;
  team1Config: TeamConfig;
  team2Config: TeamConfig;
  onSaveTeamConfigs: (t1: TeamConfig, t2: TeamConfig) => void;
  onRestartMatchWithSettings: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  team1Config,
  team2Config,
  onSaveTeamConfigs,
  onRestartMatchWithSettings,
}) => {
  const [localSettings, setLocalSettings] = React.useState<GameSettings>(settings);
  const [t1Name, setT1Name] = React.useState(team1Config.name);
  const [t2Name, setT2Name] = React.useState(team2Config.name);

  React.useEffect(() => {
    if (isOpen) {
      setLocalSettings(settings);
      setT1Name(team1Config.name);
      setT2Name(team2Config.name);
    }
  }, [isOpen, settings, team1Config, team2Config]);

  if (!isOpen) return null;

  const handleApplyAndRestart = () => {
    onSaveSettings(localSettings);
    onSaveTeamConfigs(
      { ...team1Config, name: t1Name.trim() || 'Team Red' },
      { ...team2Config, name: t2Name.trim() || 'Team Blue' }
    );
    onRestartMatchWithSettings();
    onClose();
  };

  const handleApplyOnly = () => {
    onSaveSettings(localSettings);
    onSaveTeamConfigs(
      { ...team1Config, name: t1Name.trim() || 'Team Red' },
      { ...team2Config, name: t2Name.trim() || 'Team Blue' }
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            <h3 className="font-display font-bold text-lg text-white">Game Settings & Teams</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Settings Form */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-sm">
          {/* Team Names */}
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
              Team Names
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-rose-400 font-medium block mb-1">Team 1</span>
                <input
                  type="text"
                  value={t1Name}
                  onChange={(e) => setT1Name(e.target.value)}
                  maxLength={16}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-medium focus:outline-none focus:border-rose-500"
                  placeholder="Team 1"
                />
              </div>
              <div>
                <span className="text-[11px] text-cyan-400 font-medium block mb-1">Team 2</span>
                <input
                  type="text"
                  value={t2Name}
                  onChange={(e) => setT2Name(e.target.value)}
                  maxLength={16}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-medium focus:outline-none focus:border-cyan-500"
                  placeholder="Team 2"
                />
              </div>
            </div>
          </div>

          {/* Target Score to Win */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
              Target Points to Win
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[3, 5, 7, 10].map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => setLocalSettings({ ...localSettings, targetScore: score })}
                  className={`py-2 rounded-xl font-bold font-display text-center transition-all ${
                    localSettings.targetScore === score
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  {score} Points
                </button>
              ))}
            </div>
          </div>

          {/* Round Timer */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
              Round Time Limit
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Untimed', value: 0 },
                { label: '30s', value: 30 },
                { label: '45s', value: 45 },
                { label: '60s', value: 60 },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() =>
                    setLocalSettings({ ...localSettings, roundDurationSeconds: item.value })
                  }
                  className={`py-2 rounded-xl font-bold text-center transition-all ${
                    localSettings.roundDurationSeconds === item.value
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
              Word Length / Difficulty
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Mixed', value: 'all' },
                { label: 'Easy (3-4)', value: 'easy' },
                { label: 'Medium (5-6)', value: 'medium' },
                { label: 'Hard (7+)', value: 'hard' },
              ].map((diff) => (
                <button
                  key={diff.value}
                  type="button"
                  onClick={() =>
                    setLocalSettings({
                      ...localSettings,
                      difficulty: diff.value as DifficultyLevel,
                    })
                  }
                  className={`py-2 px-1 rounded-xl text-xs font-bold text-center transition-all ${
                    localSettings.difficulty === diff.value
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  {diff.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
              Category
            </label>
            <select
              value={localSettings.category}
              onChange={(e) => setLocalSettings({ ...localSettings, category: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium focus:outline-none focus:border-amber-500"
            >
              {WORD_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Screen Layout Orientation */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
              Screen Layout (એક જ સ્ક્રીન પર રમત)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  id: 'split-horizontal',
                  title: 'Side by Side',
                  desc: 'Left vs Right (PC / Laptop / TV)',
                },
                {
                  id: 'tabletop-opposed',
                  title: 'Face-to-Face',
                  desc: 'Opposite 180° (Tablet on Table)',
                },
                {
                  id: 'split-vertical',
                  title: 'Top & Bottom',
                  desc: 'Up & Down (Portrait Screen)',
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() =>
                    setLocalSettings({
                      ...localSettings,
                      orientation: opt.id as ScreenOrientation,
                    })
                  }
                  className={`p-2 rounded-xl text-left border transition-all ${
                    localSettings.orientation === opt.id
                      ? 'border-indigo-500 bg-indigo-950/40 text-white'
                      : 'border-slate-800 bg-slate-800/60 hover:bg-slate-800 text-slate-400'
                  }`}
                >
                  <span className="block font-bold text-xs text-white">{opt.title}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5 leading-tight">
                    {opt.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Gujarati Clues / Meaning Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800">
            <div>
              <span className="font-semibold text-white block text-xs sm:text-sm">
                Always Show Gujarati Meanings (ગુજરાતી અર્થ)
              </span>
              <span className="text-[11px] text-slate-400 block">
                Show Gujarati translations alongside English clues for learning
              </span>
            </div>
            <button
              type="button"
              onClick={() =>
                setLocalSettings({
                  ...localSettings,
                  showGujaratiHints: !localSettings.showGujaratiHints,
                })
              }
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                localSettings.showGujaratiHints ? 'bg-amber-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  localSettings.showGujaratiHints ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Background Music & Sound Controls */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                  <Music className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <span className="font-semibold text-white block text-xs sm:text-sm">
                    Background Music Track
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    Looping lighthearted, acoustic game-show melody
                  </span>
                </div>
              </div>

              {/* Music ON/OFF toggle switch */}
              <button
                type="button"
                onClick={() =>
                  setLocalSettings({
                    ...localSettings,
                    musicEnabled: !localSettings.musicEnabled,
                  })
                }
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                  localSettings.musicEnabled ? 'bg-indigo-500' : 'bg-slate-700'
                }`}
                aria-label="Toggle background music"
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    localSettings.musicEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Music Volume Slider (interactive when enabled) */}
            <div className={`space-y-1.5 pt-1 border-t border-slate-800/80 transition-opacity ${
              localSettings.musicEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'
            }`}>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  {localSettings.musicVolume > 0 && localSettings.musicEnabled ? (
                    <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  <span>Music Volume</span>
                </span>
                <span className="text-indigo-400 font-mono font-bold">
                  {Math.round((localSettings.musicVolume ?? 0.35) * 100)}%
                </span>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={localSettings.musicVolume ?? 0.35}
                  onChange={(e) => {
                    const newVol = parseFloat(e.target.value);
                    setLocalSettings({
                      ...localSettings,
                      musicVolume: newVol,
                      musicEnabled: newVol > 0 ? true : localSettings.musicEnabled,
                    });
                  }}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Sound FX Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <div>
                <span className="font-semibold text-white block text-xs">
                  Sound Effects (SFX)
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Tile clicks, error buzzers, and victory fanfares
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  setLocalSettings({
                    ...localSettings,
                    soundEnabled: !localSettings.soundEnabled,
                  })
                }
                className={`w-10 h-5 rounded-full transition-colors relative p-0.5 ${
                  localSettings.soundEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
                aria-label="Toggle Sound Effects"
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    localSettings.soundEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleApplyAndRestart}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            <span>Apply & Start New Match</span>
          </button>

          <button
            type="button"
            onClick={handleApplyOnly}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-md shadow-emerald-950"
          >
            <Check className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
