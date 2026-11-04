import React from 'react';
import { Inbox, FileText, Users, Database } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = ''
}) => {
  const defaultIcon = <Inbox className="h-12 w-12 text-gray-400" />;

  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center ${className}`}>
      <div className="mb-4">
        {icon || defaultIcon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-600 mb-6 max-w-md">{description}</p>
      )}
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
};

// Pre-configured empty states for common use cases
export const EmptyDataState: React.FC<{ action?: React.ReactNode }> = ({ action }) => (
  <EmptyState
    icon={<Database className="h-12 w-12 text-gray-400" />}
    title="No data available"
    description="There is no data to display at this time. Check back later or try adjusting your filters."
    action={action}
  />
);

export const EmptyRecordsState: React.FC<{ action?: React.ReactNode }> = ({ action }) => (
  <EmptyState
    icon={<FileText className="h-12 w-12 text-gray-400" />}
    title="No records found"
    description="No records match your current search criteria. Try adjusting your filters or search terms."
    action={action}
  />
);

export const EmptyUsersState: React.FC<{ action?: React.ReactNode }> = ({ action }) => (
  <EmptyState
    icon={<Users className="h-12 w-12 text-gray-400" />}
    title="No users found"
    description="No users match your current search criteria. Try adjusting your filters."
    action={action}
  />
);

export default EmptyState;
