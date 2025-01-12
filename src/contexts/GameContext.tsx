import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import type { Category } from '../types/game';

interface GameState {
  selectedCategory: Category | null;
  isSoundEnabled: boolean;
  showSettings: boolean;
  showProfile: boolean;
}

type GameAction =
  | { type: 'SELECT_CATEGORY'; category: Category }
  | { type: 'CLEAR_CATEGORY' }
  | { type: 'TOGGLE_SOUND' }
  | { type: 'SET_SHOW_SETTINGS'; show: boolean }
  | { type: 'SET_SHOW_PROFILE'; show: boolean };

const initialState: GameState = {
  selectedCategory: null,
  isSoundEnabled: localStorage.getItem('soundEnabled') !== 'false',
  showSettings: false,
  showProfile: false
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SELECT_CATEGORY':
      return { ...state, selectedCategory: action.category };
    case 'CLEAR_CATEGORY':
      return { ...state, selectedCategory: null };
    case 'TOGGLE_SOUND':
      const newSoundEnabled = !state.isSoundEnabled;
      localStorage.setItem('soundEnabled', String(newSoundEnabled));
      return { ...state, isSoundEnabled: newSoundEnabled };
    case 'SET_SHOW_SETTINGS':
      return { ...state, showSettings: action.show };
    case 'SET_SHOW_PROFILE':
      return { ...state, showProfile: action.show };
    default:
      return state;
  }
}

type GameContextType = {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
};

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  
  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }

  const { state, dispatch } = context;

  const handleCategorySelect = useCallback((category: Category) => {
    dispatch({ type: 'SELECT_CATEGORY', category });
  }, [dispatch]);

  const handleCategoryClear = useCallback(() => {
    dispatch({ type: 'CLEAR_CATEGORY' });
  }, [dispatch]);

  const toggleSound = useCallback(() => {
    dispatch({ type: 'TOGGLE_SOUND' });
  }, [dispatch]);

  const handleSettingsClick = useCallback(() => {
    dispatch({ type: 'SET_SHOW_SETTINGS', show: true });
  }, [dispatch]);

  const handleProfileClick = useCallback(() => {
    dispatch({ type: 'SET_SHOW_PROFILE', show: true });
  }, [dispatch]);

  const handleSettingsClose = useCallback(() => {
    dispatch({ type: 'SET_SHOW_SETTINGS', show: false });
  }, [dispatch]);

  const handleProfileClose = useCallback(() => {
    dispatch({ type: 'SET_SHOW_PROFILE', show: false });
  }, [dispatch]);

  return useMemo(() => ({
    ...state,
    handleCategorySelect,
    handleCategoryClear,
    toggleSound,
    handleSettingsClick,
    handleProfileClick,
    handleSettingsClose,
    handleProfileClose
  }), [
    state,
    handleCategorySelect,
    handleCategoryClear,
    toggleSound,
    handleSettingsClick,
    handleProfileClick,
    handleSettingsClose,
    handleProfileClose
  ]);
}