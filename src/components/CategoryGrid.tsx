import React from 'react';
import { BookOpen, Atom, History, Calculator, Dumbbell, Music2, Clapperboard, Shuffle } from 'lucide-react';
import type { Category } from '../types/game';
import './CategoryGrid.css';

const categories: Category[] = [
  { id: 'literature', name: 'Literature', icon: 'BookOpen', progress: 0, totalPuzzles: 10 },
  { id: 'science', name: 'Science', icon: 'Atom', progress: 0, totalPuzzles: 10 },
  { id: 'history', name: 'History', icon: 'History', progress: 0, totalPuzzles: 10 },
  { id: 'math', name: 'Mathematics', icon: 'Calculator', progress: 0, totalPuzzles: 10 },
  { id: 'sports', name: 'Sports', icon: 'Dumbbell', progress: 0, totalPuzzles: 10 },
  { id: 'music', name: 'Music', icon: 'Music2', progress: 0, totalPuzzles: 10 },
  { id: 'movies', name: 'Movies', icon: 'Clapperboard', progress: 0, totalPuzzles: 10 },
  { id: 'random', name: 'Random', icon: 'Shuffle', progress: 0, totalPuzzles: 10 },
];

const iconMap = {
  BookOpen,
  Atom,
  History,
  Calculator,
  Dumbbell,
  Music2,
  Clapperboard,
  Shuffle,
};

type CategoryGridProps = {
  onCategorySelect: (category: Omit<Category, 'description' | 'difficulty'> & { description?: string; difficulty?: 'easy' | 'medium' | 'hard' }) => void;
  userProgress?: { [key: string]: number };
};

export function CategoryGrid({ onCategorySelect, userProgress = {} }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6 category-grid-container">
      {categories.map((category) => {
        const Icon = iconMap[category.icon as keyof typeof iconMap];
        return (
          <button
            key={category.id}
            onClick={() => onCategorySelect(category)}
            className="flex flex-col items-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer"
          >
            <Icon className="w-12 h-12 text-indigo-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800">{category.name}</h3>
            <div className="w-full mt-4 bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full"
                style={{ width: `${((userProgress[category.id] || 0) / category.totalPuzzles) * 100}%` }}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}