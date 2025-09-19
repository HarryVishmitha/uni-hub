import React from 'react';
import { Icon } from '@iconify/react';

/**
 * StatCard component for displaying key metrics on dashboard
 * 
 * @param {Object} props
 * @param {string} props.title - Card title
 * @param {string|number} props.value - Main value to display
 * @param {string} props.icon - Iconify icon name
 * @param {string} props.iconColor - Tailwind color class for icon background
 * @param {string} props.change - Change value (e.g., "+5.2%")
 * @param {boolean} props.isPositive - Whether change is positive or negative
 * @param {string} props.subtitle - Optional subtitle or description
 */
export default function StatCard({ 
  title, 
  value, 
  icon, 
  iconColor = "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300", 
  change, 
  isPositive = true, 
  subtitle
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/70">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <h3 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{value}</h3>
          
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
          )}
          
          {change && (
            <div className="mt-2 flex items-center">
              <Icon 
                icon={isPositive ? "lucide:trending-up" : "lucide:trending-down"} 
                className={`mr-1 ${isPositive ? "text-green-500" : "text-red-500"}`} 
              />
              <span className={`text-sm font-medium ${isPositive ? "text-green-500" : "text-red-500"}`}>
                {change}
              </span>
            </div>
          )}
        </div>
        
        <div className={`rounded-full p-3 ${iconColor}`}>
          <Icon icon={icon} className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}