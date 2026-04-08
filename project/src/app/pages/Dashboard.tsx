import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { FileText, TrendingDown, Activity, Plus, Clock } from 'lucide-react';
import { Link } from 'react-router';
import { getStats, getDecisions } from '../api';

const MOOD_COLORS: Record<string, string> = {
  confident: '#22c55e',
  anxious: '#ef4444',
  neutral: '#94a3b8',
  tired: '#f59e0b',
  excited: '#3b82f6',
};

const CATEGORY_COLORS = ['#3b82f6', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444'];

export function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [decisions, setDecisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Get the logged in user's name from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const firstName = user?.name?.split(' ')[0] || 'there';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, decisionsData] = await Promise.all([
          getStats(),
          getDecisions(),
        ]);
        setStats(statsData);
        setDecisions(decisionsData.slice(0, 5)); // Show last 5
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Build chart data from real stats
  const debtByCategory = stats
    ? Object.entries(stats.categoryBreakdown || {}).map(([category, count]) => ({
        category: category.charAt(0).toUpperCase() + category.slice(1),
        debt: count,
      }))
    : [];

  const debtByMood = stats
    ? Object.entries(stats.moodBreakdown || {}).map(([mood, count]) => ({
        mood: mood.charAt(0).toUpperCase() + mood.slice(1),
        value: count,
        color: MOOD_COLORS[mood] || '#94a3b8',
      }))
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 min-h-screen">
      {/* Welcome Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl">Welcome back, {firstName}! 👋</h1>
          <p className="text-muted-foreground">
            Here's your decision-making journey at a glance
          </p>
        </div>
        <Link
          to="/decisions/new"
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg font-medium"
        >
          <Plus className="w-5 h-5" />
          <span>New Decision</span>
        </Link>
      </div>

      {/* Summary Stats — real numbers from backend */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-start justify-between mb-3">
            <div className="bg-white/20 rounded-lg p-3">
              <FileText className="w-6 h-6" />
            </div>
          </div>
          <p className="text-blue-100 mb-1">Total Decisions</p>
          <h3 className="text-4xl font-bold mb-1">{stats?.total ?? 0}</h3>
          <p className="text-blue-100">{stats?.pendingReview ?? 0} pending review</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-start justify-between mb-3">
            <div className="bg-white/20 rounded-lg p-3">
              <TrendingDown className="w-6 h-6" />
            </div>
          </div>
          <p className="text-purple-100 mb-1">Total Decision Debt</p>
          <h3 className="text-4xl font-bold mb-1">{stats?.totalDebt ?? 0}</h3>
          <p className="text-purple-100">Accumulated score</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-start justify-between mb-3">
            <div className="bg-white/20 rounded-lg p-3">
              <Activity className="w-6 h-6" />
            </div>
          </div>
          <p className="text-indigo-100 mb-1">Avg Debt per Decision</p>
          <h3 className="text-4xl font-bold mb-1">{stats?.avgDebt ?? 0}</h3>
          <p className="text-indigo-100">Lower is better</p>
        </div>
      </div>

      {/* Empty state — shown when user has no decisions yet */}
      {decisions.length === 0 ? (
        <div className="bg-white border border-border rounded-xl p-12 text-center shadow-sm">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold mb-2">No decisions yet!</h3>
          <p className="text-muted-foreground mb-6">
            Start tracking your decisions to see insights and patterns here.
          </p>
          <Link
            to="/decisions/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md font-medium"
          >
            <Plus className="w-5 h-5" />
            Log your first decision
          </Link>
        </div>
      ) : (
        <>
          {/* Charts — only shown when there's real data */}
          {debtByCategory.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
                <h3 className="mb-6 flex items-center gap-2">
                  <span className="text-2xl">📊</span> Decisions by Category
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={debtByCategory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="category" tick={{ fill: '#6b7280' }} />
                    <YAxis tick={{ fill: '#6b7280' }} />
                    <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                    <Bar dataKey="debt" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {debtByMood.length > 0 && (
                <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
                  <h3 className="mb-6 flex items-center gap-2">
                    <span className="text-2xl">😊</span> Decisions by Mood
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={debtByMood} cx="50%" cy="50%" labelLine={false}
                        label={({ mood, percent }) => `${mood} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100} dataKey="value">
                        {debtByMood.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {/* Recent Decisions Table */}
          <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border bg-gradient-to-r from-blue-50 to-purple-50">
              <h3 className="flex items-center gap-2">
                <span className="text-2xl">📝</span> Recent Decisions
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-muted-foreground">Title</th>
                    <th className="px-6 py-3 text-left text-muted-foreground">Category</th>
                    <th className="px-6 py-3 text-left text-muted-foreground">Mood</th>
                    <th className="px-6 py-3 text-left text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {decisions.map((decision, index) => (
                    <tr key={decision._id} className={index !== decisions.length - 1 ? 'border-b border-border' : ''}>
                      <td className="px-6 py-4">{decision.title}</td>
                      <td className="px-6 py-4 text-muted-foreground capitalize">{decision.category}</td>
                      <td className="px-6 py-4 capitalize">{decision.mood}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md ${decision.reviewed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {decision.reviewed ? 'Reviewed' : 'Pending Review'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
