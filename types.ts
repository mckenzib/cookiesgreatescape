
export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER'
}

export enum LevelTheme {
  NEIGHBORHOOD = 'Neighborhood',
  PARK = 'Dog Park',
  LAKESIDE = 'Lakeside'
}

export enum EntityType {
  PLAYER = 'PLAYER',
  OBSTACLE_GROUND = 'OBSTACLE_GROUND', // Puddle
  OBSTACLE_BUSH = 'OBSTACLE_BUSH',     // Bush
  OBSTACLE_POOP = 'OBSTACLE_POOP',     // Poop
  OBSTACLE_DOG = 'OBSTACLE_DOG',       // Other Dog
  OBSTACLE_AIR = 'OBSTACLE_AIR',       // Squirrel/Bird
  COLLECTIBLE = 'COLLECTIBLE'          // Bone, Cookie
}

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Entity {
  id: number;
  type: EntityType;
  x: number;
  y: number;
  width: number;
  height: number;
  markedForDeletion: boolean;
  color?: string;
  // Visual variants
  variant?: number; 
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}
