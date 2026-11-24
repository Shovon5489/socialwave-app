import Navbar from './Navbar';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';

export default function MainLayout({ children, hideSidebars = false }) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-16">
        {hideSidebars ? (
          <div className="max-w-2xl mx-auto py-6">{children}</div>
        ) : (
          <div className="flex gap-4 py-4">
            <LeftSidebar />
            <main className="flex-1 min-w-0 max-w-2xl mx-auto lg:mx-0">
              {children}
            </main>
            <RightSidebar />
          </div>
        )}
      </div>
    </div>
  );
}
