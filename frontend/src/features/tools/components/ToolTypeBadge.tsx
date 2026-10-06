import React from 'react';
import { ToolType } from '../types/tools.types';
import { TOOL_TYPE_BADGE } from '../utils/toolUi';

interface ToolTypeBadgeProps {
  toolType: ToolType;
  compact?: boolean;
  className?: string;
}

export const ToolTypeBadge: React.FC<ToolTypeBadgeProps> = ({ toolType, compact, className = '' }) => {
  const meta = TOOL_TYPE_BADGE[toolType] ?? TOOL_TYPE_BADGE.VERIFIED_RESOURCE;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-bold ${compact ? 'text-[9px]' : 'text-[10px]'} ${meta.badgeClass} ${className}`}
    >
      <span className="material-symbols-outlined text-[12px] leading-none">{meta.iconName}</span>
      {meta.label}
    </span>
  );
};
