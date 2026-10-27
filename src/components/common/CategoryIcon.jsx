import React from 'react';
import { getCategoryConfig } from '../../utils/categoryIcons';

export const CategoryIcon = ({
  category,
  className = 'w-5 h-5',
}) => {
  const config = getCategoryConfig(category);
  const IconComponent = config.icon;
  return <IconComponent className={`${className} ${config.colorClass}`} aria-hidden="true" />;
};
