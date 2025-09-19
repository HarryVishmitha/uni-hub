/**
 * This file provides mock data for the admin dashboard
 * In a real application, this would be replaced with actual API calls
 */

/**
 * Generate random data points for charts
 */
function generateRandomData(count, { min = 10, max = 100, decimals = 0 } = {}) {
  return Array.from({ length: count }, () => {
    const value = Math.random() * (max - min) + min;
    return decimals === 0 ? Math.floor(value) : Number(value.toFixed(decimals));
  });
}

/**
 * Generate dates for the last n days/months
 */
function generateDateLabels(count, { format = 'day' } = {}) {
  const today = new Date();
  const labels = [];
  
  for (let i = count - 1; i >= 0; i--) {
    const date = new Date();
    
    if (format === 'day') {
      date.setDate(today.getDate() - i);
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    } else if (format === 'month') {
      date.setMonth(today.getMonth() - i);
      labels.push(date.toLocaleDateString('en-US', { month: 'short' }));
    }
  }
  
  return labels;
}

/**
 * Mock dashboard stats
 */
export function getDashboardStats() {
  return {
    universities: {
      total: 12,
      active: 10,
      change: '+8.3%',
      isPositive: true
    },
    branches: {
      total: 47,
      active: 42,
      change: '+12.5%',
      isPositive: true
    },
    students: {
      total: 24567,
      active: 22345,
      change: '+5.7%',
      isPositive: true
    },
    courses: {
      total: 1432,
      active: 1298,
      change: '-2.1%',
      isPositive: false
    },
    programs: {
      total: 87,
      change: '+4.8%',
      isPositive: true
    },
    departments: {
      total: 156,
      change: '0%',
      isPositive: true
    },
    enrollments: {
      total: 45689,
      lastMonth: 2345,
      change: '+15.3%',
      isPositive: true
    }
  };
}

/**
 * Mock enrollment chart data
 */
export function getEnrollmentChartData() {
  const labels = generateDateLabels(6, { format: 'month' });
  
  return {
    options: {
      chart: {
        id: 'enrollments-chart',
      },
      xaxis: {
        categories: labels,
      },
      colors: ['#3b82f6', '#10b981', '#f97316'],
      stroke: {
        curve: 'smooth',
        width: 3,
      },
      legend: {
        position: 'top',
      },
    },
    series: [
      {
        name: 'Undergraduate',
        data: generateRandomData(6, { min: 1000, max: 5000 }),
      },
      {
        name: 'Graduate',
        data: generateRandomData(6, { min: 500, max: 2000 }),
      },
      {
        name: 'Professional',
        data: generateRandomData(6, { min: 200, max: 1000 }),
      },
    ],
  };
}

/**
 * Mock university growth chart data
 */
export function getUniversityGrowthData() {
  const labels = generateDateLabels(12, { format: 'month' });
  
  return {
    options: {
      chart: {
        id: 'university-growth-chart',
        stacked: true,
      },
      xaxis: {
        categories: labels,
      },
      colors: ['#3b82f6', '#f97316'],
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          endingShape: 'rounded',
        },
      },
      dataLabels: {
        enabled: false,
      },
      legend: {
        position: 'top',
      },
      fill: {
        opacity: 1,
      },
    },
    series: [
      {
        name: 'Universities',
        data: generateRandomData(12, { min: 1, max: 3, decimals: 0 }),
      },
      {
        name: 'Branches',
        data: generateRandomData(12, { min: 1, max: 6, decimals: 0 }),
      },
    ],
  };
}

/**
 * Mock user distribution chart data
 */
export function getUserDistributionData() {
  return {
    options: {
      chart: {
        id: 'user-distribution-chart',
      },
      labels: ['Students', 'Faculty', 'Staff', 'Administrators'],
      colors: ['#3b82f6', '#10b981', '#f97316', '#8b5cf6'],
      legend: {
        position: 'bottom',
      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 200
          },
          legend: {
            position: 'bottom'
          }
        }
      }]
    },
    series: [65, 15, 12, 8],
  };
}

/**
 * Mock recent activity data
 */
export function getRecentActivities() {
  return [
    {
      title: 'New University Added',
      description: 'University of Technology was added to the system',
      timestamp: '2 hours ago',
      icon: 'lucide:building',
      iconColor: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
      user: 'Admin User'
    },
    {
      title: 'New Program Created',
      description: 'Computer Science program was added to the Department of Engineering',
      timestamp: '5 hours ago',
      icon: 'lucide:book-open',
      iconColor: 'text-green-500 bg-green-100 dark:bg-green-900/30',
      user: 'John Smith'
    },
    {
      title: 'Course Updated',
      description: 'Advanced Mathematics course description and requirements updated',
      timestamp: '1 day ago',
      icon: 'lucide:edit',
      iconColor: 'text-amber-500 bg-amber-100 dark:bg-amber-900/30',
      user: 'Maria Johnson'
    },
    {
      title: 'User Role Changed',
      description: 'Dr. Robert Lee was promoted to Department Head',
      timestamp: '2 days ago',
      icon: 'lucide:user-check',
      iconColor: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30',
      user: 'System'
    },
    {
      title: 'Bulk Enrollment Completed',
      description: '145 students were enrolled in Introduction to Psychology',
      timestamp: '3 days ago',
      icon: 'lucide:users',
      iconColor: 'text-indigo-500 bg-indigo-100 dark:bg-indigo-900/30',
      user: 'Jennifer Williams'
    },
  ];
}

/**
 * Mock quick actions
 */
export function getQuickActions() {
  return [
    {
      title: 'Add University',
      description: 'Create a new university in the system',
      icon: 'lucide:building-2',
      iconColor: 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300',
      href: '/admin/universities/create'
    },
    {
      title: 'Manage Branches',
      description: 'View and edit branch campuses',
      icon: 'lucide:git-branch',
      iconColor: 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-300',
      href: '/admin/branches'
    },
    {
      title: 'User Management',
      description: 'Manage user accounts and permissions',
      icon: 'lucide:users',
      iconColor: 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-300',
      href: '/admin/users'
    },
    {
      title: 'System Settings',
      description: 'Configure system-wide settings',
      icon: 'lucide:settings',
      iconColor: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
      href: '/admin/settings'
    }
  ];
}

/**
 * Mock pending approvals
 */
export function getPendingApprovals() {
  return [
    {
      title: 'New Curriculum: Data Science',
      description: 'Awaiting final approval from the academic committee',
      timestamp: 'Submitted 3 days ago',
      icon: 'lucide:file-check',
      iconColor: 'text-amber-500 bg-amber-100 dark:bg-amber-900/30',
      user: 'Department of Computer Science'
    },
    {
      title: 'Faculty Promotion Request',
      description: 'Dr. Emily Chen requesting promotion to Associate Professor',
      timestamp: 'Submitted 5 days ago',
      icon: 'lucide:user-cog',
      iconColor: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
      user: 'Faculty Affairs'
    },
    {
      title: 'Course Change: PHYS 301',
      description: 'Request to modify prerequisites and add lab component',
      timestamp: 'Submitted 1 week ago',
      icon: 'lucide:clipboard-edit',
      iconColor: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30',
      user: 'Department of Physics'
    }
  ];
}