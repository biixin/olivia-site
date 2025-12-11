import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Heart, MessageCircle, Share, Play, CheckCircle, MoreHorizontal } from 'lucide-react';
import MediaViewer from './MediaViewer';

interface MediaItem {
  id: number;
  type: 'video' | 'video';
  fullUrl: string;
  thumbnail: string;
  likes: number;
  comments: number;
  duration?: string;
  caption: string;
  timestamp: string;
  profileName: string;
  profileHandle: string;
  profileImage: string;
}

const Feed: React.FC = () => {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [allPosts, setAllPosts] = useState<MediaItem[]>([]);
  const [visiblePosts, setVisiblePosts] = useState<MediaItem[]>([]);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [playingVideos, setPlayingVideos] = useState<Set<number>>(new Set());
  const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map());
  const postRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);

  const initialPosts: MediaItem[] = [
    {
      id: 1,
      type: 'video',
      fullUrl: 'https://media-wordpress.kjufc9.easypanel.host/wp-content/uploads/2025/12/mae-01.mp4',
      thumbnail: 'https://media-wordpress.kjufc9.easypanel.host/wp-content/uploads/2025/12/mae-01-thumbnail.webp',
      likes: 245,
      comments: 18,
      profileName: "Andressa",
      profileHandle: "@Andressa",
      profileImage: "https://media-wordpress.kjufc9.easypanel.host/wp-content/uploads/2025/12/UhTvXQrP_400x400.jpg"
    },
    {
      id: 2,
      type: 'video',
      fullUrl: 'https://media-wordpress.kjufc9.easypanel.host/wp-content/uploads/2025/12/mae-02.mp4',
      thumbnail: 'https://media-wordpress.kjufc9.easypanel.host/wp-content/uploads/2025/12/mae-02-thumbnail.webp',
      likes: 432,
      comments: 67,
      caption: "Me masturbando gostoso pra vc 😈",
      profileName: "Andressa",
      profileHandle: "@",
      profileImage: "https://media-wordpress.kjufc9.easypanel.host/wp-content/uploads/2025/12/UhTvXQrP_400x400.jpg"
    },
    {
      id: 3,
      type: 'video',
      fullUrl: 'https://media-wordpress.kjufc9.easypanel.host/wp-content/uploads/2025/12/mae-03.mp4',
      thumbnail: 'https://media-wordpress.kjufc9.easypanel.host/wp-content/uploads/2025/12/mae-03-thumbnail.webp',
      likes: 189,
      comments: 23,
      caption: "Bomm dia meus amores... 😘",
      profileName: "Andressa",
      profileHandle: "@Andressa",
      profileImage: "https://media-wordpress.kjufc9.easypanel.host/wp-content/uploads/2025/12/UhTvXQrP_400x400.jpg"
    },
    {
      id: 5,
      type: 'video',
      fullUrl: 'https://media-wordpress.kjufc9.easypanel.host/wp-content/uploads/2025/12/mae-04.mp4',
      thumbnail: 'https://media-wordpress.kjufc9.easypanel.host/wp-content/uploads/2025/12/mae-04-thumbnail.webp',
      likes: 432,
      comments: 67,
      caption: "Me masturbando gostoso pra vc 😈",
      profileName: "Andressa",
      profileHandle: "@Andressa",
      profileImage: "http://dl.dropboxusercontent.com/s/a11ge0yuheuafxt2p71qm/f3.webp?rlkey=d6nxoyrurv1bot8rw8m5r8z8i&st=kuir2m3j&dl=0"
    },
    {
      id: 6,
      type: 'video',
      fullUrl: 'https://media-wordpress.kjufc9.easypanel.host/wp-content/uploads/2025/12/mae-05.mp4',
      thumbnail: 'https://media-wordpress.kjufc9.easypanel.host/wp-content/uploads/2025/12/mae-05-thumbnail.webp',
      likes: 189,
      comments: 23,
      caption: "Solzinho gostoso... 😘",
      profileName: "Andressa",
      profileHandle: "@Andressa",
      profileImage: "http://dl.dropboxusercontent.com/s/a11ge0yuheuafxt2p71qm/f3.webp?rlkey=d6nxoyrurv1bot8rw8m5r8z8i&st=kuir2m3j&dl=0"      
    },
    {
      id: 4,
      type: 'video',
      fullUrl: 'https://media-wordpress.kjufc9.easypanel.host/wp-content/uploads/2025/12/mae-06.mp4',
      thumbnail: 'https://media-wordpress.kjufc9.easypanel.host/wp-content/uploads/2025/12/mae-06-thumbnail.webp',
      likes: 567,
      comments: 89,
      caption: " ",
      profileName: "Andressa",
      profileHandle: "@Andressa",
      profileImage: "https://media-wordpress.kjufc9.easypanel.host/wp-content/uploads/2025/12/UhTvXQrP_400x400.jpg"
    },
    {
      id: 7,
      type: 'video',
      fullUrl: 'https://media-wordpress.kjufc9.easypanel.host/wp-content/uploads/2025/12/mae-07.mp4',
      thumbnail: 'https://media-wordpress.kjufc9.easypanel.host/wp-content/uploads/2025/12/mae-07-thumbnail.webp',
      likes: 567,
      comments: 89,
      caption: "",
      profileName: "Andressa",
      profileHandle: "@Andressa",
      profileImage: "https://media-wordpress.kjufc9.easypanel.host/wp-content/uploads/2025/12/UhTvXQrP_400x400.jpg"
    },
    {
      id: 8,
      type: 'video',
      fullUrl: 'https://media-wordpress.kjufc9.easypanel.host/wp-content/uploads/2025/12/mae-08.mp4',
      thumbnail: 'https://media-wordpress.kjufc9.easypanel.host/wp-content/uploads/2025/12/mae-08-thumbnail.webp',
      likes: 567,
      comments: 89,
      caption: "",
      profileName: "Andressa",
      profileHandle: "@Andressa",
      profileImage: "https://media-wordpress.kjufc9.easypanel.host/wp-content/uploads/2025/12/UhTvXQrP_400x400.jpg"
    },
    {
      id: 9,
      type: 'video',
      fullUrl: 'https://media-wordpress.kjufc9.easypanel.host/wp-content/uploads/2025/12/mae-09.mp4',
      thumbnail: 'https://media-wordpress.kjufc9.easypanel.host/wp-content/uploads/2025/12/mae-09-thumbnail.webp',
      likes: 567,
      comments: 89,
      caption: "",
      profileName: "Andressa",
      profileHandle: "@Andressa",
      profileImage: "https://media-wordpress.kjufc9.easypanel.host/wp-content/uploads/2025/12/UhTvXQrP_400x400.jpg"
    },
    {
      id: 10,
      type: 'video',
      fullUrl: 'https://media-wordpress.kjufc9.easypanel.host/wp-content/uploads/2025/12/mae-10.mp4',
      thumbnail: 'https://media-wordpress.kjufc9.easypanel.host/wp-content/uploads/2025/12/mae-10-thumbnail.webp',
      likes: 567,
      comments: 89,
      caption: " ",
      profileName: "Andressa",
      profileHandle: "@Andressa",
      profileImage: "https://media-wordpress.kjufc9.easypanel.host/wp-content/uploads/2025/12/UhTvXQrP_400x400.jpg"
    },
    {
      id: 11,
      type: 'video',
      fullUrl: 'https://media-wordpress.kjufc9.easypanel.host/wp-content/uploads/2025/12/mae-11.mp4',
      thumbnail: 'https://media-wordpress.kjufc9.easypanel.host/wp-content/uploads/2025/12/mae-11-thumbnail.webp',
      likes: 567,
      comments: 89,
      caption: " ",
      profileName: "Andressa",
      profileHandle: "@Andressa",
      profileImage: "https://media-wordpress.kjufc9.easypanel.host/wp-content/uploads/2025/12/UhTvXQrP_400x400.jpg"
    },
    {
      id: 12,
      type: 'video',
      fullUrl: 'https://media-wordpress.kjufc9.easypanel.host/wp-content/uploads/2025/12/mae-12.mp4',
      thumbnail: 'https://media-wordpress.kjufc9.easypanel.host/wp-content/uploads/2025/12/mae-12-thumbnail.webp',
      likes: 567,
      comments: 89,
      caption: " ",
      profileName: "Andressa",
      profileHandle: "@Andressa",
      profileImage: "https://media-wordpress.kjufc9.easypanel.host/wp-content/uploads/2025/12/UhTvXQrP_400x400.jpg"
    },
    {
      id: 13,
      type: 'video',
      fullUrl: 'https://media-wordpress.kjufc9.easypanel.host/wp-content/uploads/2025/12/mae-13.mp4',
      thumbnail: 'https://media-wordpress.kjufc9.easypanel.host/wp-content/uploads/2025/12/mae-13-thumbnail.webp',
      likes: 567,
      comments: 89,
      caption: " ",
      profileName: "Andressa",
      profileHandle: "@Andressa",
      profileImage: "https://media-wordpress.kjufc9.easypanel.host/wp-content/uploads/2025/12/UhTvXQrP_400x400.jpg"
    },
    {
      id: 14,
      type: 'video',
      fullUrl: 'https://media-wordpress.kjufc9.easypanel.host/wp-content/uploads/2025/12/mae-14.mp4',
      thumbnail: 'https://media-wordpress.kjufc9.easypanel.host/wp-content/uploads/2025/12/mae-14-thumbnail.webp',
      likes: 567,
      comments: 89,
      caption: " ",
      profileName: "Andressa",
      profileHandle: "@Andressa",
      profileImage: "https://media-wordpress.kjufc9.easypanel.host/wp-content/uploads/2025/12/UhTvXQrP_400x400.jpg"
    },
    {
      id: 15,
      type: 'video',
      fullUrl: 'https://media-wordpress.kjufc9.easypanel.host/wp-content/uploads/2025/12/mae-15.mp4',
      thumbnail: 'https://media-wordpress.kjufc9.easypanel.host/wp-content/uploads/2025/12/mae-15-thumbnail.webp',
      likes: 567,
      comments: 89,
      caption: " ",
      profileName: "Andressa",
      profileHandle: "@Andressa",
      profileImage: "https://media-wordpress.kjufc9.easypanel.host/wp-content/uploads/2025/12/UhTvXQrP_400x400.jpg"
    },
    {
      id: 16,
      type: 'video',
      fullUrl: 'https://media-wordpress.kjufc9.easypanel.host/wp-content/uploads/2025/12/mae-16.mp4',
      thumbnail: 'https://media-wordpress.kjufc9.easypanel.host/wp-content/uploads/2025/12/mae-16-thumbnail.webp',
      likes: 567,
      comments: 89,
      caption: " ",
      profileName: "Andressa",
      profileHandle: "@Andressa",
      profileImage: "https://media-wordpress.kjufc9.easypanel.host/wp-content/uploads/2025/12/UhTvXQrP_400x400.jpg"
    },
    {
      id: 17,
      type: 'video',
      fullUrl: 'https://media-wordpress.kjufc9.easypanel.host/wp-content/uploads/2025/12/mae-17.mp4',
      thumbnail: 'https://media-wordpress.kjufc9.easypanel.host/wp-content/uploads/2025/12/mae-17-thumbnail.webp',
      likes: 567,
      comments: 89,
      caption: " ",
      profileName: "Andressa",
      profileHandle: "@Andressa",
      profileImage: "https://media-wordpress.kjufc9.easypanel.host/wp-content/uploads/2025/12/UhTvXQrP_400x400.jpg"
    },
    {
      id: 18,
      type: 'video',
      fullUrl: 'https://media-wordpress.kjufc9.easypanel.host/wp-content/uploads/2025/12/mae-18.mp4',
      thumbnail: 'https://media-wordpress.kjufc9.easypanel.host/wp-content/uploads/2025/12/mae-18-thumbnail.webp',
      likes: 567,
      comments: 89,
      caption: " ",
      profileName: "Andressa",
      profileHandle: "@Andressa",
      profileImage: "https://media-wordpress.kjufc9.easypanel.host/wp-content/uploads/2025/12/UhTvXQrP_400x400.jpg"
    },
  ];

  useEffect(() => {
    setAllPosts(initialPosts);
    // Carregar apenas o primeiro post inicialmente para melhor performance
    setVisiblePosts(initialPosts.slice(0, 1));
  }, []);

  // Intersection Observer para lazy loading de posts
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            const postId = parseInt(entry.target.getAttribute('data-post-id') || '0');
            const currentIndex = allPosts.findIndex(post => post.id === postId);
            
            if (currentIndex !== -1) {
              // Carregar mais posts quando o usuário visualizar 50% do post atual
              const nextPostsToLoad = allPosts.slice(0, currentIndex + 2);
              setVisiblePosts(prevVisible => {
                const visibleIds = new Set(prevVisible.map(p => p.id));
                const newPosts = nextPostsToLoad.filter(post => !visibleIds.has(post.id));
                return [...prevVisible, ...newPosts];
              });
            }
          }
        });
      },
      {
        threshold: 0.3, // 30% do post deve estar visível
        rootMargin: '50px' // Começar a carregar 50px antes
      }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [allPosts]);

  // Observer para posts visíveis
  useEffect(() => {
    if (observerRef.current) {
      visiblePosts.forEach(post => {
        const postElement = postRefs.current.get(post.id);
        if (postElement) {
          observerRef.current!.observe(postElement);
        }
      });
    }

    return () => {
      if (observerRef.current) {
        visiblePosts.forEach(post => {
          const postElement = postRefs.current.get(post.id);
          if (postElement) {
            observerRef.current!.unobserve(postElement);
          }
        });
      }
    };
  }, [visiblePosts]);

  // Intersection Observer para autoplay de vídeos
  useEffect(() => {
    const videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const videoId = parseInt(entry.target.getAttribute('data-video-id') || '0');
          const video = videoRefs.current.get(videoId);
          
          if (video) {
            if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
              // Vídeo está visível, iniciar reprodução
              video.play().catch(() => {
                // Falha no autoplay (política do navegador)
              });
              setPlayingVideos(prev => new Set(prev).add(videoId));
            } else {
              // Vídeo não está visível, pausar
              video.pause();
              setPlayingVideos(prev => {
                const newSet = new Set(prev);
                newSet.delete(videoId);
                return newSet;
              });
            }
          }
        });
      },
      {
        threshold: 0.5, // 50% do vídeo deve estar visível
        rootMargin: '0px'
      }
    );

    // Observar todos os vídeos
    visiblePosts.forEach(post => {
      if (post.type === 'video') {
        const videoElement = document.querySelector(`[data-video-id="${post.id}"]`);
        if (videoElement) {
          videoObserver.observe(videoElement);
        }
      }
    });

    return () => {
      videoObserver.disconnect();
    };
  }, [visiblePosts]);

  const handleMediaClick = (media: MediaItem) => {
    setSelectedMedia(media);
  };

  const handleVideoRef = (postId: number, element: HTMLVideoElement | null) => {
    if (element) {
      videoRefs.current.set(postId, element);
    } else {
      videoRefs.current.delete(postId);
    }
  };

  const handlePostRef = (postId: number, element: HTMLDivElement | null) => {
    if (element) {
      postRefs.current.set(postId, element);
    } else {
      postRefs.current.delete(postId);
    }
  };

  const toggleVideoPlay = (postId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRefs.current.get(postId);
    if (video) {
      if (playingVideos.has(postId)) {
        video.pause();
        setPlayingVideos(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
      } else {
        video.play();
        setPlayingVideos(prev => new Set(prev).add(postId));
      }
    }
  };

  return (
    <>
      <div className="pb-20 pt-6 relative">
        {/* Header */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-orange-500/10 blur-xl"></div>
          <div className="max-w-2xl mx-auto px-4">
<h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 via-orange-300 to-white bg-clip-text text-transparent mb-2 text-center relative">
  Privacy
            </h1>
            <p className="text-gray-400 text-center mb-6">Conteúdo safado liberado só pra você 🔞</p>
            <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-orange-600 mx-auto rounded-full"></div>
          </div>
        </div>
        
        <div className="max-w-2xl mx-auto px-4">
          <div className="space-y-6">
            {visiblePosts.map((post) => (
              <div 
                key={post.id} 
                ref={(el) => handlePostRef(post.id, el)}
                data-post-id={post.id}
                className="bg-gray-900/50 backdrop-blur-sm rounded-3xl border border-gray-800/50 overflow-hidden"
              >
                {/* Post Header */}
                <div className="flex items-center justify-between p-5">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img
                        src={post.profileImage}
                        alt=""
                        className="w-12 h-12 rounded-full object-cover border-2 border-orange-500/50"
                      />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-white font-semibold">{post.profileName}</h3>
                        <CheckCircle size={16} className="text-orange-500 fill-current" />
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <span>{post.profileHandle}</span>
                        <span>•</span>
                        <span>{post.timestamp}</span>
                      </div>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-white transition-colors">
                    <MoreHorizontal size={20} />
                  </button>
                </div>

                {/* Post Content */}
                {post.type === 'video' ? (
                  <div 
                    className="relative aspect-square cursor-pointer group"
                    onClick={() => handleMediaClick(post)}
                  >
                    <video
                      ref={(el) => handleVideoRef(post.id, el)}
                      data-video-id={post.id}
                      src={post.fullUrl}
                      poster={post.thumbnail || undefined}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      muted
                      loop
                      playsInline
                      preload="metadata"
                    />
                    
                    {/* Play overlay - apenas visual */}
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <div className="bg-orange-500/90 rounded-full p-4">
                        <Play size={24} className="text-white ml-1" />
                      </div>
                    </div>
                    
                    <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm text-white text-sm px-2 py-1 rounded-lg">
                      {post.duration}
                    </div>
                    
                    {/* Small play/pause button for inline control */}
                    <button
                      onClick={(e) => toggleVideoPlay(post.id, e)}
                      className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/90 transition-all duration-200 z-10"
                    >
                      {playingVideos.has(post.id) ? (
                        <div className="w-4 h-4 flex items-center justify-center">
                          <div className="w-0.5 h-3 bg-white mr-0.5"></div>
                          <div className="w-0.5 h-3 bg-white"></div>
                        </div>
                      ) : (
                        <Play size={16} className="text-white ml-0.5" />
                      )}
                    </button>
                  </div>
                ) : (
                  <div 
                    className="relative aspect-square cursor-pointer group"
                    onClick={() => handleMediaClick(post)}
                  >
                    {!loadedImages.has(post.id) && (
                      <div className="absolute inset-0 bg-gray-800 animate-pulse rounded-lg flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                    <img
                      src={post.thumbnail}
                      alt=""
                      className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-[1.02] ${
                        loadedImages.has(post.id) ? 'opacity-100' : 'opacity-0'
                      }`}
                      loading="lazy"
                      onLoad={() => setLoadedImages(prev => new Set(prev).add(post.id))}
                      onError={() => setLoadedImages(prev => new Set(prev).add(post.id))}
                    />
                  </div>
                )}

                {/* Post Actions */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-0">
                    <div className="flex items-center space-x-6">
                      <button className="flex items-center space-x-2 text-gray-300 hover:text-red-500 transition-colors group">
                        <Heart size={24} className="group-hover:scale-110 transition-transform" />
                        <span className="font-medium">{post.likes}</span>
                      </button>
                      <button className="flex items-center space-x-2 text-gray-300 hover:text-blue-400 transition-colors group">
                        <MessageCircle size={24} className="group-hover:scale-110 transition-transform" />
                        <span className="font-medium">{post.comments}</span>
                      </button>
                      <button className="text-gray-300 hover:text-orange-500 transition-colors group">
                        <Share size={24} className="group-hover:scale-110 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
      
      {selectedMedia && (
        <MediaViewer 
          media={selectedMedia} 
          onClose={() => setSelectedMedia(null)} 
        />
      )}
    </>
  );
};

export default Feed;
