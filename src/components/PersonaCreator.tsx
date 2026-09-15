import React, { useState, memo, useCallback } from 'react';
import { Sparkles, ArrowRight, FileText, AlertCircle, CheckCircle2, Copy, Check, Terminal, Zap, Shield, Flame, Lock, Globe, ShieldCheck } from 'lucide-react';
import { PersonaProfile } from '../types';
import { analyzePersonaFromText } from '../services/gemini';
import { SAMPLE_DATA_TEMPLATES } from '../presets';

interface PersonaCreatorProps {
  onPersonaCreated: (persona: PersonaProfile) => void;
}

const HeroHeader = memo(() => (
  <div className="relative rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-800 p-8 sm:p-12 text-center space-y-4 shadow-sm">
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs font-mono font-bold uppercase tracking-widest">
      <Sparkles className="h-3.5 w-3.5" />
      <span>Gemini Intelligence</span>
    </div>

    <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
      Persona Replica
    </h1>

    <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl mx-auto leading-relaxed font-medium">
      Extract linguistic DNA, casing patterns, and mental models from chat logs to replicate a persona.
    </p>
  </div>
));

HeroHeader.displayName = 'HeroHeader';

const TemplateList = memo(({ onSelect }: { onSelect: (text: string) => void }) => (
  <div className="space-y-2">
    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
      Or pick a reference writing sample preset:
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {SAMPLE_DATA_TEMPLATES.map((tmpl, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(tmpl.text)}
          className="text-left p-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-500 transition-all group cursor-pointer"
        >
          <div className="text-xs font-bold text-white group-hover:text-neutral-300">
            {tmpl.title}
          </div>
          <div className="text-[11px] text-neutral-400 line-clamp-2 mt-1">
            "{tmpl.text}"
          </div>
        </button>
      ))}
    </div>
  </div>
));

TemplateList.displayName = 'TemplateList';

const ResultShowcase = memo(({
  result,
  copied,
  onCopy
}: {
  result: PersonaProfile;
  copied: boolean;
  onCopy: () => void;
}) => (
  <div className="bg-neutral-900/90 backdrop-blur-md rounded-2xl border border-neutral-800 p-6 space-y-6 shadow-sm animate-in fade-in duration-300">
    <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white font-bold">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2 flex-wrap">
            {result.name}
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
              Replica Ready
            </span>
            {result.visibility === 'private' ? (
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700 flex items-center gap-1">
                <Lock className="h-3 w-3" /> Private
              </span>
            ) : (
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700 flex items-center gap-1">
                <Globe className="h-3 w-3" /> Public
              </span>
            )}
          </h3>
          <p className="text-xs text-neutral-400 font-medium">{result.tagline}</p>
        </div>
      </div>

      <button
        onClick={onCopy}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold uppercase tracking-wider border border-neutral-700 transition-all cursor-pointer"
      >
        {copied ? (
          <>
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" />
            <span>Copy Directives</span>
          </>
        )}
      </button>
    </div>

    {/* Metric Scales */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-neutral-950/60 p-4 rounded-xl border border-neutral-800 space-y-1">
        <div className="flex justify-between text-xs text-neutral-400 font-mono">
          <span>Directness Level</span>
          <span className="font-bold text-white">{result.directnessScore}%</span>
        </div>
        <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${result.directnessScore}%` }}
          />
        </div>
      </div>

      <div className="bg-neutral-950/60 p-4 rounded-xl border border-neutral-800 space-y-1">
        <div className="flex justify-between text-xs text-neutral-400 font-mono">
          <span>Formality Score</span>
          <span className="font-bold text-white">{result.formalityScore}%</span>
        </div>
        <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${result.formalityScore}%` }}
          />
        </div>
      </div>

      <div className="bg-neutral-950/60 p-4 rounded-xl border border-neutral-800 space-y-1">
        <div className="flex justify-between text-xs text-neutral-400 font-mono">
          <span>Empathy / Warmth</span>
          <span className="font-bold text-white">{result.empathyScore}%</span>
        </div>
        <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${result.empathyScore}%` }}
          />
        </div>
      </div>
    </div>

    {/* Details Breakdown */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
      <div className="bg-neutral-950/60 p-4 rounded-xl border border-neutral-800 space-y-2">
        <div className="font-bold text-white">Linguistic Profile & Casing</div>
        <p className="text-neutral-400 leading-relaxed">{result.toneSummary}</p>
        <div className="pt-2 flex flex-wrap gap-2">
          <span className="px-2 py-1 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 font-mono text-[11px]">
            Casing: {result.casingStyle}
          </span>
          <span className="px-2 py-1 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 font-mono text-[11px]">
            Punctuation: {result.punctuationStyle}
          </span>
        </div>
      </div>

      <div className="bg-neutral-950/60 p-4 rounded-xl border border-neutral-800 space-y-2">
        <div className="font-bold text-white">Signature Slang & Jargon Bank</div>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {result.slangVocabulary.map((word, idx) => (
            <span
              key={idx}
              className="px-2 py-1 rounded bg-neutral-800 border border-neutral-700 text-neutral-200 font-mono text-[11px]"
            >
              {word}
            </span>
          ))}
        </div>
      </div>
    </div>

    {/* Thinking Framework */}
    <div className="bg-neutral-950/60 p-4 rounded-xl border border-neutral-800 space-y-2">
      <div className="text-xs font-bold text-white">Mental Models & Thinking Framework</div>
      <ul className="space-y-1.5 text-xs text-neutral-400">
        {result.thinkingFramework.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <span className="text-white font-bold">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>

    {/* Compiled System Instruction */}
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-bold text-white">
        <div className="flex items-center gap-1.5">
          <Terminal className="h-4 w-4 text-white" />
          <span>Compiled Operational Directives (System Instruction)</span>
        </div>
      </div>
      <pre className="bg-neutral-950 border border-neutral-800 p-4 rounded-xl text-xs font-mono text-neutral-300 whitespace-pre-wrap max-h-60 overflow-y-auto leading-relaxed shadow-sm">
        {result.compiledSystemInstruction}
      </pre>
    </div>
  </div>
));

ResultShowcase.displayName = 'ResultShowcase';

export const PersonaCreator: React.FC<PersonaCreatorProps> = memo(({ onPersonaCreated }) => {
  const [referenceText, setReferenceText] = useState<string>('');
  const [nameHint, setNameHint] = useState<string>('');
  const [userRelationship, setUserRelationship] = useState<string>('Best Friend 💖');
  const [visibility, setVisibility] = useState<'private' | 'public'>('private');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [createdResult, setCreatedResult] = useState<PersonaProfile | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleSelectTemplate = useCallback((text: string) => {
    setReferenceText(text);
    setError(null);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!referenceText.trim()) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await analyzePersonaFromText(referenceText, nameHint);
      const profileWithRel: PersonaProfile = {
        ...result,
        visibility,
        userRelationship: userRelationship.trim() || 'Friend / Peer'
      };
      // Recompile with relationship
      const { recompileSystemInstruction } = await import('../lib/personaCompiler');
      profileWithRel.compiledSystemInstruction = recompileSystemInstruction(profileWithRel);

      setCreatedResult(profileWithRel);
      onPersonaCreated(profileWithRel);
    } catch (e: any) {
      console.error('Extraction failed', e);
      setError(e?.message || 'Failed to analyze text sample. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [referenceText, nameHint, visibility, userRelationship, onPersonaCreated]);

  const copyInstruction = useCallback(() => {
    if (!createdResult) return;
    navigator.clipboard.writeText(createdResult.compiledSystemInstruction);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [createdResult]);

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-2">
      <HeroHeader />

      {/* Main Input Form */}
      <div className="bg-neutral-900/80 backdrop-blur-md rounded-2xl border border-neutral-800 p-6 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <label className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Reference Chat Data / Samples</span>
          </label>
        </div>

        <TemplateList onSelect={handleSelectTemplate} />

        <div className="space-y-4">
          <textarea
            rows={5}
            value={referenceText}
            onChange={(e) => setReferenceText(e.target.value)}
            placeholder="Paste raw messages, chat logs, or transcripts here..."
            className="w-full bg-neutral-950/80 text-white border border-neutral-800 rounded-xl p-4 text-xs sm:text-sm font-mono focus:outline-none focus:border-neutral-500 transition-all placeholder:text-neutral-500"
          />

          {/* Relationship Selection Box */}
          <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                <Sparkles className="h-4 w-4" />
                <span>Relationship Dynamic</span>
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {['Best Friend', 'Sibling', 'Partner', 'Co-worker', 'Mentor'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setUserRelationship(preset)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer border ${
                    userRelationship === preset
                      ? 'bg-white text-black border-white font-bold'
                      : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-500'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={userRelationship}
              onChange={(e) => setUserRelationship(e.target.value)}
              placeholder="Or type custom relationship..."
              className="w-full bg-neutral-900 text-white border border-neutral-800 rounded-xl px-4 py-2 text-xs font-mono focus:outline-none focus:border-neutral-500 placeholder:text-neutral-500 mt-2"
            />
          </div>

          {/* Visibility Selection Box */}
          <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                {visibility === 'private' ? <Lock className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                <span>Replica Visibility Setting</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setVisibility('private')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                  visibility === 'private'
                    ? 'bg-neutral-800 border-neutral-600 ring-1 ring-neutral-500'
                    : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700 opacity-70'
                }`}
              >
                <Lock className={`h-5 w-5 mt-0.5 shrink-0 ${visibility === 'private' ? 'text-white' : 'text-neutral-500'}`} />
                <div>
                  <div className={`text-xs font-bold ${visibility === 'private' ? 'text-white' : 'text-neutral-400'}`}>
                    Private
                  </div>
                  <div className="text-[11px] text-neutral-500 leading-snug mt-0.5">
                    Only you can see this replica.
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setVisibility('public')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                  visibility === 'public'
                    ? 'bg-neutral-800 border-neutral-600 ring-1 ring-neutral-500'
                    : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700 opacity-70'
                }`}
              >
                <Globe className={`h-5 w-5 mt-0.5 shrink-0 ${visibility === 'public' ? 'text-white' : 'text-neutral-500'}`} />
                <div>
                  <div className={`text-xs font-bold ${visibility === 'public' ? 'text-white' : 'text-neutral-400'}`}>
                    Public
                  </div>
                  <div className="text-[11px] text-neutral-500 leading-snug mt-0.5">
                    Listed in the directory for everyone.
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-full sm:w-1/2">
              <input
                type="text"
                value={nameHint}
                onChange={(e) => setNameHint(e.target.value)}
                placeholder="Persona Name Hint (e.g. Alex)"
                className="w-full bg-neutral-950 text-white border border-neutral-800 rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:border-neutral-500 placeholder:text-neutral-500"
              />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !referenceText.trim()}
              className="w-full sm:w-1/2 flex items-center justify-center gap-2 bg-white hover:bg-neutral-200 disabled:opacity-50 text-black px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <Sparkles className="h-4 w-4 animate-spin text-black" />
                  <span>Extracting...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Analyze & Build Replica</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300 font-medium">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Extraction Result Showcase */}
      {createdResult && (
        <ResultShowcase
          result={createdResult}
          copied={copied}
          onCopy={copyInstruction}
        />
      )}
    </div>
  );
});

PersonaCreator.displayName = 'PersonaCreator';
