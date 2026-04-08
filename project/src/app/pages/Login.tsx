import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { CheckCircle2 } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { loginUser } from '../api';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await loginUser(email, password);
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/');
      } else {
        setError(data.message || 'Login failed. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <ImageWithFallback src="https://images.unsplash.com/photo-1617294891800-30497d3cbee7?w=1080" alt="Workspace" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10">
          <h1 className="text-white text-4xl font-bold mb-4">Decision Debt Tracker</h1>
          <p className="text-blue-100 text-xl">Make better decisions by learning from the past</p>
        </div>
        <div className="relative z-10 space-y-6">
          {['Track Your Decisions', 'Discover Patterns', 'Improve Over Time'].map((title) => (
            <div key={title} className="flex items-start gap-4">
              <div className="mt-1 bg-white/20 rounded-full p-1">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div className="text-white">
                <h3 className="font-semibold mb-1">{title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-white border border-border rounded-2xl p-8 shadow-xl">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Welcome back</h2>
              <p className="text-muted-foreground">Sign in to continue tracking your decisions</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input label="Email address" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Input label="Password" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" size="lg" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold">Create account</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
