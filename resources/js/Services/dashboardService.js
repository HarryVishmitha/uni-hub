import axios from 'axios';

/**
 * Fetch real dashboard metrics from the backend API.
 * @param {Object} params Optional query params (e.g., branch_id)
 * @returns {Promise<Object>}
 */
export async function fetchDashboardMetrics(params = {}) {
  const response = await axios.get('/admin/api/metrics', { params });
  return response.data;
}

/**
 * Fetch the recent activity feed for the dashboard.
 * @param {Object} params Optional query params (e.g., branch_id)
 * @returns {Promise<Array>}
 */
export async function fetchRecentActivities(params = {}) {
  const response = await axios.get('/admin/api/activities', { params });
  return response.data?.data ?? [];
}

/**
 * Fetch shortcut / quick action definitions for the dashboard.
 * @param {Object} params Optional query params (e.g., branch_id)
 * @returns {Promise<Array>}
 */
export async function fetchQuickActions(params = {}) {
  const response = await axios.get('/admin/api/quick-actions', { params });
  return response.data?.data ?? [];
}
