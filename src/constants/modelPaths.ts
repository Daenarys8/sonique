// constants/modelPaths.ts
export const MODEL_PATHS = {
  PLAYER: {
    BASE: {
      model: '/models/player_idle.fbx',
      animations: [
        '/models/player_idle.fbx',
        '/models/player_attack.fbx',
        '/models/player_gethit.fbx',
        '/models/player_defeat.fbx'
      ]
    }
  },
  NPC: {
    BASE: {
      model: '/models/npc_idle.fbx', // Using idle as base model
      animations: [
        '/models/npc_idle.fbx',
        '/models/npc_attack.fbx',
        '/models/npc_gethit.fbx',
        '/models/npc_victory.fbx',
        '/models/npc_defeat.fbx'
      ]
    }
  }
};

// Define your animation durations
export const ANIMATION_DURATIONS = {
  ATTACK: 4000,
  DEATH: 4000,
  VICTORY: 4000
} as const;