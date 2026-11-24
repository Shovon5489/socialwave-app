import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';
import { Mail, Lock, Sparkles, Users, Shield, Heart } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await login(formData.email, formData.password);
      toast.success('Welcome back to SocialWave!');
      navigate('/feed');
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Branding Showcase */}
        <div className="space-y-6 hidden lg:block">
          <div className="flex items-center gap-3">
            <span className="text-5xl">🌊</span>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              SocialWave
            </h1>
          </div>
          <p className="text-xl text-gray-600 font-medium leading-relaxed">
            Connect with friends, share your passions, and discover stories happening across the world.
          </p>

          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3 text-gray-700">
              <div className="p-2.5 rounded-lg bg-blue-100 text-primary">
                <Users className="w-5 h-5" />
              </div>
              <span className="font-medium">Connect with friends, colleagues, and family</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <div className="p-2.5 rounded-lg bg-indigo-100 text-indigo-600">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-medium">Share photos, videos, and 24-hour stories</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <div className="p-2.5 rounded-lg bg-green-100 text-green-600">
                <Shield className="w-5 h-5" />
              </div>
              <span className="font-medium">Private, secure, and customizable privacy controls</span>
            </div>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-10">
          <div className="text-center mb-8 lg:text-left">
            <span className="text-3xl lg:hidden inline-block mb-2">🌊</span>
            <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
            <p className="text-sm text-gray-500 mt-1">Sign in to your SocialWave account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              icon={Mail}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />

            <Button type="submit" loading={loading} className="w-full mt-2">
              Sign In
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-primary hover:underline">
                Create new account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
