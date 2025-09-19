import { Head, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import StatCard from '@/Components/Dashboard/StatCard';
import ChartCard from '@/Components/Dashboard/ChartCard';
import ActivityFeed from '@/Components/Dashboard/ActivityFeed';
import QuickActions from '@/Components/Dashboard/QuickActions';
import ExampleAlertCard from '@/Components/Examples/ExampleAlertCard';
import { 
  getDashboardStats, 
  getEnrollmentChartData, 
  getUserDistributionData, 
  getUniversityGrowthData,
  getRecentActivities,
  getQuickActions,
  getPendingApprovals
} from '@/Services/dashboardService';

export default function Dashboard() {
    const { props } = usePage();
    const { auth, branch } = props;
    const isSuper = auth?.roles?.includes('Super Admin') || auth?.permissions?.includes('*') || auth?.user?.is_super === true;
    
    // State for dashboard data
    const [stats, setStats] = useState(null);
    const [enrollmentChart, setEnrollmentChart] = useState(null);
    const [userDistribution, setUserDistribution] = useState(null);
    const [universityGrowth, setUniversityGrowth] = useState(null);
    const [recentActivities, setRecentActivities] = useState([]);
    const [quickActions, setQuickActions] = useState([]);
    const [pendingApprovals, setPendingApprovals] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch dashboard data
    useEffect(() => {
        // In a real app, this would be API calls
        setStats(getDashboardStats());
        setEnrollmentChart(getEnrollmentChartData());
        setUserDistribution(getUserDistributionData());
        setUniversityGrowth(getUniversityGrowthData());
        setRecentActivities(getRecentActivities());
        setQuickActions(getQuickActions());
        setPendingApprovals(getPendingApprovals());
        setLoading(false);
    }, []);

    if (loading) {
        return (
            <AdminLayout title="Admin Dashboard" header="Admin Dashboard">
                <Head title="Admin Dashboard" />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Admin Dashboard" header={<DashboardHeader isSuper={isSuper} branch={branch} />}>
            <Head title="Admin Dashboard" />

            {/* Stats Row */}
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                <StatCard 
                    title="Universities"
                    value={stats.universities.total}
                    icon="lucide:building-2"
                    iconColor="bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300"
                    change={stats.universities.change}
                    isPositive={stats.universities.isPositive}
                    subtitle={`${stats.universities.active} active`}
                />
                
                <StatCard 
                    title="Branches"
                    value={stats.branches.total}
                    icon="lucide:git-branch"
                    iconColor="bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-300"
                    change={stats.branches.change}
                    isPositive={stats.branches.isPositive}
                    subtitle={`${stats.branches.active} active`}
                />
                
                <StatCard 
                    title="Students"
                    value={stats.students.total.toLocaleString()}
                    icon="lucide:users"
                    iconColor="bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-300"
                    change={stats.students.change}
                    isPositive={stats.students.isPositive}
                    subtitle={`${stats.students.active.toLocaleString()} active`}
                />
                
                <StatCard 
                    title="Courses"
                    value={stats.courses.total.toLocaleString()}
                    icon="lucide:book-open"
                    iconColor="bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-300"
                    change={stats.courses.change}
                    isPositive={stats.courses.isPositive}
                    subtitle={`${stats.courses.active.toLocaleString()} active`}
                />
            </div>

            {/* Charts Row */}
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <ChartCard 
                    title="Enrollment Trends" 
                    subtitle="Last 6 months" 
                    options={enrollmentChart.options} 
                    series={enrollmentChart.series} 
                    type="area" 
                    height={320} 
                />
                
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
                    <ChartCard 
                        title="User Distribution" 
                        options={userDistribution.options} 
                        series={userDistribution.series} 
                        type="donut" 
                        height={200} 
                    />
                    
                    <ChartCard 
                        title="University & Branch Growth" 
                        subtitle="Last 12 months" 
                        options={universityGrowth.options} 
                        series={universityGrowth.series} 
                        type="bar" 
                        height={200} 
                    />
                </div>
            </div>

            {/* Activity & Actions Row */}
            <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <ActivityFeed 
                        title="Recent Activity" 
                        activities={recentActivities} 
                    />
                </div>
                
                <QuickActions 
                    title="Quick Actions" 
                    actions={quickActions} 
                />
            </div>

            {/* Pending Approvals */}
            <div className="mt-6">
                <ActivityFeed 
                    title="Pending Approvals" 
                    activities={pendingApprovals} 
                />
            </div>
            
            {/* Alert System Demo */}
            <div className="mt-6">
                <ExampleAlertCard />
            </div>
        </AdminLayout>
    );
}

/**
 * Dashboard header component
 */
function DashboardHeader({ isSuper, branch }) {
    return (
        <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {isSuper ? 'Super Admin Dashboard' : 'Admin Dashboard'}
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {isSuper 
                    ? 'System-wide overview and management'
                    : branch 
                        ? `Managing ${branch.name} (${branch.code})`
                        : 'Switch to a branch to see scoped activity'
                }
            </p>
        </div>
    );
}
