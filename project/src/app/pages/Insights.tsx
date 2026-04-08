import { useEffect, useState } from 'react';
import { TrendingUp, AlertCircle, Brain, Clock, Plus, Star, Bell } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Link } from 'react-router';
import { getDecisions } from '../api';

export function Insights() {
  const [decisions, setDecisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reminderSet, setReminderSet] = useState(false);
  const [activeTab, setActiveTab] = useState<'insights' | 'confidence' | 'reminders'>('insights');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDecisions();
        setDecisions(data);
      } catch (err) {
        console.error('Failed to fetch decisions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Analysing your patterns...</p>
        </div>
      </div>
    );
  }

  // ── Confidence score over time ──
  // Each decision has a debtScore (1-10). Lower = more confident/thoughtful.
  // Confidence score = 10 - debtScore (so higher = better)
  const confidenceData = decisions
    .slice()
    .reverse()
    .map((d, i) => ({
      decision: `#${i + 1}`,
      confidence: 10 - d.debtScore,
      debt: d.debtScore,
      title: d.title.length > 20 ? d.title.slice(0, 20) + '...' : d.title,
      mood: d.mood,
    }));

  // Trend: are they improving? Compare first half vs second half avg confidence
  const half = Math.floor(confidenceData.length / 2);
  const firstHalfAvg = half > 0
    ? confidenceData.slice(0, half).reduce((a, b) => a + b.confidence, 0) / half
    : 0;
  const secondHalfAvg = half > 0
    ? confidenceData.slice(half).reduce((a, b) => a + b.confidence, 0) / (confidenceData.length - half)
    : 0;
  const improving = secondHalfAvg >= firstHalfAvg;
  const improvementPct = half > 0
    ? Math.abs(((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100).toFixed(0)
    : '0';

  // ── Reminders: decisions due for review ──
  const pendingReview = decisions.filter(d => {
    if (d.reviewed) return false;
    const loggedDate = new Date(d.createdAt);
    const reviewDue = new Date(loggedDate);
    reviewDue.setDate(reviewDue.getDate() + (d.reviewAfterDays || 7));
    return new Date() >= reviewDue;
  });

  const upcomingReview = decisions.filter(d => {
    if (d.reviewed) return false;
    const loggedDate = new Date(d.createdAt);
    const reviewDue = new Date(loggedDate);
    reviewDue.setDate(reviewDue.getDate() + (d.reviewAfterDays || 7));
    const daysUntil = Math.ceil((reviewDue.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil > 0 && daysUntil <= 3;
  });

  // ── Insight cards from real data ──
  const nightDecisions = decisions.filter(d => d.timeOfDay === 'night' || d.timeOfDay === 'evening');
  const nightHighDebt = nightDecisions.filter(d => d.debtScore >= 7);
  const nightPct = decisions.length > 0 ? Math.round((nightHighDebt.length / decisions.length) * 100) : 0;

  const categoryDebt: Record<string, number[]> = {};
  decisions.forEach(d => {
    if (!categoryDebt[d.category]) categoryDebt[d.category] = [];
    categoryDebt[d.category].push(d.debtScore);
  });
  const categoryAvg = Object.entries(categoryDebt).map(([cat, scores]) => ({
    cat,
    avg: scores.reduce((a, b) => a + b, 0) / scores.length,
  })).sort((a, b) => b.avg - a.avg);
  const highestCat = categoryAvg[0];
  const avgDebt = decisions.length > 0
    ? decisions.reduce((a, b) => a + b.debtScore, 0) / decisions.length
    : 0;

  const moodCount: Record<string, number> = {};
  decisions.forEach(d => { moodCount[d.mood] = (moodCount[d.mood] || 0) + 1; });
  const topMood = Object.entries(moodCount).sort((a, b) => b[1] - a[1])[0];

  const insights = [
    nightPct > 0 && {
      icon: Clock,
      title: nightPct > 30 ? 'Many high-debt decisions at night' : 'Some late-night decisions logged',
      description: `${nightPct}% of your high-debt decisions were made in the evening or night. Consider deferring important choices to morning.`,
      type: nightPct > 30 ? 'warning' : 'success',
    },
    highestCat && {
      icon: Brain,
      title: `${highestCat.cat.charAt(0).toUpperCase() + highestCat.cat.slice(1)} category has highest debt`,
      description: `Your ${highestCat.cat} decisions average ${highestCat.avg.toFixed(1)} debt score. Take more time before committing in this area.`,
      type: highestCat.avg > 6 ? 'alert' : 'warning',
    },
    {
      icon: TrendingUp,
      title: 'Your average decision debt',
      description: `Overall average: ${avgDebt.toFixed(1)}/10. ${avgDebt < 5 ? 'Great — you are making thoughtful decisions!' : 'Try slowing down and reflecting before deciding.'}`,
      type: avgDebt < 5 ? 'success' : 'warning',
    },
    topMood && {
      icon: AlertCircle,
      title: `Most common mood: ${topMood[0]}`,
      description: `You logged ${topMood[1]} decision${topMood[1] > 1 ? 's' : ''} while feeling ${topMood[0]}. ${topMood[0] === 'anxious' || topMood[0] === 'tired' ? 'These moods are linked to higher regret — take breaks when possible.' : 'Keep it up!'}`,
      type: (topMood[0] === 'anxious' || topMood[0] === 'tired') ? 'alert' : 'success',
    },
  ].filter(Boolean) as any[];

  const tabClass = (tab: string) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
      activeTab === tab
        ? 'bg-purple-600 text-white'
        : 'text-muted-foreground hover:bg-accent'
    }`;

  return (
    <div className="p-8 bg-gradient-to-br from-purple-50/50 via-white to-blue-50/50 min-h-screen">
      <div className="mb-6">
        <h1 className="mb-2 text-3xl">Insights & Patterns 🧠</h1>
        <p className="text-muted-foreground">Based on your {decisions.length} logged decisions</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 bg-white border border-border rounded-xl p-1.5 w-fit shadow-sm">
        <button className={tabClass('insights')} onClick={() => setActiveTab('insights')}>Insights</button>
        <button className={tabClass('confidence')} onClick={() => setActiveTab('confidence')}>Confidence score</button>
        <button className={tabClass('reminders')} onClick={() => setActiveTab('reminders')}>
          Reminders
          {(pendingReview.length + upcomingReview.length) > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
              {pendingReview.length + upcomingReview.length}
            </span>
          )}
        </button>
      </div>

      {/* ── INSIGHTS TAB ── */}
      {activeTab === 'insights' && (
        <>
          {decisions.length < 2 ? (
            <div className="bg-white border border-border rounded-xl p-12 text-center shadow-sm">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">Not enough data yet</h3>
              <p className="text-muted-foreground mb-6">Log at least 2 decisions to see patterns.</p>
              <Link to="/decisions/new" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium">
                <Plus className="w-5 h-5" /> Log a decision
              </Link>
            </div>
          ) : (
            <>
              <div className="bg-white border border-border rounded-xl p-6 shadow-lg mb-8">
                <h3 className="mb-6 flex items-center gap-2"><span className="text-2xl">📈</span> Decision Debt Trend</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={confidenceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="decision" tick={{ fill: '#6b7280' }} />
                    <YAxis tick={{ fill: '#6b7280' }} />
                    <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} formatter={(v: any) => [`Debt: ${v}`, '']} />
                    <Line type="monotone" dataKey="debt" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {insights.map((insight, i) => {
                  const Icon = insight.icon;
                  const bgGradient = insight.type === 'success' ? 'from-green-50 to-emerald-50 border-green-200' : insight.type === 'warning' ? 'from-yellow-50 to-amber-50 border-yellow-200' : 'from-red-50 to-pink-50 border-red-200';
                  const iconBg = insight.type === 'success' ? 'bg-green-100' : insight.type === 'warning' ? 'bg-yellow-100' : 'bg-red-100';
                  const iconColor = insight.type === 'success' ? 'text-green-600' : insight.type === 'warning' ? 'text-yellow-600' : 'text-red-600';
                  return (
                    <div key={i} className={`border-2 rounded-xl p-6 bg-gradient-to-br ${bgGradient} shadow-sm hover:shadow-md transition-all`}>
                      <div className="flex items-start gap-4">
                        <div className={`mt-1 ${iconBg} rounded-lg p-3 ${iconColor}`}><Icon className="w-6 h-6" /></div>
                        <div className="flex-1">
                          <h4 className="mb-2 font-semibold">{insight.title}</h4>
                          <p className="text-muted-foreground">{insight.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}

      {/* ── CONFIDENCE SCORE TAB ── */}
      {activeTab === 'confidence' && (
        <>
          {decisions.length < 2 ? (
            <div className="bg-white border border-border rounded-xl p-12 text-center shadow-sm">
              <div className="text-6xl mb-4">⭐</div>
              <h3 className="text-xl font-semibold mb-2">Log more decisions to see your confidence trend</h3>
              <Link to="/decisions/new" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium mt-4">
                <Plus className="w-5 h-5" /> Log a decision
              </Link>
            </div>
          ) : (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white border border-border rounded-xl p-6 shadow-sm text-center">
                  <p className="text-muted-foreground text-sm mb-2">Current avg confidence</p>
                  <p className="text-4xl font-bold text-purple-600">{(10 - avgDebt).toFixed(1)}</p>
                  <p className="text-muted-foreground text-sm mt-1">out of 10</p>
                </div>
                <div className={`border rounded-xl p-6 shadow-sm text-center ${improving ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <p className="text-muted-foreground text-sm mb-2">Trend</p>
                  <p className={`text-4xl font-bold ${improving ? 'text-green-600' : 'text-red-600'}`}>
                    {improving ? '↑' : '↓'} {improvementPct}%
                  </p>
                  <p className="text-muted-foreground text-sm mt-1">{improving ? 'Improving!' : 'Needs attention'}</p>
                </div>
                <div className="bg-white border border-border rounded-xl p-6 shadow-sm text-center">
                  <p className="text-muted-foreground text-sm mb-2">Best decision</p>
                  <p className="text-4xl font-bold text-blue-600">
                    {Math.max(...confidenceData.map(d => d.confidence))}/10
                  </p>
                  <p className="text-muted-foreground text-sm mt-1">confidence score</p>
                </div>
              </div>

              {/* Confidence chart */}
              <div className="bg-white border border-border rounded-xl p-6 shadow-lg mb-8">
                <h3 className="mb-2 flex items-center gap-2"><Star className="w-5 h-5 text-purple-600" /> Confidence score over time</h3>
                <p className="text-sm text-muted-foreground mb-6">Higher = more thoughtful decision. Calculated as 10 minus your debt score.</p>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={confidenceData}>
                    <defs>
                      <linearGradient id="confGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="decision" tick={{ fill: '#6b7280' }} />
                    <YAxis domain={[0, 10]} tick={{ fill: '#6b7280' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                      formatter={(v: any, name: any) => [`${v}/10`, 'Confidence']}
                      labelFormatter={(label, payload) => payload?.[0]?.payload?.title || label}
                    />
                    <Area type="monotone" dataKey="confidence" stroke="#8b5cf6" strokeWidth={3} fill="url(#confGradient)" dot={{ fill: '#8b5cf6', r: 5 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Decision breakdown */}
              <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border">
                  <h3 className="font-semibold">All decisions ranked by confidence</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-muted-foreground text-sm">Decision</th>
                        <th className="px-6 py-3 text-left text-muted-foreground text-sm">Mood</th>
                        <th className="px-6 py-3 text-left text-muted-foreground text-sm">Confidence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...confidenceData].sort((a, b) => b.confidence - a.confidence).map((d, i) => (
                        <tr key={i} className={i !== confidenceData.length - 1 ? 'border-b border-border' : ''}>
                          <td className="px-6 py-4 text-sm">{d.title}</td>
                          <td className="px-6 py-4 text-sm capitalize text-muted-foreground">{d.mood}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 bg-gray-100 rounded-full h-2 max-w-24">
                                <div className="h-2 rounded-full bg-purple-500" style={{ width: `${d.confidence * 10}%` }}></div>
                              </div>
                              <span className="text-sm font-medium">{d.confidence}/10</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* ── REMINDERS TAB ── */}
      {activeTab === 'reminders' && (
        <div className="space-y-6">
          {/* Overdue */}
          {pendingReview.length > 0 && (
            <div>
              <h3 className="font-semibold text-red-600 mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5" /> Overdue for review ({pendingReview.length})
              </h3>
              <div className="space-y-3">
                {pendingReview.map(d => {
                  const due = new Date(d.createdAt);
                  due.setDate(due.getDate() + (d.reviewAfterDays || 7));
                  const daysOverdue = Math.floor((new Date().getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={d._id} className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-red-900">{d.title}</p>
                        <p className="text-sm text-red-600 mt-1">
                          {daysOverdue === 0 ? 'Due today' : `${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue`} · {d.category} · Debt score: {d.debtScore}
                        </p>
                      </div>
                      <Link to={`/decisions/${d._id}/review`} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
                        Review now
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Upcoming */}
          {upcomingReview.length > 0 && (
            <div>
              <h3 className="font-semibold text-amber-600 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" /> Coming up in 3 days ({upcomingReview.length})
              </h3>
              <div className="space-y-3">
                {upcomingReview.map(d => {
                  const due = new Date(d.createdAt);
                  due.setDate(due.getDate() + (d.reviewAfterDays || 7));
                  const daysUntil = Math.ceil((due.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={d._id} className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-amber-900">{d.title}</p>
                        <p className="text-sm text-amber-600 mt-1">
                          Due in {daysUntil} day{daysUntil > 1 ? 's' : ''} · {d.category} · Debt score: {d.debtScore}
                        </p>
                      </div>
                      <span className="px-4 py-2 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium">Upcoming</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* All pending */}
          <div>
            <h3 className="font-semibold text-muted-foreground mb-4">All pending decisions ({decisions.filter(d => !d.reviewed).length})</h3>
            {decisions.filter(d => !d.reviewed).length === 0 ? (
              <div className="bg-white border border-border rounded-xl p-12 text-center">
                <div className="text-5xl mb-3">🎉</div>
                <p className="font-semibold">All decisions reviewed!</p>
                <p className="text-muted-foreground mt-1">You are fully up to date.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {decisions.filter(d => !d.reviewed).map(d => {
                  const due = new Date(d.createdAt);
                  due.setDate(due.getDate() + (d.reviewAfterDays || 7));
                  const daysUntil = Math.ceil((due.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={d._id} className="bg-white border border-border rounded-xl p-5 flex items-center justify-between hover:shadow-sm transition-shadow">
                      <div>
                        <p className="font-medium">{d.title}</p>
                        <p className="text-sm text-muted-foreground mt-1 capitalize">
                          {d.category} · {daysUntil > 0 ? `Review in ${daysUntil} day${daysUntil > 1 ? 's' : ''}` : 'Ready to review'}
                        </p>
                      </div>
                      <Link to={`/decisions/${d._id}/review`} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors">
                        Review
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
