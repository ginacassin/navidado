import { DEFAULT_CONFIG, sanitizeConfig, type GameConfig } from '../../shared/game';

const KEY = 'navidado:config';
export function loadConfig(): GameConfig {
  try {
    return sanitizeConfig(JSON.parse(localStorage.getItem(KEY) ?? '{}'));
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}
export function saveConfig(c: GameConfig) {
  localStorage.setItem(KEY, JSON.stringify(c));
}
