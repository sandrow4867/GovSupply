

export interface StageConfig {
  id: number;
  color: string;
}

export const STAGES_CONFIG: StageConfig[] = [
  { id: 1, color: 'blue' },
  { id: 2, color: 'emerald' },
  { id: 3, color: 'sky' },
  { id: 4, color: 'rose' },
];

export const STAGES_COUNT = STAGES_CONFIG.length;