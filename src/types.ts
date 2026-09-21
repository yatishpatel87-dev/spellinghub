export type DifficultyLevel = 'all' | 'easy' | 'medium' | 'hard';

export type ScreenOrientation = 'split-horizontal' | 'tabletop-opposed' | 'split-vertical';

export interface WordItem {
  id: string;
  word: string;
  definition: string;
  clueSentence: string; // sentence with ____ blank
  partOfSpeech: string;
  category: string;
  gujaratiMeaning: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface LetterTile {
  id: string;
  char: string;
  originalIndex: number;
}

export type TeamColor = 'ruby' | 'azure' | 'emerald' | 'amber' | 'violet';

export interface TeamConfig {
  id: 'team1' | 'team2';
  name: string;
  color: TeamColor;
  primaryHex: string;
  accentHex: string;
}

export interface TeamPlayState {
  teamId: 'team1' | 'team2';
  score: number;
  streak: number;
  currentAnswer: LetterTile[];
  availableTiles: LetterTile[];
  isSolved: boolean;
  isWrongShake: boolean;
  revealedIndices: number[]; // For hint feature
}

export interface GameSettings {
  targetScore: number;
  roundDurationSeconds: number; // 0 for untimed
  difficulty: DifficultyLevel;
  category: string;
  orientation: ScreenOrientation;
  soundEnabled: boolean;
  musicEnabled: boolean;
  musicVolume: number; // 0 to 1
  showGujaratiHints: boolean;
  autoCheckOnFill: boolean;
}

export interface RoundHistoryItem {
  roundNumber: number;
  word: WordItem;
  winnerTeamId: 'team1' | 'team2' | 'draw' | null;
  timeTakenSeconds: number;
  team1Submissions?: { correct: number; wrong: number };
  team2Submissions?: { correct: number; wrong: number };
  matchNumber?: number;
}
