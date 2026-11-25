import Navbar from './Navbar';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import ChatContainer from '../chat/ChatContainer';

export default function MainLayout({
  children,
  hideSidebars = false,
  wide = false,
}) {
  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <Navbar />
      <div className={`mx-auto pt-14 ${wide ? 'max-w-6xl px-2 sm:px-4' : 'max-w-7xl px-4'}`}>
        {hideSidebars ? (
          <div className={`${wide ? 'w-full py-4' : 'max-w-2xl mx-auto py-6'}`}>
            {children}
          </div>
        ) : (
          <div className="flex justify-between gap-4 py-4">
            <LeftSidebar />
            <main className="flex-1 min-w-0 max-w-[640px] xl:max-w-[680px] mx-auto">
              {children}
            </main>
            <RightSidebar />
          </div>
        )}
      </div>
      <ChatContainer />
    </div>
  );
}
