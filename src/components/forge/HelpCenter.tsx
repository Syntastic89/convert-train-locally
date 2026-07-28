import React, { useState } from 'react';
import { ChevronDown, LifeBuoy, BookOpen, Wrench, PlayCircle } from 'lucide-react';
import { useForge } from '@/contexts/ForgeContext';
import { GLOSSARY } from '@/data/forgeData';
import { GlassCard, Btn, SectionTitle, Badge } from '@/components/forge/ui';
import UpdatesSignup from '@/components/forge/UpdatesSignup';
import { cn } from '@/lib/utils';

const FAQS = [
  {
    q: 'Do I need to install Python, drivers or anything else?',
    a: 'No. LocalForge ships with its own ONNX Runtime, QNN backend and tokenizers built for Windows on ARM. If the app opened, you are already finished setting up.'
  },
  {
    q: 'Is any of this sent to the internet?',
    a: 'Only two things touch the network: browsing the Hugging Face catalogue and downloading a model file. Chatting, converting and training all happen on your laptop, and they work in airplane mode.'
  },
  {
    q: 'What does "uncensored" actually mean?',
    a: 'Most public models are trained to refuse certain questions. Community builders remove that refusal layer — the result is often called abliterated or uncensored. It answers instead of lecturing. You are responsible for how you use it.'
  },
  {
    q: 'Why convert to ONNX? Can I skip it?',
    a: 'You can skip it and run on the CPU, but the Snapdragon X Elite NPU only understands ONNX. Converting typically triples or quadruples speed and cuts battery drain by more than half.'
  },
  {
    q: 'How much disk space do I need?',
    a: 'A 3B model is about 2 GB, a 7-8B model is 4-5 GB, and a 13B model is around 8 GB. Converting to INT8 makes each one roughly a third smaller.'
  },
  {
    q: 'Will training break my model?',
    a: 'Never. Training produces a small separate add-on file (a LoRA). Turn it off any time from My Models and the original weights are untouched.'
  },
  {
    q: 'My laptop feels warm during conversion. Is that normal?',
    a: 'Yes. Conversion is the only heavy job in the app and it pushes the NPU and CPU hard for a few minutes. Temperatures under 80°C are completely fine.'
  },
  {
    q: 'Can I use my own documents or spreadsheets for training?',
    a: 'Yes — drag a CSV, JSONL, TXT or a folder of documents onto the Trainer\'s drop zone. We format it for you automatically.'
  }
];

const TROUBLE = [
  { t: 'Download stuck at 0%', f: 'Some Hugging Face repos are gated. Open the model page, accept the licence, then press Download again.' },
  { t: 'Model will not switch to NPU', f: 'It is still in GGUF format. Run it through the NPU Converter first — the toggle unlocks automatically afterwards.' },
  { t: 'Answers are very short', f: 'Slide the "Answer length" dial in Chat Studio towards Essay.' },
  { t: 'It still refuses a question', f: 'Push the Filter dial past 70, or pick a model with the Uncensored badge in the store.' },
  { t: 'Out of disk space', f: 'Delete a model from My Models, or convert it to INT4 which is about half the size.' },
  { t: 'Training loss is not falling', f: 'Increase the study passes to 3-4, or pick a dataset with more rows.' }
];

const HelpCenter: React.FC = () => {
  const { setView, openWizard } = useForge();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Plain English Help"
        sub="Every technical word in this app, explained without jargon. Nothing here assumes you have used AI tools before."
      />

      <GlassCard className="overflow-hidden">
        <div className="grid gap-4 p-6 sm:grid-cols-3">
          {[
            { icon: PlayCircle, title: 'Replay the setup guide', body: 'The four-screen walkthrough you saw on first launch.', action: openWizard, cta: 'Start guide' },
            { icon: BookOpen, title: 'Go to the Model Store', body: 'Every model has a plain-English description and badges.', action: () => setView('library'), cta: 'Browse models' },
            { icon: Wrench, title: 'Convert for the NPU', body: 'Drag a file in, press one button, get 4x the speed.', action: () => setView('convert'), cta: 'Open converter' }
          ].map((c) => (
            <div key={c.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <c.icon className="h-5 w-5 text-violet-300" />
              <h3 className="mt-2 text-[14px] font-semibold text-white">{c.title}</h3>
              <p className="mt-1 text-[12px] leading-relaxed text-slate-400">{c.body}</p>
              <Btn size="sm" variant="outline" className="mt-3" onClick={c.action}>{c.cta}</Btn>
            </div>
          ))}
        </div>
      </GlassCard>

      <div>
        <SectionTitle title="Dictionary" sub="Tap any word you have seen in the app." />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Object.entries(GLOSSARY).map(([k, v]) => (
            <GlassCard key={k} className="p-4">
              <Badge tone="cyan">{k}</Badge>
              <p className="mt-2 text-[12.5px] leading-relaxed text-slate-300">{v}</p>
            </GlassCard>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard className="p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
            <LifeBuoy className="h-4 w-4 text-cyan-300" /> Common questions
          </h3>
          <div className="mt-3 divide-y divide-white/[0.07]">
            {FAQS.map((f, i) => (
              <div key={f.q}>
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="flex w-full items-center justify-between gap-3 py-3 text-left"
                >
                  <span className="text-[13px] font-medium text-slate-200">{f.q}</span>
                  <ChevronDown className={cn('h-4 w-4 shrink-0 text-slate-500 transition-transform', open === i && 'rotate-180')} />
                </button>
                {open === i && <p className="pb-3 text-[12.5px] leading-relaxed text-slate-400">{f.a}</p>}
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
            <Wrench className="h-4 w-4 text-amber-300" /> If something looks wrong
          </h3>
          <div className="mt-3 space-y-3">
            {TROUBLE.map((t) => (
              <div key={t.t} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-[13px] font-medium text-white">{t.t}</p>
                <p className="mt-1 text-[12px] leading-relaxed text-slate-400">{t.f}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <UpdatesSignup />

      <footer className="border-t border-white/10 pt-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-sm font-semibold text-white">LocalForge NPU</p>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-slate-500">
              Offline uncensored AI for Windows 11 on ARM. Built for Snapdragon X Elite Extreme.
            </p>
            <p className="mt-2 font-mono text-[10px] text-slate-600">v2.4.1 · ARM64 · QNN 2.28</p>
          </div>
          {[
            { h: 'Inside the app', items: [['Model Store', 'library'], ['NPU Converter', 'convert'], ['Chat Studio', 'chat'], ['Trainer', 'train']] as [string, string][] },
            { h: 'Your device', items: [['My Models', 'manage'], ['Live meters', 'dashboard'], ['Benchmarks', 'manage'], ['Setup guide', 'help']] as [string, string][] },
            { h: 'Learn', items: [['Dictionary', 'help'], ['Common questions', 'help'], ['Troubleshooting', 'help'], ['Model licences', 'library']] as [string, string][] }
          ].map((col) => (
            <div key={col.h}>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{col.h}</p>
              <ul className="mt-2 space-y-1.5">
                {col.items.map(([label, v]) => (
                  <li key={label}>
                    <button
                      onClick={() => setView(v as never)}
                      className="text-[12px] text-slate-400 transition hover:text-cyan-300"
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-6 text-[11px] text-slate-600">
          You are responsible for how you use uncensored models. Model licences belong to their original authors.
        </p>
      </footer>
    </div>
  );
};

export default HelpCenter;
