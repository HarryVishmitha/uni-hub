import React from 'react';
import { Icon } from '@iconify/react';

/**
 * ActivityItem component for displaying a single activity entry
 */
function ActivityItem({ 
  title, 
  timestamp, 
  icon = "lucide:circle", 
  iconColor = "text-blue-500 bg-blue-100 dark:bg-blue-900/30", 
  description,
  user
}) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className={`mt-0.5 rounded-full p-2 ${iconColor}`}>
        <Icon icon={icon} className="h-4 w-4" />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</p>
        
        {description && (
          <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">{description}</p>
        )}
        
        <div className="mt-1 flex items-center gap-2">
          {user && (
            <span className="inline-flex items-center text-xs text-gray-500 dark:text-gray-400">
              <Icon icon="lucide:user" className="mr-1 h-3 w-3" />
              {user}
            </span>
          )}
          
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {timestamp}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * ActivityFeed component for displaying recent activities
 * 
 * @param {Object} props
 * @param {string} props.title - Card title
 * @param {Array} props.activities - List of activity items
 */
export default function ActivityFeed({ title = "Recent Activity", activities = [] }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900/70">
      <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
        <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
      </div>
      
      <div className="divide-y divide-gray-200 dark:divide-gray-800">
        {activities.length > 0 ? (
          <div className="px-6">
            {activities.map((activity, index) => (
              <ActivityItem key={index} {...activity} />
            ))}
          </div>
        ) : (
          <div className="px-6 py-8 text-center">
            <Icon icon="lucide:clock" className="mx-auto h-8 w-8 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
}