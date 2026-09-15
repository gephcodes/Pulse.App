import React, { useState, useRef, useEffect, memo, useCallback } from 'react';
import { Send, User, Bot, Sparkles, RefreshCw, Volume2, Loader2, Sliders } from 'lucide-react';
import { PersonaProfile, ChatMessage } from '../types';
import { generatePersonaReply, generateGeminiSpeech } from '../services/gemini';
import { PersonaCustomizerModal } from './PersonaCustomizerModal';

interface ChatSandboxProps {
  activePersona: PersonaProfile | null;
  onOpenLibrary: () => void;
  onUpdatePersona?: (updatedPersona: PersonaProfile) => void;
}

// Sub-component 1: Memoized Chat Message Item with Hardware Acceleration
const ChatMessageItem = memo(({
  msg,
  playingAudioId,
  onPlayTTS
}: {
  msg: ChatMessage;
  playingAudioId: string | null;
  onPlayTTS: (id: string, text: string) => void;
}) => {
  const isUser = msg.role === 'user';

  return (
    <div className={`flex items-start gap-3 will-change-transform ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
          isUser
            ? 'bg-neutral-800 text-white border border-neutral-700'
            : 'bg-white text-black shadow-sm'
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div className={`space-y-1.5 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`p-3.5 rounded-2xl text-xs sm:text-sm font-mono leading-relaxed whitespace-pre-wrap ${
            isUser
              ? 'bg-neutral-800 border border-neutral-700 text-white shadow-sm rounded-tr-none'
              : 'bg-white text-black shadow-sm rounded-tl-none border border-neutral-200'
          }`}
        >
          {msg.content}
        </div>

        <div className="flex items-center gap-3 text-[10px] text-neutral-500 font-mono px-1">
          <span>{msg.timestamp}</span>

          {!isUser && (
            <button
              onClick={() => onPlayTTS(msg.id, msg.content)}
              disabled={playingAudioId === msg.id}
              className="hover:text-black p-0.5 transition-colors flex items-center gap-1 cursor-pointer"
              title="Listen to message"
            >
              <Volume2 className={`h-3 w-3 ${playingAudioId === msg.id ? 'animate-bounce text-black' : ''}`} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

ChatMessageItem.displayName = 'ChatMessageItem';

// Sub-component 2: Memoized Input Field
const ChatInput = memo(({
  onSend,
  isLoading,
  personaName
}: {
  onSend: (text: string) => void;
  isLoading: boolean;
  personaName: string;
}) => {
  const [input, setInput] = useState('');

  const handleSubmit = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setInput('');
  }, [input, onSend]);

  return (
    <div className="p-4 bg-neutral-950/80 border-t border-neutral-800 flex items-center gap-2">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        placeholder={`Message ${personaName}...`}
        className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-white transition-all placeholder:text-neutral-500"
      />

      <button
        onClick={handleSubmit}
        disabled={!input.trim()}
        className="bg-white hover:bg-neutral-200 disabled:opacity-50 text-black p-2.5 rounded-xl shadow-sm transition-all cursor-pointer"
      >
        <Send className="h-4 w-4" />
      </button>
    </div>
  );
});

ChatInput.displayName = 'ChatInput';

// Main ChatSandbox Component
export const ChatSandbox: React.FC<ChatSandboxProps> = memo(({ activePersona, onOpenLibrary, onUpdatePersona }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEditingPersonaModalOpen, setIsEditingPersonaModalOpen] = useState<boolean>(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Load history from localStorage on persona change
  useEffect(() => {
    if (!activePersona) return;

    const storageKey = `echo_persona_chats_${activePersona.id}`;
    const stored = localStorage.getItem(storageKey);

    if (stored) {
      try {
        const records: ChatMessage[] = JSON.parse(stored);
        setMessages(records);
      } catch (e) {
        console.error('Failed to parse history:', e);
      }
    } else {
      setMessages([]);
    }
  }, [activePersona?.id]);

  // Non-blocking async persist history
  const persistHistory = useCallback((newMsgs: ChatMessage[]) => {
    if (!activePersona) return;
    const storageKey = `echo_persona_chats_${activePersona.id}`;

    setTimeout(() => {
      localStorage.setItem(storageKey, JSON.stringify(newMsgs));
    }, 10);
  }, [activePersona]);

  // Instant non-laggy scroll to bottom using requestAnimationFrame & direct scrollTop
  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
      });
    }
  }, [messages.length, isLoading]);

  const handleSend = useCallback(async (text: string) => {
    if (!activePersona || !text.trim()) return;

    const msgId = Date.now().toString();

    const userMsg: ChatMessage = {
      id: msgId,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => {
      const updated = [...prev, userMsg];
      persistHistory(updated);
      return updated;
    });

    setIsLoading(true);

    try {
      const history = messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content
      }));

      // Fixed temperature to 0.7 for simplicity
      const replyData = await generatePersonaReply(activePersona, text, history, 0.7);

      const botMsgId = (Date.now() + 1).toString();

      const botMsg: ChatMessage = {
        id: botMsgId,
        role: 'model',
        content: replyData.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => {
        const updated = [...prev, botMsg];
        persistHistory(updated);
        return updated;
      });
    } catch (e: any) {
      console.error('Failed to generate reply', e);
      const errorMsgId = (Date.now() + 1).toString();
      const errorText = e.message || 'Failed to generate response. Please check API connection.';

      const errorMsg: ChatMessage = {
        id: errorMsgId,
        role: 'model',
        content: errorText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => {
        const updated = [...prev, errorMsg];
        persistHistory(updated);
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  }, [activePersona, messages, persistHistory]);

  const handleTTS = useCallback(async (msgId: string, text: string) => {
    try {
      setPlayingAudioId(msgId);
      const audioUrl = await generateGeminiSpeech(text, 'Puck');
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onended = () => setPlayingAudioId(null);
      audio.onerror = () => setPlayingAudioId(null);
      await audio.play();
    } catch (e) {
      console.error('Speech playback failed', e);
      setPlayingAudioId(null);
    }
  }, []);

  const handleClearHistory = useCallback(() => {
    if (!activePersona) return;
    setMessages([]);
    const storageKey = `echo_persona_chats_${activePersona.id}`;
    localStorage.removeItem(storageKey);
  }, [activePersona]);

  if (!activePersona) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <div className="h-16 w-16 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center justify-center mx-auto text-white">
          <Sparkles className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-bold text-white">No Persona Selected</h3>
        <p className="text-xs text-neutral-400 font-mono">
          Please select a persona from the library to chat.
        </p>
        <button
          onClick={onOpenLibrary}
          className="px-5 py-2.5 bg-white hover:bg-neutral-200 text-black rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
        >
          Open Persona Library
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-2 space-y-4">
      {/* Top Controls Header */}
      <div className="bg-neutral-900/80 backdrop-blur-md border border-neutral-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white font-bold text-sm">
            {activePersona.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-white text-sm">{activePersona.name}</h3>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
          <button
            onClick={() => setIsEditingPersonaModalOpen(true)}
            className="flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 px-3 py-1.5 rounded-xl text-xs text-white font-mono transition-all cursor-pointer shadow-sm"
          >
            <Sliders className="h-3.5 w-3.5" />
            <span className="font-bold">Customize</span>
          </button>

          <button
            onClick={handleClearHistory}
            className="p-2 rounded-xl bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-all text-xs cursor-pointer"
            title="Clear Chat History"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Main Chat Box */}
      <div className="bg-neutral-900/80 backdrop-blur-md border border-neutral-800 rounded-2xl flex flex-col h-[560px] overflow-hidden shadow-sm">
        {/* Messages Scroll Area */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scroll-smooth">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-12">
              <div className="p-3 bg-neutral-800 border border-neutral-700 rounded-2xl text-white shadow-sm flex items-center gap-2">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white flex items-center justify-center gap-2">
                  <span>Chat with {activePersona.name}</span>
                </h4>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <ChatMessageItem
                key={msg.id}
                msg={msg}
                playingAudioId={playingAudioId}
                onPlayTTS={handleTTS}
              />
            ))
          )}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono p-2">
              <Loader2 className="h-4 w-4 animate-spin text-white" />
              <span>Generating response...</span>
            </div>
          )}
        </div>

        {/* Isolated Input Footer */}
        <ChatInput
          onSend={handleSend}
          isLoading={isLoading}
          personaName={activePersona.name}
        />
      </div>

      {/* In-Chat Persona Customizer Modal */}
      {isEditingPersonaModalOpen && activePersona && (
        <PersonaCustomizerModal
          persona={activePersona}
          isOpen={isEditingPersonaModalOpen}
          onClose={() => setIsEditingPersonaModalOpen(false)}
          onSave={(updatedPersona) => {
            if (onUpdatePersona) {
              onUpdatePersona(updatedPersona);
            }
          }}
        />
      )}
    </div>
  );
});

ChatSandbox.displayName = 'ChatSandbox';
