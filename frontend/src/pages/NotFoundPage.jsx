import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
        <span className="text-6xl mb-4 inline-block">🌊</span>
        <h1 className="text-5xl font-black text-gray-900 mb-2">404</h1>
        <h2 className="text-lg font-bold text-gray-800 mb-2">Page Not Found</h2>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          The page you requested may have moved, expired, or doesn't exist.
        </p>
        <Link to="/feed">
          <Button icon={Home} className="w-full">
            Back to Home Feed
          </Button>
        </Link>
      </div>
    </div>
  );
}
