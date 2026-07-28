import React, { useEffect, useState } from 'react';
import { Check, Loader2, Zap, ArrowRight, Download, Sparkles, ShieldCheck, X } from 'lucide-react';
import { useForge } from '@/contexts/ForgeContext';
import { CURATED_MODELS, DEVICE_PROFILE, HERO_IMAGE } from '@/data/forgeData';
import { GlassCard, Btn, Badge } from '@/components/forge/ui';
import { cn } from '@/lib/utils';

const CHECKS = [
  { label: 'Windows 11 ARM64 build', value: DEVICE_PROFILE.os },
  { label: 'Snapdragon silicon', value: DEVICE_PROFILE.chip },
  { label: 'Hexagon NPU', value: DEVICE_PROFILE.npu },
  { label: 'Memory available', value: `${DEVICE_PROFILE.ram} GB LPDDR5X` },
  { label: 'Free disk space', value: `${DEVICE_PROFILE.storageTotal} GB SSD` },
  { label: 'ONNX Runtime + QNN backend', value: DEVICE_PROFILE.driver }
];

const INTENTS = [
  { id: 'chat', label: 'Chat about anything, unfiltered', pick: 'cognitivecomputations/Dolphin3.0-Llama3.1-8B' },
  { id: 'story', label: 'Write stories and roleplay', pick: 'TheDrummer/Tiger-Gemma-9B-v3' },
  { id: 'code', label: 'Help me with code', pick: 'huihui-ai/Qwen2.5-7B-Instruct-abliterated-v3' },
  { id: 'fast', label: 'Just want it fast on battery', pick: 'huihui-ai/Llama-3.2-3B-Instruct-abliterated' },
  { id: 'think', label: 'Solve hard problems step by step', pick: 'huihui-ai/DeepSeek-R1-Distill-Qwen-7B-abliterated' }
];

const SetupWizard: React.FC = () => {
  const { completeWizard, installModel, setView } = useForge();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [checked, setChecked] = useState(0);
  const [intent, setIntent] = useState(INTENTS[0].id);

  useEffect(() => {
    if (step !== 1 || checked >= CHECKS.length) return;
    const t = window.setTimeout(() => setChecked((c) => c + 1), 420);
    return () => window.clearTimeout(t);
  }, [step, checked]);

  const recommended = CURATED_MODELS.find((m) => m.id === INTENTS.find((i) => i.id === intent)?.pick) ?? CURATED_MODELS[0];

  const finish = (withDownload: boolean) => {
    if (withDownload) {
      installModel(recommended);
      setView('library');
    }
    completeWizard(name.trim());
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-lg">
      <GlassCard glow className="forge-pop w-full max-w-3xl overflow-hidden">
        <div className="relative h-32 sm:h-40">
          <img src={HERO_IMAGE} alt="" className="h-full w-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07071a] via-[#07071a]/50 to-transparent" />
          <button
            onClick={() => completeWizard(name.trim())}
            className="absolute right-3 top-3 rounded-lg bg-black/50 p-2 text-slate-300 hover:bg-black/80 hover:text-white"
            title="Skip the guide"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="absolute bottom-4 left-6 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">LocalForge NPU</span>
            <Badge tone="violet">first launch</Badge>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {/* progress dots */}
          <div className="mb-6 flex items-center gap-2">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className={cn('h-1.5 flex-1 rounded-full transition-all',
                i <= step ? 'bg-gradient-to-r from-violet-500 to-cyan-400' : 'bg-white/10')} />
            ))}
          </div>

          {step === 0 && (
            <div>
              <h2 className="text-2xl font-bold text-white sm:text-3xl">Welcome. This takes 30 seconds.</h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-300">
                LocalForge runs uncensored AI models entirely on your own laptop — no accounts, no subscriptions, no cloud.
                You will never see a command prompt. Everything is buttons, sliders and drag-and-drop.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  ['Download', 'Pick a model from the store like picking an app.'],
                  ['Convert', 'One click turns it into an NPU-accelerated ONNX file.'],
                  ['Chat or train', 'Talk to it, or teach it with a Hugging Face dataset.']
                ].map(([h, b], i) => (
                  <div key={h} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <span className="font-mono text-[11px] text-cyan-300">0{i + 1}</span>
                    <p className="mt-1 text-[13px] font-semibold text-white">{h}</p>
                    <p className="mt-0.5 text-[11.5px] leading-relaxed text-slate-400">{b}</p>
                  </div>
                ))}
              </div>
              <label className="mt-6 block text-[12px] font-medium text-slate-300">What should we call you? (optional)</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your first name"
                className="mt-2 h-11 w-full max-w-xs rounded-xl border border-white/10 bg-white/[0.05] px-3 text-sm text-white placeholder:text-slate-500 focus:border-violet-400/50 focus:outline-none"
              />
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-white">Checking your PC</h2>
              <p className="mt-2 text-sm text-slate-300">Nothing for you to do. We are just confirming the neural engine is available.</p>
              <div className="mt-5 space-y-2">
                {CHECKS.map((c, i) => (
                  <div key={c.label} className={cn('flex items-center gap-3 rounded-xl border p-3 transition-all',
                    i < checked ? 'border-emerald-400/25 bg-emerald-500/[0.08]' : 'border-white/10 bg-white/[0.02]')}>
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.07]">
                      {i < checked
                        ? <Check className="h-3.5 w-3.5 text-emerald-300" />
                        : <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-500" />}
                    </span>
                    <span className="flex-1 text-[13px] text-slate-200">{c.label}</span>
                    <span className="hidden font-mono text-[10.5px] text-slate-400 sm:block">{i < checked ? c.value : 'checking…'}</span>
                  </div>
                ))}
              </div>
              {checked >= CHECKS.length && (
                <div className="mt-4 forge-pop flex items-center gap-2 rounded-xl border border-emerald-400/25 bg-emerald-500/10 p-3">
                  <ShieldCheck className="h-4 w-4 text-emerald-300" />
                  <p className="text-[12.5px] text-emerald-100">All good. Your 45 TOPS NPU is ready to run models.</p>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-white">What do you want to do first?</h2>
              <p className="mt-2 text-sm text-slate-300">We will recommend the perfect model. You can change it later.</p>
              <div className="mt-5 space-y-2">
                {INTENTS.map((i) => (
                  <button
                    key={i.id}
                    onClick={() => setIntent(i.id)}
                    className={cn('flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition',
                      intent === i.id ? 'border-violet-400/60 bg-violet-500/15' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.07]')}
                  >
                    <span className={cn('flex h-5 w-5 items-center justify-center rounded-full border',
                      intent === i.id ? 'border-violet-300 bg-violet-500' : 'border-white/20')}>
                      {intent === i.id && <Check className="h-3 w-3 text-white" />}
                    </span>
                    <span className="text-[13.5px] text-slate-100">{i.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-white">Perfect — start with this one</h2>
              <div className="mt-4 flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <img src={recommended.thumb} alt="" className="h-16 w-16 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-semibold text-white">{recommended.name}</p>
                  <p className="font-mono text-[10.5px] text-slate-500">{recommended.id}</p>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-slate-300">{recommended.blurb}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <Badge tone="emerald">{recommended.npuReady ? 'NPU ready' : 'CPU only'}</Badge>
                  <span className="font-mono text-[11px] text-cyan-200">{recommended.sizeGB.toFixed(1)} GB</span>
                </div>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {[
                  ['Download time', '≈ 2 min on fibre'],
                  ['Speed on NPU', `${recommended.npuTps || recommended.cpuTps} words/sec`],
                  ['Runs offline', 'Always, forever']
                ].map(([k, v]) => (
                  <div key={k} className="rounded-xl border border-white/10 bg-black/30 p-3">
                    <p className="font-mono text-[12px] font-semibold text-white">{v}</p>
                    <p className="text-[10px] uppercase tracking-wide text-slate-500">{k}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[11.5px] text-slate-500">
                Prefer to look around first? Choose &quot;Just explore&quot; and nothing will download.
              </p>
            </div>
          )}

          <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
            <Btn variant="ghost" onClick={() => (step === 0 ? completeWizard(name.trim()) : setStep(step - 1))}>
              {step === 0 ? 'Skip the guide' : 'Back'}
            </Btn>
            {step < 3 ? (
              <Btn size="lg" disabled={step === 1 && checked < CHECKS.length} onClick={() => setStep(step + 1)}>
                {step === 1 && checked < CHECKS.length ? <><Loader2 className="h-4 w-4 animate-spin" /> Checking…</> : <>Continue <ArrowRight className="h-4 w-4" /></>}
              </Btn>
            ) : (
              <div className="flex flex-wrap gap-2">
                <Btn variant="outline" onClick={() => finish(false)}><Sparkles className="h-4 w-4" /> Just explore</Btn>
                <Btn size="lg" onClick={() => finish(true)}><Download className="h-4 w-4" /> Download &amp; finish</Btn>
              </div>
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default SetupWizard;
