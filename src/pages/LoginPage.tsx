import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Flame, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch {
      setError('Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="flex items-center gap-2 text-ink-400 hover:text-ink-200 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <div className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
            <Flame className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-2xl font-extrabold tracking-tight">
            Ind<span className="text-brand-500">Tube</span>
          </span>
        </div>

        <h1 className="text-2xl font-bold mb-2">Welcome back</h1>
        <p className="text-ink-400 text-sm mb-6">Sign in to your IndTube account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-300 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-ink-900 border border-ink-800 rounded-lg pl-10 pr-4 py-2.5 text-sm placeholder:text-ink-500 focus:outline-none focus:border-brand-600 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-ink-900 border border-ink-800 rounded-lg pl-10 pr-10 py-2.5 text-sm placeholder:text-ink-500 focus:outline-none focus:border-brand-600 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-error-400 bg-error-950/50 border border-error-900 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-semibold rounded-lg py-2.5 transition-colors"
          >
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-sm text-ink-400 mt-6 text-center">
          Don't have an account?{' '}
          <Link to="/signup" className="text-brand-400 hover:text-brand-300 font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
