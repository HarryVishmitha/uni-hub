import { Head, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import StatCard from '@/Components/Dashboard/StatCard';
import ChartCard from '@/Components/Dashboard/ChartCard';
import ActivityFeed from '@/Components/Dashboard/ActivityFeed';
import QuickActions from '@/Components/Dashboard/QuickActions';
import ExampleAlertCard from '@/Components/Examples/ExampleAlertCard';
import { fetchDashboardMetrics, fetchQuickActions, fetchRecentActivities } from '@/Services/dashboardService';
import { useAlerts } from '@/Contexts/AlertContext';

const CARD_ICON_MAP = {
  branches: {
    icon: 'lucide:git-branch',
    iconColor: 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-300',
  },
  terms: {
    icon: 'lucide:calendar-clock',
    iconColor: 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300',
  },
  courses: {
    icon: 'lucide:book-open',
    iconColor: 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-300',
  },
  users: {
    icon: 'lucide:users',
    iconColor: 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-300',
  },
};

export default function Dashboard() {
  const { props } = usePage();
  const { auth, branch } = props;
  const branchId = branch?.id ?? null;

  return (
    <AdminLayout title="Admin Dashboard" header={<DashboardHeader auth={auth} branch={branch} />}>
      <Head title="Admin Dashboard" />
      <DashboardContent branchId={branchId} auth={auth} branch={branch} />
    </AdminLayout>
  );
}

function DashboardContent({ branchId }) {
  const { error: pushError } = useAlerts();

  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [activities, setActivities] = useState([]);
  const [quickActions, setQuickActionItems] = useState([]);

  useEffect(() => {
    let isSubscribed = true;

    async function load() {
      setLoading(true);
      try {
        const query = branchId ? { branch_id: branchId } : {};
        const [metricPayload, activityPayload, quickActionPayload] = await Promise.all([
          fetchDashboardMetrics(query),
          fetchRecentActivities(query),
          fetchQuickActions(query),
        ]);

        if (!isSubscribed) return;

        setMetrics(metricPayload);
        setActivities(transformActivities(activityPayload));
        setQuickActionItems(enhanceQuickActions(quickActionPayload));
      } catch (e) {
        console.error('Failed to load dashboard data', e);
        if (isSubscribed) {
          pushError('Unable to load dashboard data. Please try again.');
        }
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      isSubscribed = false;
    };
  }, [branchId, pushError]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
        <p className="text-lg text-gray-600 dark:text-gray-300">No dashboard data available. Try refreshing the page.</p>
      </div>
    );
  }

  const overviewCards = buildOverviewCards(metrics.cards?.overview ?? []);
  const userDistributionChart = buildUserDistributionChart(metrics.cards?.users ?? null);
  const termsByStatusChart = buildDonutChart(
    metrics.charts?.termsByStatus?.labels ?? [],
    metrics.charts?.termsByStatus?.dataset ?? [],
    'Terms by Status'
  );
  const coursesByModeChart = buildDonutChart(
    metrics.charts?.coursesByMode?.labels ?? [],
    metrics.charts?.coursesByMode?.dataset ?? [],
    'Courses by Delivery Mode'
  );
  const coursesByStatusChart = buildColumnChart(
    metrics.charts?.coursesByStatus?.labels ?? [],
    metrics.charts?.coursesByStatus?.dataset ?? [],
    'Courses by Status'
  );

  const recentTerms = metrics.tableRows?.recentTerms ?? [];
  const recentCourses = metrics.tableRows?.recentCourses ?? [];

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {overviewCards.map((card) => (
          <StatCard key={card.cardKey} {...card} />
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 grid gap-6">
          <ChartCard
            title="Courses by Status"
            options={coursesByStatusChart.options}
            series={coursesByStatusChart.series}
            type="bar"
            height={320}
          />
          <ChartCard
            title="Terms by Status"
            options={termsByStatusChart.options}
            series={termsByStatusChart.series}
            type="donut"
            height={280}
          />
        </div>
        <div className="grid gap-6">
          {userDistributionChart && (
            <ChartCard
              title="User Distribution"
              options={userDistributionChart.options}
              series={userDistributionChart.series}
              type="donut"
              height={280}
            />
          )}
          <ChartCard
            title="Courses by Delivery Mode"
            options={coursesByModeChart.options}
            series={coursesByModeChart.series}
            type="donut"
            height={280}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <RecentTermsCard terms={recentTerms} />
        <RecentCoursesCard courses={recentCourses} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ActivityFeed
            title="Recent Activity"
            activities={activities}
          />
        </div>

        <QuickActions
          title="Quick Actions"
          actions={quickActions}
        />
      </div>

      <div className="mt-6">
        <ExampleAlertCard />
      </div>
    </>
  );
}

function DashboardHeader({ auth, branch }) {
  const roles = auth?.roles ?? [];
  const isSuper = roles.includes('Super Admin') || roles.includes('super_admin');

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
        {isSuper ? 'Super Admin Dashboard' : 'Admin Dashboard'}
      </h1>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
        {branch ? `Managing ${branch.name} (${branch.code})` : 'System-wide overview and management'}
      </p>
    </div>
  );
}

function buildOverviewCards(cards) {
  return cards.map((card) => {
    const iconConfig = CARD_ICON_MAP[card.key] ?? {
      icon: 'lucide:activity',
      iconColor: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-200',
    };

    return {
      // Remove key from props object as it should be passed directly to JSX
      title: card.title,
      value: Number(card.value ?? 0).toLocaleString(),
      icon: iconConfig.icon,
      iconColor: iconConfig.iconColor,
      change: card.change,
      isPositive: card.isPositive,
      subtitle: card.subtitle,
      cardKey: card.key, // Rename to cardKey to preserve the value if needed elsewhere
    };
  });
}

function buildDonutChart(labels, dataset, title) {
  return {
    options: {
      labels,
      legend: {
        position: 'bottom',
      },
      plotOptions: {
        pie: {
          donut: {
            size: '60%',
          },
        },
      },
      title: {
        text: title,
        style: {
          fontWeight: 500,
        },
      },
    },
    series: dataset,
  };
}

function buildColumnChart(labels, dataset, title) {
  return {
    options: {
      chart: {
        id: 'courses-status',
      },
      title: {
        text: title,
        style: {
          fontWeight: 500,
        },
      },
      xaxis: {
        categories: labels,
        labels: {
          style: {
            fontWeight: 500,
          },
        },
      },
      dataLabels: {
        enabled: true,
      },
      plotOptions: {
        bar: {
          columnWidth: '45%',
          borderRadius: 6,
        },
      },
    },
    series: [
      {
        name: 'Courses',
        data: dataset,
      },
    ],
  };
}

function buildUserDistributionChart(payload) {
  if (!payload || !payload.byRole?.length) {
    return null;
  }

  const labels = payload.byRole.map((item) => item.label);
  const dataset = payload.byRole.map((item) => item.count);

  return buildDonutChart(labels, dataset, 'Users by Role');
}

function transformActivities(items = []) {
  return items.map((item) => ({
    title: item.title,
    description: item.description,
    icon: item.icon,
    iconColor: item.iconColor,
    timestamp: formatRelativeTime(item.timestamp),
    user: item.user?.name ?? 'System',
  }));
}

function enhanceQuickActions(actions = []) {
  return actions.map((action) => ({
    ...action,
    iconColor: action.iconColor ?? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300',
  }));
}

function RecentTermsCard({ terms }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900/70">
      <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
        <h3 className="font-medium text-gray-900 dark:text-white">Recent Terms</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-900/40">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Title</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Branch</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Dates</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {terms.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400" colSpan={4}>
                  No recent terms found.
                </td>
              </tr>
            )}
            {terms.map((term) => (
              <tr key={term.id}>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{term.title}</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{term.branch?.name ?? '—'}</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(term.start_date)} – {formatDate(term.end_date)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={term.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RecentCoursesCard({ courses }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900/70">
      <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
        <h3 className="font-medium text-gray-900 dark:text-white">Recent Courses</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-900/40">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Code</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Title</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Org Unit</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {courses.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400" colSpan={4}>
                  No recent courses found.
                </td>
              </tr>
            )}
            {courses.map((course) => (
              <tr key={course.id}>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{course.code}</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{course.title}</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{course.org_unit?.name ?? '—'}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={course.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    planned: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    closed: 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    draft: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    archived: 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  };

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${styles[status] ?? 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
      {status ?? 'unknown'}
    </span>
  );
}

function formatDate(value) {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value));
  } catch (e) {
    return value;
  }
}

function formatRelativeTime(value) {
  if (!value) return '';
  try {
    const date = new Date(value);
    const now = new Date();
    const diff = (date.getTime() - now.getTime()) / 1000; // seconds difference
    const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

    const thresholds = [
      { limit: 60, divisor: 1, unit: 'second' },
      { limit: 3600, divisor: 60, unit: 'minute' },
      { limit: 86400, divisor: 3600, unit: 'hour' },
      { limit: 604800, divisor: 86400, unit: 'day' },
      { limit: 2629800, divisor: 604800, unit: 'week' },
      { limit: 31557600, divisor: 2629800, unit: 'month' },
    ];

    for (const threshold of thresholds) {
      if (Math.abs(diff) < threshold.limit) {
        return formatter.format(Math.round(diff / threshold.divisor), threshold.unit);
      }
    }

    return formatter.format(Math.round(diff / 31557600), 'year');
  } catch (e) {
    return new Date(value).toLocaleString();
  }
}
