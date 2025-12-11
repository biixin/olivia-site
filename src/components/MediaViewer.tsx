import React, { useState, useRef, useEffect } from 'react';
import { X, Volume2, VolumeX, Play, Pause, Maximize, Minimize } from 'lucide-react';

interface MediaItem {
  id: number;
  type: 'image' | 'video';
  thumbnail: string;
  fullUrl: string;
  likes: number;
  comments: number;
  duration?: string;
}

interface MediaViewerProps {
  media: MediaItem;
  onClose: () => void;
}

const MediaViewer: React.FC<MediaViewerProps> = ({ media, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    // Listener para mudanças de fullscreen
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // Auto-play video when opened
    if (media.type === 'video' && videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
      // Esconder controles após 3 segundos
      hideControlsAfterDelay();
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.body.style.overflow = 'unset';
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
    };
  }, [onClose, media.type, controlsTimeout]);

  const hideControlsAfterDelay = () => {
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    const timeout = setTimeout(() => {
      setShowControls(false);
    }, 3000);
    setControlsTimeout(timeout);
  };

  const showControlsTemporarily = () => {
    setShowControls(true);
    hideControlsAfterDelay();
  };
  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.log('Fullscreen not supported or failed');
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
        hideControlsAfterDelay();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const newTime = (clickX / rect.width) * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      showControlsTemporarily();
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      ref={containerRef}
      className={`fixed inset-0 bg-black z-50 flex items-center justify-center ${
        isFullscreen ? 'bg-black' : 'bg-black/95 backdrop-blur-sm'
      }`}
    >
      {/* Close button */}
      <div className={`absolute top-6 right-6 z-60 transition-opacity duration-300 ${showControls && !isFullscreen ? 'opacity-100' : 'opacity-0'}`}>
        <button
          onClick={onClose}
          className="bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 hover:scale-110"
        >
          <X size={24} />
        </button>
      </div>

      {/* Media container */}
      <div 
        className={`relative w-full ${
          isFullscreen ? 'h-full' : 'max-w-4xl max-h-[90vh] mx-4'
        }`}
        onClick={media.type === 'video' ? (isFullscreen ? showControlsTemporarily : toggleFullscreen) : undefined}
      >
        {media.type === 'image' ? (
          <img
            src={media.fullUrl}
            alt=""
            className={`w-full h-full object-contain ${
              isFullscreen ? '' : 'rounded-2xl'
            }`}
            style={{ pointerEvents: 'none' }}
          />
        ) : (
          <div className="relative">
            <video
              ref={videoRef}
              src={media.fullUrl}
              className={`w-full h-full object-contain ${
                isFullscreen ? '' : 'rounded-2xl'
              }`}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />

            {/* Video controls overlay */}
            <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 transition-opacity duration-300 ${
              isFullscreen ? '' : 'rounded-b-2xl'
            } ${showControls ? 'opacity-100' : 'opacity-0'}`}>
              {/* Progress bar */}
              <div 
                className="w-full h-2 bg-gray-600 rounded-full mb-4 cursor-pointer"
                onClick={handleSeek}
              >
                <div 
                  className="h-full bg-orange-500 rounded-full transition-all duration-200"
                  style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                ></div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={togglePlay}
                    className="bg-orange-500 hover:bg-orange-600 p-3 rounded-full transition-all duration-200 hover:scale-110"
                  >
                    {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
                  </button>
                  
                  <button
                    onClick={toggleMute}
                    className="hover:text-orange-500 transition-colors duration-200"
                  >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                  
                  <span className="text-sm">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>
                
                <div className="flex items-center space-x-4">
                  <button
                    onClick={toggleFullscreen}
                    className="hover:text-orange-500 transition-colors duration-200"
                  >
                    {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Play button overlay (when paused) */}
            {!isPlaying && showControls && (
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={togglePlay}
                  className="bg-orange-500/90 hover:bg-orange-500 p-6 rounded-full transition-all duration-200 hover:scale-110"
                >
                  <Play size={32} className="text-white ml-1" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaViewer;