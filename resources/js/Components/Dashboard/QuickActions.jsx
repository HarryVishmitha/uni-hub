import React from 'react';
import { Link } from '@inertiajs/react';
import { Icon } from '@iconify/react';

/**
 * QuickAction component for individual action buttons
 */
function QuickAction({ 
  title, 
  description, 
  icon, 
  iconColor = "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300", 
  href = "#",
  external = false
}) {
  const ActionComponent = external ? 'a' : Link;
  const externalProps = external ? { target: "_blank", rel: "noopener noreferrer" } : {};

  return (
    <ActionComponent 
      href={href}
      className="flex items-start gap-4 rounded-lg p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
      {...externalProps}
    >
      <div className={`rounded-full p-3 ${iconColor}`}>
        <Icon icon={icon} className="h-5 w-5" />
      </div>
      
      <div className="flex-1">
        <h4 className="font-medium text-gray-900 dark:text-white">{title}</h4>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      
      <Icon 
        icon={external ? "lucide:external-link" : "lucide:chevron-right"} 
        className="mt-1 h-5 w-5 text-gray-400" 
      />
    </ActionComponent>
  );
}

/**
 * QuickActions component for displaying a list of quick action buttons
 * 
 * @param {Object} props
 * @param {string} props.title - Card title
 * @param {Array} props.actions - List of quick action items
 */
export default function QuickActions({ title = "Quick Actions", actions = [] }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900/70">
      <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
        <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
      </div>
      
      <div className="divide-y divide-gray-200 dark:divide-gray-800">
        {actions.map((action, index) => (
          <QuickAction key={index} {...action} />
        ))}
      </div>
    </div>
  );
}