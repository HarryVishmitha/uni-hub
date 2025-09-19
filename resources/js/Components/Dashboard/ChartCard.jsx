import React from 'react';
import Chart from 'react-apexcharts';

/**
 * ChartCard component for displaying charts on dashboard
 * 
 * @param {Object} props
 * @param {string} props.title - Chart title
 * @param {string} props.subtitle - Optional subtitle or description
 * @param {Object} props.options - ApexCharts options
 * @param {Array} props.series - ApexCharts series data
 * @param {string} props.type - Chart type (line, bar, area, etc.)
 * @param {number} props.height - Chart height
 */
export default function ChartCard({ 
  title, 
  subtitle, 
  options = {}, 
  series = [], 
  type = 'line', 
  height = 350 
}) {
  // Default theme-aware chart options
  const defaultOptions = {
    chart: {
      fontFamily: 'inherit',
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
      background: 'transparent',
    },
    grid: {
      borderColor: 'rgba(100, 116, 139, 0.1)',
    },
    tooltip: {
      theme: 'dark',
    },
    xaxis: {
      labels: {
        style: {
          colors: '#94a3b8',
        },
      },
      axisBorder: {
        color: 'rgba(100, 116, 139, 0.1)',
      },
      axisTicks: {
        color: 'rgba(100, 116, 139, 0.1)',
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: '#94a3b8',
        },
      },
    },
  };

  // Merge default options with provided options
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    chart: {
      ...defaultOptions.chart,
      ...options.chart,
    },
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/70">
      {title && (
        <div className="mb-4">
          <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">{title}</h3>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
      )}
      
      <div>
        <Chart
          options={mergedOptions}
          series={series}
          type={type}
          height={height}
        />
      </div>
    </div>
  );
}