import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error('Please enter your email and password');
      return;
    }

    try {
      setLoading(true);
      await login(formData.email, formData.password);
      toast.success('Welcome back!');
      navigate('/feed');
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col justify-between">
      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:py-20">
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          {/* Left SocialWave Brand */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-3">
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <span className="text-5xl sm:text-6xl">🌊</span>
              <h1 className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-[#1877F2] to-blue-700 bg-clip-text text-transparent tracking-tighter">
                SocialWave
              </h1>
            </div>
            <p className="text-xl sm:text-2xl text-[#1C1E21] font-normal leading-relaxed max-w-md mx-auto lg:mx-0">
              Connect with friends and the world around you on SocialWave.
            </p>
          </div>

          {/* Right Facebook Login Card */}
          <div className="lg:col-span-5 max-w-md w-full mx-auto">
            <div className="bg-white rounded-lg shadow-xl p-5 sm:p-6 space-y-4 border border-gray-200">
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <input
                    type="email"
                    placeholder="Email or phone number"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-4 py-3.5 rounded-md border border-gray-300 focus:border-[#1877F2] focus:ring-1 focus:ring-[#1877F2] outline-none text-[17px] text-[#1C1E21] placeholder-[#8D949E] transition-all"
                  />
                </div>

                <div>
                  <input
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="w-full px-4 py-3.5 rounded-md border border-gray-300 focus:border-[#1877F2] focus:ring-1 focus:ring-[#1877F2] outline-none text-[17px] text-[#1C1E21] placeholder-[#8D949E] transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#1877F2] hover:bg-[#166FE5] text-white text-xl font-bold rounded-md transition-colors shadow-sm disabled:opacity-50"
                >
                  {loading ? 'Logging in...' : 'Log In'}
                </button>
              </form>

              <div className="text-center pt-1">
                <a href="#" className="text-sm text-[#1877F2] hover:underline">
                  Forgot password?
                </a>
              </div>

              <div className="border-t border-gray-300 my-4" />

              <div className="text-center pb-2">
                <Link
                  to="/register"
                  className="inline-block px-5 py-3 bg-[#42B72A] hover:bg-[#36A420] text-white text-[17px] font-bold rounded-md transition-colors shadow-sm"
                >
                  Create new account
                </Link>
              </div>
            </div>

            <p className="text-center text-xs text-[#1C1E21] mt-6">
              <strong>Create a Page</strong> for a celebrity, brand or business.
            </p>
          </div>
        </div>
      </div>

      {/* Facebook Classic Footer */}
      <footer className="bg-white text-xs text-[#8A8D91] py-8 border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4 space-y-2">
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            <span>English (US)</span>
            <span>Español</span>
            <span>Français (France)</span>
            <span>Português (Brasil)</span>
            <span>Deutsch</span>
            <span>Italiano</span>
            <span>বাংলা</span>
            <span>العربية</span>
            <span>हिन्दी</span>
            <span>中文(简体)</span>
            <span>日本語</span>
          </div>
          <div className="border-t border-gray-200 my-2" />
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <span>Sign Up</span>
            <span>Log In</span>
            <span>Messenger</span>
            <span>Facebook Lite</span>
            <span>Video</span>
            <span>Places</span>
            <span>Games</span>
            <span>Marketplace</span>
            <span>Meta Pay</span>
            <span>Meta Store</span>
            <span>Meta Quest</span>
            <span>Instagram</span>
            <span>Threads</span>
            <span>Privacy Policy</span>
            <span>Terms</span>
          </div>
          <p className="pt-2">Meta © 2024</p>
        </div>
      </footer>
    </div>
  );
}
