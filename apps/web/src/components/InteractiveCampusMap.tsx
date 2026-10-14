import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  ExternalLink,
  Copy,
  Check,
  Layers,
  Compass,
  Phone,
  Bus,
  Car,
  ShieldCheck,
  Building,
  Maximize2,
  RotateCcw,
} from 'lucide-react';

interface InteractiveCampusMapProps {
  className?: string;
}

export default function InteractiveCampusMap({ className = '' }: InteractiveCampusMapProps) {
  const [activeView, setActiveView] = useState<'street' | 'schematic'>('street');
  const [isCopied, setIsCopied] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  const address = '23, Olaiya Street, Sawmill Garage, Ilorin, Kwara State, Nigeria';
  const googleMapsUrl = 'https://www.google.com/maps/search/?api=1&query=23+Olaiya+Street,+Sawmill+Garage,+Ilorin,+Kwara+State,+Nigeria';
  const directionsUrl = 'https://www.google.com/maps/dir/?api=1&destination=23+Olaiya+Street+Sawmill+Garage+Ilorin+Kwara+State+Nigeria';
  const appleMapsUrl = 'https://maps.apple.com/?q=23+Olaiya+Street+Sawmill+Garage+Ilorin+Nigeria';

  // OpenStreetMap embed coordinates for Sawmill Garage / Olaiya Street, Ilorin
  // Centered around Latitude 8.4750, Longitude 4.5480
  const osmEmbedUrl =
    'https://www.openstreetmap.org/export/embed.html?bbox=4.5320%2C8.4620%2C4.5640%2C8.4880&layer=mapnik&marker=8.4750%2C4.5480';

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(address);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Top Controls Bar: View Switcher and External Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeView === 'street'}
            onClick={() => setActiveView('street')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeView === 'street'
                ? 'bg-white text-[#0b1a42] shadow-xs'
                : 'text-slate-600 hover:text-[#0b1a42]'
            }`}
          >
            <Layers size={14} className={activeView === 'street' ? 'text-[#c62839]' : ''} />
            <span>Street Navigation Map</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeView === 'schematic'}
            onClick={() => setActiveView('schematic')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeView === 'schematic'
                ? 'bg-white text-[#0b1a42] shadow-xs'
                : 'text-slate-600 hover:text-[#0b1a42]'
            }`}
          >
            <Compass size={14} className={activeView === 'schematic' ? 'text-[#c62839]' : ''} />
            <span>Campus Schematic &amp; Route</span>
          </button>
        </div>

        {/* Quick External Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-[#0b1a42] text-xs font-semibold transition-colors cursor-pointer"
          >
            {isCopied ? (
              <>
                <Check size={13} className="text-emerald-600" />
                <span className="text-emerald-700 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={13} className="text-slate-500" />
                <span>Copy Address</span>
              </>
            )}
          </button>

          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#c62839] hover:bg-[#b01f30] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Navigation size={13} />
            <span>Get Directions</span>
            <ExternalLink size={11} className="opacity-75" />
          </a>
        </div>
      </div>

      {/* Main Map Frame */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-xl bg-slate-100 h-[440px] sm:h-[500px] lg:h-[540px]">
        {/* VIEW 1: Live Interactive OpenStreetMap View */}
        {activeView === 'street' && (
          <div className="w-full h-full relative">
            {!iframeError ? (
              <iframe
                title="University Pathway Center Map — 23 Olaiya Street, Sawmill Garage, Ilorin"
                src={osmEmbedUrl}
                className="w-full h-full border-0"
                loading="eager"
                onError={() => setIframeError(true)}
              />
            ) : (
              /* Fallback if network blocks iframe */
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-50">
                <MapPin size={48} className="text-[#c62839] mb-3 animate-bounce" />
                <h3 className="font-serif text-lg font-bold text-[#0b1a42]">
                  University Pathway Educational Consult
                </h3>
                <p className="text-xs text-slate-600 mt-1 max-w-md">
                  23, Olaiya Street, Sawmill Garage, Ilorin, Kwara State, Nigeria.
                </p>
                <div className="mt-4 flex gap-3">
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-[#c62839] text-white text-xs font-bold shadow-md inline-flex items-center gap-1.5"
                  >
                    <Navigation size={13} /> Open Google Maps
                  </a>
                  <button
                    type="button"
                    onClick={() => setIframeError(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100"
                  >
                    <RotateCcw size={13} className="inline mr-1" /> Retry
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: Visual Campus Schematic & Walking Guide */}
        {activeView === 'schematic' && (
          <div className="w-full h-full bg-[#08163b] text-white p-6 sm:p-8 flex flex-col justify-between overflow-y-auto relative">
            {/* Background Map Grid Pattern */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                backgroundSize: '24px 24px',
              }}
            />

            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/10">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#f0bb5b]">
                    CENTER SCHEMATIC &amp; ACCESS PLAN
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl font-black text-white mt-0.5">
                    23, Olaiya Street Campus Guide
                  </h3>
                </div>
                <span className="px-3 py-1 rounded-full bg-white/10 text-slate-200 text-xs font-semibold self-start sm:self-auto border border-white/15">
                  Sawmill Garage Axis, Ilorin
                </span>
              </div>

              {/* Schematic Diagram */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Visual schematic diagram */}
                <div className="md:col-span-7 bg-white/5 backdrop-blur-md rounded-2xl border border-white/15 p-5 relative overflow-hidden">
                  <div className="space-y-4">
                    {/* Transit Point: Sawmill Garage */}
                    <div className="p-3.5 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#f0bb5b] text-[#08163b] flex items-center justify-center shrink-0 font-black">
                        <Bus size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-[#f0bb5b]">
                          Sawmill Garage Major Terminal (Transit Hub)
                        </h4>
                        <p className="text-[11px] text-slate-300 mt-0.5">
                          Tricycles, cabs, and inter-city shuttles disembark here.
                        </p>
                      </div>
                    </div>

                    {/* Dotted Walking Path */}
                    <div className="flex items-center gap-3 pl-4 py-1 text-slate-400 text-xs font-mono">
                      <div className="w-0.5 h-7 border-l-2 border-dashed border-[#f0bb5b]/60 ml-3" />
                      <span className="text-[11px] text-[#f0bb5b] italic">
                        ↓ 150m walking path (2 minutes into Olaiya Street)
                      </span>
                    </div>

                    {/* Target Destination: University Pathway */}
                    <div className="p-4 rounded-xl bg-[#c62839]/30 border-2 border-[#c62839] flex items-start gap-3.5 shadow-lg shadow-[#c62839]/20">
                      <div className="w-10 h-10 rounded-xl bg-[#c62839] text-white flex items-center justify-center shrink-0 shadow-md">
                        <Building size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-white">
                            23, Olaiya Street — University Pathway Center
                          </h4>
                          <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-[#f0bb5b] text-[#08163b]">
                            DESTINATION
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-200 mt-1 leading-relaxed">
                          Two-storey institutional facility housing our lecture theaters, CBT computer suites, consultation rooms, and administrative desks.
                        </p>
                      </div>
                    </div>

                    {/* Key Facilities Inside Campus */}
                    <div className="grid grid-cols-2 gap-2.5 pt-2 text-[11px]">
                      <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span>Reception &amp; Admissions</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span>UTME Digital CBT Labs</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span>A'Level &amp; O'Level Theaters</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span>Secure Visitor Parking</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Guide notes */}
                <div className="md:col-span-5 space-y-4">
                  <div className="bg-white/5 rounded-2xl border border-white/10 p-5">
                    <h4 className="font-bold text-xs text-[#f0bb5b] uppercase tracking-wider mb-2">
                      Arrival Tips for Visitors:
                    </h4>
                    <ul className="space-y-2.5 text-xs text-slate-300">
                      <li className="flex items-start gap-2">
                        <span className="text-[#f0bb5b] font-bold">•</span>
                        <span>
                          Ask any local bike or tricycle rider for <strong>"Sawmill Garage, Olaiya Street junction"</strong>.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#f0bb5b] font-bold">•</span>
                        <span>
                          Prominent red &amp; navy University Pathway outdoor signage is visible from the street corner.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#f0bb5b] font-bold">•</span>
                        <span>
                          Biometric clearance and registration desks operate on the ground floor.
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 rounded-xl bg-[#c62839] hover:bg-[#b01f30] text-center text-xs font-bold text-white transition-colors"
                    >
                      Turn-by-Turn GPS
                    </a>
                    <button
                      type="button"
                      onClick={() => setActiveView('street')}
                      className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors"
                    >
                      Switch to Map
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Floating Identity & Info Overlay Card (Shown across both views, responsive) */}
        <div className="absolute top-3 left-3 right-3 sm:right-auto z-20 max-w-full sm:max-w-sm bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-2xl border border-slate-200/90 pointer-events-auto">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#08163b] text-[#f0bb5b] flex items-center justify-center shrink-0 shadow-md">
              <MapPin size={22} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Center Open
                </span>
                <span className="text-[10px] text-slate-500 font-medium">8 AM – 6 PM</span>
              </div>
              <h4 className="font-serif text-sm font-bold text-[#0b1a42] leading-snug">
                University Pathway Educational Consult
              </h4>
              <p className="text-[11px] text-slate-600 mt-1 leading-normal">
                23, Olaiya Street, Sawmill Garage, Ilorin, Kwara State
              </p>
            </div>
          </div>

          <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <a
              href="tel:09133903600"
              className="font-bold text-[#c62839] hover:underline flex items-center gap-1"
            >
              <Phone size={11} />
              09133903600
            </a>
            <div className="flex items-center gap-2">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 hover:text-[#0b1a42] font-semibold inline-flex items-center gap-1"
                title="Open in Google Maps"
              >
                <span>Google Maps</span>
                <ExternalLink size={10} />
              </a>
              <span className="text-slate-300">•</span>
              <a
                href={appleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 hover:text-[#0b1a42] font-semibold inline-flex items-center gap-1"
                title="Open in Apple Maps"
              >
                <span>Apple Maps</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Transit & Commute Highlights Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-50 text-[#c62839] flex items-center justify-center shrink-0">
            <Bus size={18} />
          </div>
          <div>
            <h5 className="text-xs font-bold text-[#0b1a42]">From Sawmill Garage</h5>
            <p className="text-[11px] text-slate-600 mt-0.5">2-minute walk (150m) straight into Olaiya Street.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0b1a42] flex items-center justify-center shrink-0">
            <Car size={18} />
          </div>
          <div>
            <h5 className="text-xs font-bold text-[#0b1a42]">From Post Office / Challenge</h5>
            <p className="text-[11px] text-slate-600 mt-0.5">8–10 minutes via commercial tricycle or cab.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#d5a75b] flex items-center justify-center shrink-0">
            <Compass size={18} />
          </div>
          <div>
            <h5 className="text-xs font-bold text-[#0b1a42]">From University of Ilorin</h5>
            <p className="text-[11px] text-slate-600 mt-0.5">Connect through Tanke / Tipper Garage to Sawmill.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <ShieldCheck size={18} />
          </div>
          <div>
            <h5 className="text-xs font-bold text-[#0b1a42]">Secure Visitor Parking</h5>
            <p className="text-[11px] text-slate-600 mt-0.5">Safe drop-off area and perimeter security on site.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
