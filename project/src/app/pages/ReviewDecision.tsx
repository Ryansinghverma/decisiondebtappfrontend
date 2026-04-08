import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Textarea } from '../components/Textarea';
import { Button } from '../components/Button';
import { reviewDecision, getDecisions } from '../api';

const regretLabels: Record<number, { label: string; color: string }> = {
  1: { label: 'Big regret', color: 'bg-red-100 text-red-700 border-red-200' },
  2: { label: 'Some regret', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  3: { label: 'Neutral outcome', color: 'bg-gray-100 text-gray-700 border-gray-200' },
  4: { label: 'Good outcome', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  5: { label: 'Great outcome', color: 'bg-green-100 text-green-700 border-green-200' },
};

export function ReviewDecision() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [decision, setDecision] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [regretScore, setRegretScore] = useState(3);
  const [reflection, setReflection] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDecision = async () => {
      try {
        // Fetch all decisions and find the one matching the ID from the URL
        const decisions = await getDecisions();
        const found = decisions.find((d: any) => d._id === id);
        if (found) {
          setDecision(found);
        } else {
          setError('Decision not found.');
        }
      } catch {
        setError('Could not load decision.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDecision();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmitting(true);
    try {
      const data = await reviewDecision(id, regretScore);
      if (data.decision) {
        navigate('/');
      } else {
        setError(data.message || 'Could not save review.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !decision) {
    return (
      <div className="p-8 max-w-3xl mx-auto text-center">
        <div className="text-5xl mb-4">😕</div>
        <h3 className="text-xl font-semibold mb-2">Decision not found</h3>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => navigate('/')}>Back to Dashboard</Button>
      </div>
    );
  }

  const selected = regretLabels[regretScore];

  return (
    <div className="p-8 max-w-3xl mx-auto bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 min-h-screen">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl">Review Decision 🔍</h1>
        <p className="text-muted-foreground">Reflect on how this decision turned out</p>
      </div>

      {/* Decision Summary */}
      <div className="bg-white border border-border rounded-xl p-6 shadow-sm mb-6">
        <h3 className="font-semibold mb-4">Decision Summary</h3>
        <div className="space-y-3">
          {[
            ['Title', decision.title],
            ['Category', decision.category],
            ['Mood when decided', decision.mood],
            ['Time of day', decision.timeOfDay],
            ['Debt score', `${decision.debtScore}/10`],
            ['Logged on', new Date(decision.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between items-center py-1 border-b border-border last:border-0">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-medium capitalize">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Review Form */}
      <div className="bg-white border border-border rounded-xl p-8 shadow-sm">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Star rating */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              How did this decision turn out? (1 = big regret, 5 = great outcome)
            </label>
            <div className="flex gap-3 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRegretScore(star)}
                  className={`text-4xl transition-transform hover:scale-110 ${star <= regretScore ? 'opacity-100' : 'opacity-25'}`}
                >
                  ★
                </button>
              ))}
            </div>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${selected.color}`}>
              {regretScore}/5 — {selected.label}
            </span>
          </div>

          <Textarea
            label="Reflection (optional)"
            placeholder="What did you learn? Would you make the same choice again?"
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
          />

          <div className="flex gap-3 pt-2">
            <Button type="submit" size="lg" disabled={submitting} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              {submitting ? 'Saving...' : 'Submit Review'}
            </Button>
            <Button type="button" variant="secondary" size="lg" onClick={() => navigate('/')}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
