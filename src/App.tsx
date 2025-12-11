import React, { useState, useEffect } from 'react';
import { Home, Flame, MessageCircle, Video } from 'lucide-react';
import Feed from './components/Feed';
import Packages from './components/Packages';
import Chat from './components/Chat';
import VideoCall from './components/VideoCall';
import LiveCall from './components/LiveCall';

function App() {
  const [activeTab, setActiveTab] = useState('feed');
  const [isInCall, setIsInCall] = useState(false);
  const [callDuration, setCallDuration] = useState(10); // duração padrão em minutos

  useEffect(() => {
    // Disable right-click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Disable F12, Ctrl+Shift+I, Ctrl+U
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'C') ||
        (e.ctrlKey && e.key === 'u')
      ) {
        e.preventDefault();
      }
    };

    // Disable text selection
    const handleSelectStart = (e: Event) => {
      e.preventDefault();
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('selectstart', handleSelectStart);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('selectstart', handleSelectStart);
    };
  }, []);

  // Função para mudar de aba e rolar para o topo
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Rolar para o topo suavemente
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  // Se estiver em chamada, mostrar a tela de chamada
  if (isInCall) {
    return (
      <LiveCall 
        duration={callDuration} 
        onCallEnd={() => {
          setIsInCall(false);
          handleTabChange('feed');
        }} 
      />
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'feed':
        return <Feed />;
      case 'packages':
        return <Packages />;
      case 'video':
        return (
          <VideoCall onStartCall={(duration) => { setCallDuration(duration); setIsInCall(true); }} />
        );
      case 'chat':
        return <Chat onTabChange={handleTabChange} onStartCall={(duration) => { setCallDuration(duration); setIsInCall(true); }} />;
      default:
        return <Feed />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900" style={{ backgroundColor: '#0D0D0D' }}>
      {renderContent()}
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-t border-gray-800/50 px-4 py-3 shadow-2xl">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <button
            onClick={() => handleTabChange('feed')}
            className={`flex flex-col items-center py-3 px-4 rounded-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 ${
              activeTab === 'feed' 
                ? 'text-orange-400 bg-gradient-to-br from-orange-500/20 to-orange-600/20 shadow-lg shadow-orange-500/25 border border-orange-500/30' 
                : 'text-gray-400 hover:text-orange-400 hover:bg-gray-800/50'
            }`}
          >
            <div className={`transition-all duration-300 ${activeTab === 'feed' ? 'animate-pulse' : ''}`}>
              <Home size={22} />
            </div>
            <span className="text-xs mt-1 font-medium">Feed</span>
          </button>
        
         {/* 
          
          <button
            onClick={() => handleTabChange('video')}
            className={`flex flex-col items-center py-3 px-4 rounded-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 ${
              activeTab === 'video' 
                ? 'text-orange-400 bg-gradient-to-br from-orange-500/20 to-orange-600/20 shadow-lg shadow-orange-500/25 border border-orange-500/30' 
                : 'text-gray-400 hover:text-orange-400 hover:bg-gray-800/50'
            }`}
          >
            <div className={`transition-all duration-300 ${activeTab === 'video' ? 'animate-pulse' : ''}`}>
              <Video size={22} />
            </div>
            <span className="text-xs mt-1 font-medium">Ao Vivo</span>
          </button>
          
          <button
            onClick={() => handleTabChange('chat')}
            className={`flex flex-col items-center py-3 px-4 rounded-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 ${
              activeTab === 'chat' 
                ? 'text-orange-400 bg-gradient-to-br from-orange-500/20 to-orange-600/20 shadow-lg shadow-orange-500/25 border border-orange-500/30' 
                : 'text-gray-400 hover:text-orange-400 hover:bg-gray-800/50'
            }`}
          >
            <div className={`transition-all duration-300 ${activeTab === 'chat' ? 'animate-pulse' : ''}`}>
              <MessageCircle size={22} />
            </div>
            <span className="text-xs mt-1 font-medium">Chat</span>
          </button>

          comentário aqui */}
        </div>
      </nav>
    </div>
  );
}

export default App;
