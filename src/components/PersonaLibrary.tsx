import React, { useState, memo, useCallback, useMemo } from 'react';
import { MessageSquare, Scale, Copy, Check, Trash2, Layers, BookOpen, Terminal, Zap, Lock, Globe, Sliders } from 'lucide-react';
import { PersonaProfile } from '../types';
import { PersonaCustomizerModal } from './PersonaCustomizerModal';

interface PersonaLibraryProps {
  personas: PersonaProfile[];
  activePersona: PersonaProfile | null;
  onSelectPersona: (persona: PersonaProfile) => void;
  onDeletePersona: (id: string) => void;
  onStartChat: (persona: PersonaProfile) => void;
  onToggleVisibility?: (id: string) => void;
  onUpdatePersona?: (updatedPersona: PersonaProfile) => void;
}

const PersonaCard = memo(({
  persona,
  isActive,
  copiedId,
  onCopyInstruction,
  onDelete,
  onSelectPersona,
  onStartChat,
  onToggleVisibility,
  onEditPersona
}: {
  persona: PersonaProfile;
  isActive: boolean;
  copiedId: string | null;
  onCopyInstruction: (id: string, text: string) => void;
  onDelete: (id: string) => void;
  onSelectPersona: (persona: PersonaProfile) => void;
  onStartChat: (persona: PersonaProfile) => void;
  onToggleVisibility?: (id: string) => void;
  onEditPersona?: (persona: PersonaProfile) => void;
}) => {
  const getIcon = (iconName?: string) => {
    if (iconName === 'BookOpen') return <BookOpen className="h-5 w-5 text-white" />;
    if (iconName === 'Terminal') return <Terminal className="h-5 w-5 text-white" />;
    return <Zap className="h-5 w-5 text-white" />;
  };

  const isPrivate = persona.visibility === 'private';

  return (
    <div
      className={`bg-neutral-900/80 backdrop-blur-md rounded-2xl border transition-all p-6 space-y-5 flex flex-col justify-between shadow-sm ${
        isActive
          ? 'border-white bg-neutral-900/95 ring-2 ring-neutral-500/30'
          : 'border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/90'
      }`}
    >
      <div className="space-y-4">
        {/* Header info */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center shrink-0">
              {getIcon(persona.avatarIcon)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-base text-white">{persona.name}</h3>
                {persona.isPreset ? (
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                    Preset
                  </span>
                ) : null}

                {/* Interactive Visibility Badge */}
                <button
                  type="button"
                  onClick={() => onToggleVisibility && onToggleVisibility(persona.id)}
                  title={isPrivate ? "Private Replica (Only Me). Click to make Public" : "Public Replica (Listed Everywhere). Click to make Private"}
                  className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border flex items-center gap-1 transition-all cursor-pointer ${
                    isPrivate
                      ? 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700'
                      : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700'
                  }`}
                >
                  {isPrivate ? (
                    <>
                      <Lock className="h-3 w-3" />
                      <span>Private</span>
                    </>
                  ) : (
                    <>
                      <Globe className="h-3 w-3" />
                      <span>Public</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-neutral-400 font-medium line-clamp-1">{persona.tagline}</p>
            </div>
          </div>

          {!persona.isPreset && (
            <button
              onClick={() => onDelete(persona.id)}
              className="text-neutral-500 hover:text-white p-1.5 rounded-lg hover:bg-neutral-800 transition-all cursor-pointer"
              title="Delete Replica"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Directness & Metrics */}
        <div className="grid grid-cols-3 gap-2 py-2 bg-neutral-950/60 p-3 rounded-xl border border-neutral-800 text-center font-mono text-[11px]">
          <div>
            <div className="text-neutral-400 font-medium">Directness</div>
            <div className="font-bold text-white">{persona.directnessScore}%</div>
          </div>
          <div>
            <div className="text-neutral-400 font-medium">Formality</div>
            <div className="font-bold text-white">{persona.formalityScore}%</div>
          </div>
          <div>
            <div className="text-neutral-400 font-medium">Warmth</div>
            <div className="font-bold text-white">{persona.empathyScore}%</div>
          </div>
        </div>

        {/* Tone & Vocabulary */}
        <div className="space-y-2 text-xs">
          <div className="text-neutral-300 line-clamp-2 leading-relaxed">{persona.toneSummary}</div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {persona.slangVocabulary.slice(0, 5).map((slang, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded bg-neutral-950/60 text-neutral-300 font-mono text-[10px] border border-neutral-800"
              >
                {slang}
              </span>
            ))}
          </div>
        </div>

        {/* Catchphrase */}
        {persona.signatureCatchphrases.length > 0 && (
          <div className="bg-neutral-950/60 p-3 rounded-xl border border-neutral-800 text-xs italic text-neutral-300 flex items-start gap-2 font-mono">
            <span className="text-white font-bold font-sans">"</span>
            <span className="line-clamp-2">{persona.signatureCatchphrases[0]}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-4 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onCopyInstruction(persona.id, persona.compiledSystemInstruction)}
            className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-mono border border-neutral-700 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {copiedId === persona.id ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span className="font-bold">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Directives</span>
              </>
            )}
          </button>

          {onEditPersona && (
            <button
              onClick={() => onEditPersona(persona)}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-mono border border-neutral-700 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Customize Name, Catchphrases, Talking Style, and Rules"
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>Customize</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              onSelectPersona(persona);
              onStartChat(persona);
            }}
            className="px-4 py-1.5 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>{isActive ? 'Chat Active' : 'Select & Chat'}</span>
          </button>
        </div>
      </div>
    </div>
  );
});

PersonaCard.displayName = 'PersonaCard';

export const PersonaLibrary: React.FC<PersonaLibraryProps> = memo(({
  personas,
  activePersona,
  onSelectPersona,
  onDeletePersona,
  onStartChat,
  onToggleVisibility,
  onUpdatePersona
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'public' | 'private'>('all');
  const [editingPersona, setEditingPersona] = useState<PersonaProfile | null>(null);

  const copyInstruction = useCallback((id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const publicCount = useMemo(() => personas.filter((p) => p.visibility !== 'private').length, [personas]);
  const privateCount = useMemo(() => personas.filter((p) => p.visibility === 'private').length, [personas]);

  const filteredPersonas = useMemo(() => {
    if (filter === 'public') return personas.filter((p) => p.visibility !== 'private');
    if (filter === 'private') return personas.filter((p) => p.visibility === 'private');
    return personas;
  }, [personas, filter]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="h-5 w-5 text-white" />
            <span>Persona Library</span>
          </h2>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 p-1 rounded-xl text-xs font-mono">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-white text-black shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
            }`}
          >
            All ({personas.length})
          </button>
          <button
            onClick={() => setFilter('public')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filter === 'public'
                ? 'bg-white text-black shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            <span>Public ({publicCount})</span>
          </button>
          <button
            onClick={() => setFilter('private')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filter === 'private'
                ? 'bg-white text-black shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
            }`}
          >
            <Lock className="h-3.5 w-3.5" />
            <span>Private ({privateCount})</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      {filteredPersonas.length === 0 ? (
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-12 text-center space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center mx-auto text-neutral-400">
            {filter === 'private' ? <Lock className="h-6 w-6" /> : <Globe className="h-6 w-6" />}
          </div>
          <h3 className="text-base font-bold text-white">No {filter} replicas found</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPersonas.map((persona) => {
            const isActive = activePersona?.id === persona.id;
            return (
              <PersonaCard
                key={persona.id}
                persona={persona}
                isActive={isActive}
                copiedId={copiedId}
                onCopyInstruction={copyInstruction}
                onDelete={onDeletePersona}
                onSelectPersona={onSelectPersona}
                onStartChat={onStartChat}
                onToggleVisibility={onToggleVisibility}
                onEditPersona={setEditingPersona}
              />
            );
          })}
        </div>
      )}

      {/* Customizer Modal */}
      {editingPersona && (
        <PersonaCustomizerModal
          persona={editingPersona}
          isOpen={!!editingPersona}
          onClose={() => setEditingPersona(null)}
          onSave={(updated) => {
            if (onUpdatePersona) {
              onUpdatePersona(updated);
            }
          }}
        />
      )}
    </div>
  );
});

PersonaLibrary.displayName = 'PersonaLibrary';
