import React, { memo } from 'react';
import { Sparkles, MessageSquare, Layers } from 'lucide-react';
import { PersonaProfile } from '../types';

interface HeaderProps {
  activeTab: 'creator' | 'library' | 'chat';
  setActiveTab: (tab: 'creator' | 'library' | 'chat') => void;
  activePersona: PersonaProfile | null;
  personasCount: number;
}

export const Header: React.FC<HeaderProps> = memo(({
  activeTab,
  setActiveTab,
  activePersona,
  personasCount,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-neutral-500 rounded-full" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold tracking-tight text-base uppercase text-white">
                  ECHO REPLICA
                </h1>
              </div>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-neutral-900/90 p-1 rounded-xl border border-neutral-800">
            <button
              onClick={() => setActiveTab('creator')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'creator'
                  ? 'bg-white text-black shadow-md'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>DNA Studio</span>
            </button>

            <button
              onClick={() => setActiveTab('library')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'library'
                  ? 'bg-white text-black shadow-md'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Replicas ({personasCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-white text-black shadow-md'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Sandbox Chat</span>
            </button>
          </nav>

          {/* Active Persona Badge */}
          <div className="flex items-center gap-2">
            {activePersona ? (
              <div
                onClick={() => setActiveTab('chat')}
                className="cursor-pointer flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-500 transition-all"
              >
                <div className="h-2 w-2 rounded-full bg-emerald-400" />
                <div className="text-left">
                  <div className="text-xs font-bold text-white line-clamp-1">
                    {activePersona.name}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-neutral-400 font-mono px-3 py-1 bg-neutral-900 rounded-xl border border-neutral-800">
                No Persona Selected
              </div>
            )}
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-neutral-800/80 text-xs font-medium uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('creator')}
            className={`px-2 py-1 rounded ${activeTab === 'creator' ? 'text-white font-bold' : 'text-neutral-400'}`}
          >
            Studio
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`px-2 py-1 rounded ${activeTab === 'library' ? 'text-white font-bold' : 'text-neutral-400'}`}
          >
            Library
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-2 py-1 rounded ${activeTab === 'chat' ? 'text-white font-bold' : 'text-neutral-400'}`}
          >
            Chat
          </button>
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';
