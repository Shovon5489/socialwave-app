import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      toast.error('Please complete all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    // Auto-generate username from name or email if empty
    const derivedUsername = (formData.username || `${formData.firstName}${formData.lastName}${Math.floor(Math.random() * 1000)}`)
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '');

    try {
      setLoading(true);
      await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        username: derivedUsername,
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
      });
      toast.success('Account created! Welcome to Facebook!');
      navigate('/feed');
    } catch (err) {
      toast.error(err.message || 'Registration failed. Try a different email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col justify-between py-8 px-4">
      <div className="max-w-md w-full mx-auto my-auto">
        {/* SocialWave Logo Header */}
        <div className="text-center mb-6">
          <Link to="/login" className="inline-flex items-center gap-2">
            <span className="text-4xl">🌊</span>
            <h1 className="text-4xl font-black bg-gradient-to-r from-[#1877F2] to-blue-700 bg-clip-text text-transparent tracking-tighter">
              SocialWave
            </h1>
          </Link>
        </div>

        {/* Facebook Sign Up Card */}
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-[#1C1E21]">Create a new account</h2>
            <p className="text-sm text-[#606770]">It's quick and easy.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="First name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
                className="w-full px-3 py-2.5 bg-[#F5F6F7] border border-gray-300 rounded-md text-[15px] text-[#1C1E21] placeholder-[#8D949E] focus:bg-white focus:border-[#1877F2] outline-none"
              />
              <input
                type="text"
                placeholder="Last name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
                className="w-full px-3 py-2.5 bg-[#F5F6F7] border border-gray-300 rounded-md text-[15px] text-[#1C1E21] placeholder-[#8D949E] focus:bg-white focus:border-[#1877F2] outline-none"
              />
            </div>

            <div>
              <input
                type="text"
                placeholder="Username (optional)"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-3 py-2.5 bg-[#F5F6F7] border border-gray-300 rounded-md text-[15px] text-[#1C1E21] placeholder-[#8D949E] focus:bg-white focus:border-[#1877F2] outline-none"
              />
            </div>

            <div>
              <input
                type="email"
                placeholder="Mobile number or email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-3 py-2.5 bg-[#F5F6F7] border border-gray-300 rounded-md text-[15px] text-[#1C1E21] placeholder-[#8D949E] focus:bg-white focus:border-[#1877F2] outline-none"
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="New password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="w-full px-3 py-2.5 bg-[#F5F6F7] border border-gray-300 rounded-md text-[15px] text-[#1C1E21] placeholder-[#8D949E] focus:bg-white focus:border-[#1877F2] outline-none"
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                className="w-full px-3 py-2.5 bg-[#F5F6F7] border border-gray-300 rounded-md text-[15px] text-[#1C1E21] placeholder-[#8D949E] focus:bg-white focus:border-[#1877F2] outline-none"
              />
            </div>

            <p className="text-[11px] text-[#777] leading-relaxed pt-1">
              People who use our service may have uploaded your contact information to Facebook.{' '}
              <a href="#" className="text-[#385898]">Learn more</a>.
            </p>

            <p className="text-[11px] text-[#777] leading-relaxed">
              By clicking Sign Up, you agree to our <a href="#" className="text-[#385898]">Terms</a>,{' '}
              <a href="#" className="text-[#385898]">Privacy Policy</a> and{' '}
              <a href="#" className="text-[#385898]">Cookies Policy</a>.
            </p>

            <div className="text-center pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-12 py-2.5 bg-[#00A400] hover:bg-[#008A00] text-white font-bold text-[18px] rounded-md transition-colors shadow-sm disabled:opacity-50"
              >
                {loading ? 'Signing Up...' : 'Sign Up'}
              </button>
            </div>

            <div className="text-center pt-2">
              <Link to="/login" className="text-[14px] text-[#1877F2] hover:underline">
                Already have an account?
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
