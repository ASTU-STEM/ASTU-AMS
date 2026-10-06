import React from 'react';

interface LoadingSkeletonProps {
  variant?: 'card' | 'list' | 'table' | 'text' | 'circular';
  count?: number;
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'card',
  count = 1,
  className = ''
}) => {
  const baseClass = 'animate-pulse bg-[var(--bg-page)] dark:bg-slate-800 rounded-lg';
  
  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return (
          <div className={`p-6 bg-[var(--bg-card)] dark:bg-slate-900 rounded-2xl border border-[var(--border-color)] dark:border-slate-800 shadow-xs ${className}`}>
            <div className={`${baseClass} h-6 w-1/3 mb-4`} />
            <div className={`${baseClass} h-4 w-full mb-2`} />
            <div className={`${baseClass} h-4 w-2/3 mb-4`} />
            <div className={`${baseClass} h-12 w-full`} />
          </div>
        );
      case 'list':
        return (
          <div className={`flex items-center gap-4 p-4 ${className}`}>
            <div className={`${baseClass} h-12 w-12 rounded-full`} />
            <div className="flex-1">
              <div className={`${baseClass} h-4 w-3/4 mb-2`} />
              <div className={`${baseClass} h-3 w-1/2`} />
            </div>
          </div>
        );
      case 'table':
        return (
          <div className={`p-4 ${className}`}>
            <div className={`${baseClass} h-4 w-full mb-2`} />
            <div className={`${baseClass} h-4 w-2/3`} />
          </div>
        );
      case 'text':
        return (
          <div className={`${baseClass} h-4 w-full ${className}`} />
        );
      case 'circular':
        return (
          <div className={`${baseClass} h-12 w-12 rounded-full ${className}`} />
        );
      default:
        return <div className={`${baseClass} h-4 w-full ${className}`} />;
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <React.Fragment key={index}>
          {renderSkeleton()}
        </React.Fragment>
      ))}
    </>
  );
};

export default LoadingSkeleton;
