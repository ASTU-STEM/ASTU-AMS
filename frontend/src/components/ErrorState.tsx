import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface ErrorStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  icon,
  title,
  description,
  action,
  onRetry,
  className = ''
}) => {
  const defaultIcon = <AlertCircle className="h-12 w-12 text-red-500" />;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`flex flex-col items-center justify-center p-12 text-center ${className}`}
    >
      <div className="mb-4">
        {icon || defaultIcon}
      </div>
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-md">{description}</p>
      )}
      <div className="flex items-center gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2 bg-astu-navy hover:bg-blue-900 text-white rounded-xl transition-all duration-300 font-medium text-sm"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        )}
        {action && (
          <div className="mt-4">
            {action}
          </div>
        )}
      </div>
    </div>
  );
};

// Pre-configured error states for common use cases
export const NetworkErrorState: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <ErrorState
    title="Network Error"
    description="Unable to connect to the server. Please check your internet connection and try again."
    onRetry={onRetry}
  />
);

export const DataLoadErrorState: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <ErrorState
    title="Failed to Load Data"
    description="There was an error loading the data. Please try again or contact support if the problem persists."
    onRetry={onRetry}
  />
);

export const NotFoundErrorState: React.FC<{ action?: React.ReactNode }> = ({ action }) => (
  <ErrorState
    title="Page Not Found"
    description="The page you're looking for doesn't exist or has been moved."
    action={action}
  />
);

export const PermissionErrorState: React.FC<{ action?: React.ReactNode }> = ({ action }) => (
  <ErrorState
    title="Access Denied"
    description="You don't have permission to access this resource. Please contact your administrator if you believe this is an error."
    action={action}
  />
);

export default ErrorState;
