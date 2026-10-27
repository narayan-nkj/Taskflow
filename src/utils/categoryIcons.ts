import React from 'react';
import {
  GraduationCap,
  Code2,
  User,
  Briefcase,
  Layers,
  Palette,
  Activity,
  Wallet,
  ShoppingBag,
  ListTodo,
} from 'lucide-react';

export interface CategoryIconConfig {
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
  label: string;
  colorClass: string;
  badgeBg: string;
}

/**
 * Returns the icon component and color configurations for a given task category or domain.
 * Gracefully handles normalized names and provides a sensible fallback for uncategorized/general tasks.
 */
export function getCategoryConfig(category?: string | null): CategoryIconConfig {
  const norm = (category || '').trim().toLowerCase();

  switch (norm) {
    case 'academics':
    case 'academic':
    case 'study':
    case 'education':
      return {
        icon: GraduationCap,
        label: 'Academics',
        colorClass: 'text-sky-400',
        badgeBg: 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800/60',
      };

    case 'gdg':
    case 'tech':
    case 'code':
    case 'development':
      return {
        icon: Code2,
        label: 'GDG',
        colorClass: 'text-brand-500',
        badgeBg: 'bg-peach-100 dark:bg-brand-950/40 text-brand-600 dark:text-brand-300 border-peach-200 dark:border-brand-800/60',
      };

    case 'personal':
    case 'life':
      return {
        icon: User,
        label: 'Personal',
        colorClass: 'text-emerald-400',
        badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
      };

    case 'work':
    case 'career':
    case 'job':
      return {
        icon: Briefcase,
        label: 'Work',
        colorClass: 'text-purple-400',
        badgeBg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/60',
      };

    case 'project':
    case 'projects':
      return {
        icon: Layers,
        label: 'Project',
        colorClass: 'text-amber-400',
        badgeBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
      };

    case 'creative':
    case 'design':
    case 'art':
      return {
        icon: Palette,
        label: 'Creative',
        colorClass: 'text-pink-400',
        badgeBg: 'bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800/60',
      };

    case 'health':
    case 'fitness':
      return {
        icon: Activity,
        label: 'Health',
        colorClass: 'text-rose-400',
        badgeBg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60',
      };

    case 'finance':
    case 'money':
      return {
        icon: Wallet,
        label: 'Finance',
        colorClass: 'text-teal-400',
        badgeBg: 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800/60',
      };

    case 'shopping':
      return {
        icon: ShoppingBag,
        label: 'Shopping',
        colorClass: 'text-indigo-400',
        badgeBg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60',
      };

    default:
      return {
        icon: ListTodo,
        label: category || 'General',
        colorClass: 'text-slate-400 dark:text-[#808080]',
        badgeBg: 'bg-slate-100 dark:bg-[#181818] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#292929]',
      };
  }
}
