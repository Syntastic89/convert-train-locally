import React from 'react';
import { X, HelpCircle, Bell } from 'lucide-react';
import { useForge } from '@/contexts/ForgeContext';
import { GLOSSARY } from '@/data/forgeData';
import { GlassCard, Btn } from '@/components/forge/ui';

export const GlossaryModal: React.FC = () => {
  const { glossaryKey, hideGlossary, setView } = useForge();
  if (!glossaryKey) return null;
  const text = GLOSSARY[glossaryKey] ?? 'No explanation found for this term yet.';
  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md" onClick={hideGlossary}>
      <GlassCard className="forge-pop w-full max-w-md p-6" glow>
        <div onClick={(e) => e.stopPropagation()}>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/20">
              <HelpCircle className="h-5 w-5 text-cyan-300" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-300">What does this mean?</p>
              <h3 className="text-lg font-bold capitalize text-white">{glossaryKey}</h3>
            </div>
            <button onClick={hideGlossary} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-4 text-[13.5px] leading-relaxed text-slate-300">{text}</p>
          <div className="mt-5 flex gap-2">
            <Btn size="sm" onClick={hideGlossary}>Got it</Btn>
            <Btn size="sm" variant="outline" onClick={() => { hideGlossary(); setView('help'); }}>
              See the full dictionary
            </Btn>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export const ToastStack: React.FC = () => {
  const { toast } = useForge();
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[70] flex w-[min(360px,calc(100vw-2.5rem))] flex-col gap-2">
      {toast.map((t) => (
        <div
          key={t.id}
          className="forge-pop pointer-events-auto flex items-start gap-3 rounded-xl border border-white/12 bg-[#0c0c1c]/95 p-3.5 shadow-[0_16px_50px_-12px_rgba(0,0,0,0.9)] backdrop-blur-xl"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/30 to-cyan-400/25">
            <Bell className="h-4 w-4 text-cyan-200" />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-white">{t.title}</p>
            {t.body && <p className="mt-0.5 text-[11.5px] leading-relaxed text-slate-400">{t.body}</p>}
          </div>
        </div>
      ))}
    </div>
  );
};
