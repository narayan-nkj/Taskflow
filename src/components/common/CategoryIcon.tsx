import React from 'react';
import { getCategoryConfig } from '../../utils/categoryIcons';

interface CategoryIconProps {
  category?: string | null;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  category,
  className = 'w-5 h-5',
}) => {
  const config = getCategoryConfig(category);
  const IconComponent = config.icon;
  return <IconComponent className={`${className} ${config.colorClass}`} aria-hidden="true" />;
};
