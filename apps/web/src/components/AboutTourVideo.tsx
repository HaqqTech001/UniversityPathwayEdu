import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Building,
  Sparkles,
  Info,
  RotateCcw,
  X,
} from 'lucide-react';

interface AboutTourVideoProps {
  className?: string;
  posterUrl?: string;
  videoUrl?: string;
}

export default function AboutTourVideo({
  className = '',
  posterUrl = '/images/centre_building.svg',
  videoUrl = '/videos/centre_tour.mp4',
}: AboutTourVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasVideoError, setHasVideoError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Viewport IntersectionObserver to handle auto-play/pause when in view
  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasVideoError) {
            // Autoplay muted when entering viewport
            video.muted = true;
            video
              .play()
              .then(() => setIsPlaying(true))
              .catch(() => {
                // Autoplay blocked by browser policy, keep paused
                setIsPlaying(false);
              });
          } else {
            // Pause when leaving viewport
            video.pause();
            setIsPlaying(false);
          }
        });
      },
      {
        threshold: 0.5,
      }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [hasVideoError]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setHasVideoError(true));
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
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

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen?.();
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200/90 aspect-[4/3] bg-slate-900 group select-none ${className}`}
    >
      {/* HTML5 Video element */}
      <video
        ref={videoRef}
        src={videoUrl}
        poster={posterUrl}
        playsInline
        muted={isMuted}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onError={() => setHasVideoError(true)}
        className="w-full h-full object-cover"
      />

      {/* When video file is pending upload or encountered error: render high-fidelity institutional preview */}
      {hasVideoError && (
        <div className="absolute inset-0 bg-[#08163b]/70 backdrop-blur-xs flex flex-col justify-between p-6 sm:p-8 text-white">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-white/10 text-[#f0bb5b] text-[10px] font-extrabold uppercase tracking-widest border border-white/15">
              CENTRE TOUR PREVIEW
            </span>
            <span className="text-[11px] text-slate-300 font-semibold flex items-center gap-1.5">
              <Building size={14} className="text-[#f0bb5b]" />
              Sawmill Main Campus
            </span>
          </div>

          <div className="text-center py-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              aria-label="Play centre tour preview"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#c62839] hover:bg-[#b01f30] text-white flex items-center justify-center mx-auto shadow-2xl shadow-[#c62839]/40 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Play size={28} fill="white" className="ml-1" />
            </button>
            <h3 className="font-serif text-lg sm:text-xl font-bold mt-4">
              Take a Quick Tour of Our Centre
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
              Explore our lecture halls, digital CBT laboratories, and counseling consultation rooms in Ilorin.
            </p>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-white/10 pt-3">
            <span>23 Olaiya Street, Sawmill Garage, Ilorin</span>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="text-[#f0bb5b] font-bold hover:underline"
            >
              View Tour Details →
            </button>
          </div>
        </div>
      )}

      {/* Floating Mockup Play Button Overlay (when video is operational but paused) */}
      {!hasVideoError && !isPlaying && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
          <button
            type="button"
            onClick={togglePlay}
            aria-label="Play tour video"
            className="w-16 h-16 rounded-full bg-[#c62839] text-white flex items-center justify-center shadow-2xl pointer-events-auto transition-transform hover:scale-110 cursor-pointer"
          >
            <Play size={24} fill="white" className="ml-0.5" />
          </button>
        </div>
      )}

      {/* Floating Badge (Matching approved mockup: "Take a quick tour of our centre") */}
      {!hasVideoError && (
        <div className="absolute bottom-5 left-5 z-20 bg-white/95 backdrop-blur-md rounded-full pl-2 pr-5 py-2 flex items-center gap-3 shadow-lg text-[#0b1a42]">
          <span className="w-9 h-9 rounded-full bg-[#c62839] text-white flex items-center justify-center shadow-sm">
            <Play size={15} fill="white" className="ml-0.5" />
          </span>
          <span className="text-xs font-extrabold">Take a quick tour of our centre</span>
        </div>
      )}

      {/* Bottom Video Controls Overlay (shown when hover or active) */}
      {!hasVideoError && (
        <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center gap-3 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity z-30">
          <button
            type="button"
            onClick={togglePlay}
            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>

          <button
            type="button"
            onClick={toggleMute}
            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          {/* Seek bar */}
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-[#c62839]"
          />

          <button
            type="button"
            onClick={handleFullscreen}
            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
            title="Fullscreen"
          >
            <Maximize2 size={15} />
          </button>
        </div>
      )}

      {/* Tour Detail Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full text-[#0b1a42] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building size={20} className="text-[#c62839]" />
                <h3 className="font-serif text-lg font-bold">
                  University Pathway Centre Facilities
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Our campus at <strong>23 Olaiya Street, Sawmill Garage, Ilorin</strong> features:
            </p>

            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c62839] mt-1.5 shrink-0" />
                <span>Modern, air-conditioned lecture theatres equipped with multimedia boards.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c62839] mt-1.5 shrink-0" />
                <span>Dedicated 100-terminal CBT examination lab running identical JAMB test software.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c62839] mt-1.5 shrink-0" />
                <span>Quiet student study library with prescribed curriculum textbooks &amp; past question archives.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c62839] mt-1.5 shrink-0" />
                <span>One-on-one academic counseling and career guidance suites.</span>
              </li>
            </ul>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-[#0b1a42] text-white font-bold text-xs hover:bg-[#152e69] cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
