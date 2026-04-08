import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Slider } from '../components/Slider';
import { Button } from '../components/Button';
import { createDecision } from '../api';

const categories = [
  { value: 'health', label: 'Health' },
  { value: 'career', label: 'Career' },
  { value: 'finance', label: 'Finance' },
  { value: 'relationships', label: 'Relationships' },
  { value: 'personal', label: 'Personal' },
];

const moods = [
  { value: 'anxious', label: 'Anxious' },
  { value: 'confident', label: 'Confident' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'tired', label: 'Tired' },
  { value: 'excited', label: 'Excited' },
];

const timesOfDay = [
  { value: 'morning', label: 'Morning (6am - 12pm)' },
  { value: 'afternoon', label: 'Afternoon (12pm - 6pm)' },
  { value: 'evening', label: 'Evening (6pm - 12am)' },
  { value: 'night', label: 'Night (12am - 6am)' },
];

const expectedOutcomes = [
  { value: 'very-positive', label: 'Very Positive' },
  { value: 'positive', label: 'Positive' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'negative', label: 'Negative' },
  { value: 'very-negative', label: 'Very Negative' },
];

export function AddDecision() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('personal');
  const [mood, setMood] = useState('neutral');
  const [confidence, setConfidence] = useState(3);
  const [timeOfDay, setTimeOfDay] = useState('morning');
  const [expectedOutcome, setExpectedOutcome] = useState('positive');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Smart warning logic
  const showWarning = (mood === 'anxious' && timeOfDay === 'night') || mood === 'tired' || timeOfDay === 'night';
  const warningText =
    mood === 'anxious' && timeOfDay === 'night'
      ? 'You are anxious and logging at night — high risk pattern. Consider sleeping on this.'
      : mood === 'tired'
      ? 'Tired-mood decisions carry 44% more regret on average. Make sure you are not rushed.'
      : 'Night-time is your riskiest decision window. Your regret rate is higher after 10pm.';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await createDecision({
        title,
        category,
        mood,
        timeOfDay,
        expectedOutcome,
        debtScore: confidence * 2,
      });
      if (data.decision) {
        navigate('/');
      } else {
        setError(data.message || 'Could not save decision.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 min-h-screen">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl">Log New Decision ✨</h1>
        <p className="text-muted-foreground">Track a new decision to analyze its outcome over time</p>
      </div>

      <div className="bg-white border border-border rounded-xl p-8 shadow-lg">
        {showWarning && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 font-semibold text-sm mb-1">Smart warning detected</p>
            <p className="text-yellow-700 text-sm">{warningText}</p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input label="Decision Title" placeholder="e.g., Switch to new project management tool" value={title} onChange={(e) => setTitle(e.target.value)} required />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select label="Category" options={categories} value={category} onChange={(e) => setCategory(e.target.value)} />
            <Select label="Current Mood" options={moods} value={mood} onChange={(e) => setMood(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select label="Time of Day" options={timesOfDay} value={timeOfDay} onChange={(e) => setTimeOfDay(e.target.value)} />
            <Select label="Expected Outcome" options={expectedOutcomes} value={expectedOutcome} onChange={(e) => setExpectedOutcome(e.target.value)} />
          </div>

          <Slider label="Confidence Level" min={1} max={5} value={confidence} onChange={(val) => setConfidence(val)} />

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? 'Saving...' : 'Log Decision'}
          </Button>
        </form>
      </div>
    </div>
  );
}
