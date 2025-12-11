import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Clock, User } from 'lucide-react';

interface LiveCallProps {
  duration: number; // duração em minutos
  onCallEnd: () => void;
}

const LiveCall: React.FC<LiveCallProps> = ({ duration, onCallEnd }) => {
  const [isConnecting, setIsConnecting] = useState(true);
  const [isCallActive, setIsCallActive] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0); // tempo decorrido em segundos
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [callEnded, setCallEnded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const maxDuration = duration * 60; // duração máxima em segundos

  useEffect(() => {
    // Simular tempo de conexão (aumentado para 8 segundos)
    const connectTimer = setTimeout(() => {
      setIsConnecting(false);
      setIsCallActive(true);
      startTimer();
    }, 10000);

    return () => {
      clearTimeout(connectTimer);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeElapsed((prev) => {
        if (prev >= maxDuration - 1) {
          endCall();
          return maxDuration;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const endCall = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsCallActive(false);
    setCallEnded(true);
    
    // Encerrar chamada após 5 segundos
    setTimeout(() => {
      onCallEnd();
    }, 5000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    endCall();
  };

  // Tela de conexão
  if (isConnecting) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center animate-pulse">
            <Video size={40} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Conectando...</h2>
          <p className="text-gray-400 mb-6">Você está se conectando à chamada ao vivo...</p>
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce delay-200"></div>
          </div>
        </div>
      </div>
    );
  }

  // Tela de chamada encerrada
  if (callEnded) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
            <PhoneOff size={40} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Chamada Encerrada</h2>
          <p className="text-gray-400 mb-6">
            Nossa chamada safada de {duration} minutos acabou... Espero que tenha gozado gostoso! 💕🔥
          </p>
          <p className="text-orange-400 text-sm">
            Redirecionando em alguns segundos...
          </p>
        </div>
      </div>
    );
  }

  // Tela da chamada ativa
  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Video principal */}
      <div className="absolute inset-0">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="https://media-wordpress.kjufc9.easypanel.host/wp-content/uploads/2025/10/mj-chamadinha.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Header com timer */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
              <User size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Daynara</h3>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm">Ao vivo</span>
              </div>
            </div>
          </div>
          
          {/* Timer */}
          <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full flex items-center space-x-2">
            <Clock size={16} className="text-orange-400" />
            <span className={`font-mono text-lg font-bold ${
              timeElapsed >= maxDuration - 60 ? 'text-red-400 animate-pulse' : 'text-white'
            }`}>
              {formatTime(timeElapsed)}
            </span>
          </div>
        </div>
      </div>

      {/* Controles da chamada */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-6">
        <div className="bg-black/50 backdrop-blur-xl rounded-2xl p-4">
          <div className="flex items-center justify-center space-x-6">
            {/* Botão de microfone */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 ${
                isMuted 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {isMuted ? <MicOff size={24} className="text-white" /> : <Mic size={24} className="text-white" />}
            </button>

            {/* Botão de encerrar chamada */}
            <button
              onClick={handleEndCall}
              className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110"
            >
              <PhoneOff size={28} className="text-white" />
            </button>

            {/* Botão de vídeo */}
            <button
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 ${
                !isVideoOn 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {isVideoOn ? <Video size={24} className="text-white" /> : <VideoOff size={24} className="text-white" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveCall;
