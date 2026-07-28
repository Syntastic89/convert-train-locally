import React, { useEffect, useMemo, useState } from 'react';
import {
  Download, Search, Cpu, Check, Loader2, X, Globe, ShieldOff, Trash2, Sparkles, Filter
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useForge } from '@/contexts/ForgeContext';
import {
  CURATED_MODELS, MODEL_CATEGORIES, ForgeModel, ModelCategory, PRECISION_OPTIONS
} from '@/data/forgeData';
import { GlassCard, Btn, Badge, Stars, ProgressRing, SectionTitle, HelpDot } from '@/components/forge/ui';
import { cn } from '@/lib/utils';

interface HFItem {
  id: string;
  author: string;
  downloads: number;
  likes: number;
  pipeline_tag?: string | null;
  tags: string[];
  hasGGUF: boolean;
  hasONNX: boolean;
  quantHints: string[];
}

const humanNum = (n: number) => (n > 999999 ? `${(n / 1e6).toFixed(1)}M` : n > 999 ? `${(n / 1e3).toFixed(0)}K` : `${n}`);

const ModelCard: React.FC<{ m: ForgeModel; onOpen: (m: ForgeModel) => void }> = ({ m, onOpen }) => {
  const { installModel, getInstalled } = useForge();
  const inst = getInstalled(m.id);
  return (
    <GlassCard className="group flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-violet-400/40 hover:shadow-[0_0_50px_-18px_rgba(139,92,246,0.8)]">
      <div className="relative h-32 overflow-hidden">
        <img src={m.thumb} alt={m.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a18] via-transparent to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {m.uncensored && <Badge tone="rose"><ShieldOff className="h-3 w-3" /> Uncensored</Badge>}
          {m.npuReady ? <Badge tone="emerald">NPU ready</Badge> : <Badge tone="amber">CPU only</Badge>}
        </div>
        {inst?.status === 'downloading' && (
          <div className="absolute right-3 top-3"><ProgressRing value={inst.progress} size={44} /></div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-white">{m.name}</h3>
            <p className="truncate font-mono text-[10px] text-slate-500">{m.id}</p>
          </div>
          <span className="shrink-0 rounded-md bg-white/[0.07] px-2 py-0.5 font-mono text-[11px] text-cyan-200">{m.params}</span>
        </div>

        <p className="mt-2.5 line-clamp-3 text-[13px] leading-relaxed text-slate-400">{m.blurb}</p>

        <div className="mt-3 flex items-center justify-between">
          <Stars value={m.rating} />
          <span className="font-mono text-[10px] text-slate-500">{m.downloads} downloads</span>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl border border-white/10 bg-black/30 p-2 text-center">
          <div>
            <p className="font-mono text-[11px] font-semibold text-white">{m.sizeGB.toFixed(1)} GB</p>
            <p className="text-[9px] uppercase tracking-wide text-slate-500">Download</p>
          </div>
          <div>
            <p className="font-mono text-[11px] font-semibold text-violet-200">{m.npuReady ? `${m.npuTps}/s` : '—'}</p>
            <p className="text-[9px] uppercase tracking-wide text-slate-500">On NPU</p>
          </div>
          <div>
            <p className="font-mono text-[11px] font-semibold text-slate-300">{m.cpuTps}/s</p>
            <p className="text-[9px] uppercase tracking-wide text-slate-500">On CPU</p>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          {!inst && (
            <Btn size="sm" className="flex-1" onClick={() => installModel(m)}>
              <Download className="h-3.5 w-3.5" /> Download
            </Btn>
          )}
          {inst?.status === 'downloading' && (
            <Btn size="sm" variant="subtle" className="flex-1" disabled>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> {Math.round(inst.progress)}%
            </Btn>
          )}
          {inst && inst.status !== 'downloading' && (
            <Btn size="sm" variant="subtle" className="flex-1" disabled>
              <Check className="h-3.5 w-3.5" /> Installed
            </Btn>
          )}
          <Btn size="sm" variant="outline" onClick={() => onOpen(m)}>Details</Btn>
        </div>
      </div>
    </GlassCard>
  );
};

const DetailModal: React.FC<{ m: ForgeModel; onClose: () => void }> = ({ m, onClose }) => {
  const { installModel, removeModel, isInstalled, setView } = useForge();
  const [quant, setQuant] = useState(m.quant);
  const installed = isInstalled(m.id);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md" onClick={onClose}>
      <GlassCard className="forge-pop max-h-[88vh] w-full max-w-2xl overflow-y-auto forge-scroll" glow>
        <div onClick={(e) => e.stopPropagation()}>
          <div className="relative h-40">
            <img src={m.thumb} alt="" className="h-full w-full rounded-t-2xl object-cover" />
            <div className="absolute inset-0 rounded-t-2xl bg-gradient-to-t from-[#0a0a18] to-transparent" />
            <button onClick={onClose} className="absolute right-3 top-3 rounded-lg bg-black/60 p-2 text-slate-300 hover:bg-black/80 hover:text-white">
              <X className="h-4 w-4" />
            </button>
            <div className="absolute bottom-3 left-5">
              <h2 className="text-2xl font-bold text-white">{m.name}</h2>
              <p className="font-mono text-[11px] text-slate-400">{m.id}</p>
            </div>
          </div>

          <div className="space-y-5 p-6">
            <div className="flex flex-wrap gap-2">
              {m.uncensored && <Badge tone="rose"><ShieldOff className="h-3 w-3" /> No refusals</Badge>}
              <Badge tone={m.npuReady ? 'emerald' : 'amber'}>{m.npuReady ? 'Runs on NPU' : 'Needs conversion'}</Badge>
              <Badge tone="violet">{m.category}</Badge>
              <Badge tone="cyan">{m.license}</Badge>
              <Badge>{m.ramGB} GB RAM</Badge>
            </div>

            <p className="text-sm leading-relaxed text-slate-300">{m.blurb}</p>

            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">What it&apos;s good at</h4>
              <div className="flex flex-wrap gap-2">
                {m.strengths.map((s) => (
                  <span key={s} className="rounded-lg border border-white/10 bg-white/[0.05] px-2.5 py-1 text-xs text-slate-200">{s}</span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Quality vs speed <HelpDot term="quant" />
              </h4>
              <div className="grid gap-2 sm:grid-cols-3">
                {['Q4_K_M', 'Q5_K_M', 'Q8_0'].map((q) => (
                  <button
                    key={q}
                    onClick={() => setQuant(q)}
                    className={cn(
                      'rounded-xl border p-3 text-left transition',
                      quant === q ? 'border-violet-400/60 bg-violet-500/15' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.07]'
                    )}
                  >
                    <p className="font-mono text-xs font-semibold text-white">{q}</p>
                    <p className="mt-0.5 text-[10px] text-slate-400">
                      {q === 'Q4_K_M' ? 'Smallest & fastest' : q === 'Q5_K_M' ? 'Sweet spot' : 'Best quality'}
                    </p>
                    <p className="mt-1 font-mono text-[10px] text-cyan-300">
                      {(m.sizeGB * (q === 'Q4_K_M' ? 1 : q === 'Q5_K_M' ? 1.18 : 1.62)).toFixed(1)} GB
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {!installed ? (
                <Btn onClick={() => { installModel(m, quant); onClose(); }}>
                  <Download className="h-4 w-4" /> Download {quant}
                </Btn>
              ) : (
                <>
                  <Btn onClick={() => { setView('chat'); onClose(); }}><Sparkles className="h-4 w-4" /> Chat with it</Btn>
                  <Btn variant="danger" onClick={() => { removeModel(m.id); onClose(); }}><Trash2 className="h-4 w-4" /> Delete</Btn>
                </>
              )}
              <Btn variant="outline" onClick={() => { setView('convert'); onClose(); }}>
                <Cpu className="h-4 w-4" /> Convert for NPU
              </Btn>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

const ModelLibrary: React.FC = () => {
  const { installModel, isInstalled, pushToast } = useForge();
  const [cat, setCat] = useState<'All' | ModelCategory>('All');
  const [q, setQ] = useState('');
  const [npuOnly, setNpuOnly] = useState(false);
  const [uncensoredOnly, setUncensoredOnly] = useState(true);
  const [sort, setSort] = useState<'rating' | 'size' | 'speed'>('rating');
  const [detail, setDetail] = useState<ForgeModel | null>(null);
  const [hfItems, setHfItems] = useState<HFItem[]>([]);
  const [hfLoading, setHfLoading] = useState(false);
  const [hfSearched, setHfSearched] = useState('');

  useEffect(() => {
    const handler = (e: Event) => setQ((e as CustomEvent).detail ?? '');
    window.addEventListener('forge-search', handler);
    return () => window.removeEventListener('forge-search', handler);
  }, []);

  const list = useMemo(() => {
    let out = CURATED_MODELS.filter((m) => (cat === 'All' || m.category === cat));
    if (npuOnly) out = out.filter((m) => m.npuReady);
    if (uncensoredOnly) out = out.filter((m) => m.uncensored);
    if (q.trim()) {
      const s = q.toLowerCase();
      out = out.filter((m) =>
        m.name.toLowerCase().includes(s) || m.id.toLowerCase().includes(s) ||
        m.blurb.toLowerCase().includes(s) || m.category.toLowerCase().includes(s)
      );
    }
    out = [...out].sort((a, b) =>
      sort === 'rating' ? b.rating - a.rating : sort === 'size' ? a.sizeGB - b.sizeGB : (b.npuTps || b.cpuTps) - (a.npuTps || a.cpuTps)
    );
    return out;
  }, [cat, q, npuOnly, uncensoredOnly, sort]);

  const searchHF = async () => {
    const term = q.trim() || 'abliterated';
    setHfLoading(true);
    setHfSearched(term);
    try {
      const { data, error } = await supabase.functions.invoke('hf-hub', {
        body: { kind: 'models', search: term, sort: 'downloads', limit: 12 }
      });
      if (error) throw error;
      setHfItems((data?.items ?? []) as HFItem[]);
      pushToast('Hugging Face searched', `${data?.items?.length ?? 0} live results for "${term}"`);
    } catch {
      pushToast('Could not reach Hugging Face', 'Check your internet connection and try again.');
    } finally {
      setHfLoading(false);
    }
  };

  const installFromHF = (item: HFItem) => {
    const guessSize = item.quantHints.some((h) => h.startsWith('Q8')) ? 7.6 : 4.6;
    const model: ForgeModel = {
      id: item.id,
      name: item.id.split('/')[1] ?? item.id,
      author: item.author,
      params: /(\d+(\.\d+)?)b/i.exec(item.id)?.[0]?.toUpperCase() ?? '7B',
      sizeGB: guessSize,
      quant: item.quantHints[0] ?? 'Q4_K_M',
      license: 'See model card',
      rating: Math.min(5, 3.6 + (item.likes / 900)),
      downloads: humanNum(item.downloads),
      npuReady: item.hasONNX,
      npuTps: item.hasONNX ? 38 : 0,
      cpuTps: 9,
      ramGB: 8,
      category: 'Chat',
      uncensored: /abliterat|uncensor|dolphin|lexi|unaligned/i.test(item.id),
      blurb: `Live from Hugging Face · ${humanNum(item.downloads)} downloads · ${item.likes} likes. ${item.hasONNX ? 'Already has an ONNX build, so the NPU can run it straight away.' : 'GGUF weights — run it through the Converter for NPU speed.'}`,
      strengths: item.tags.filter((t) => !t.includes(':')).slice(0, 3),
      thumb: CURATED_MODELS[Math.abs(item.id.length * 7) % CURATED_MODELS.length].thumb
    };
    installModel(model);
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Model Store"
        sub="Plain-English descriptions, one-click installs. Everything downloads straight to this PC and works offline forever."
        term="uncensored"
        right={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="h-9 rounded-xl border border-white/10 bg-white/[0.05] px-3 text-xs text-slate-200 focus:outline-none"
            >
              <option value="rating">Best rated first</option>
              <option value="size">Smallest download first</option>
              <option value="speed">Fastest first</option>
            </select>
            <Btn size="sm" variant="outline" onClick={searchHF} disabled={hfLoading}>
              {hfLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Globe className="h-3.5 w-3.5" />}
              Search all of Hugging Face
            </Btn>
          </div>
        }
      />

      <GlassCard className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder='Try "roleplay", "coding", "smallest", "dolphin"…'
              className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.05] pl-10 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-violet-400/50 focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setNpuOnly(!npuOnly)}
              className={cn('flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs transition',
                npuOnly ? 'border-emerald-400/50 bg-emerald-500/15 text-emerald-200' : 'border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]')}
            >
              <Cpu className="h-3.5 w-3.5" /> NPU ready only
            </button>
            <button
              onClick={() => setUncensoredOnly(!uncensoredOnly)}
              className={cn('flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs transition',
                uncensoredOnly ? 'border-rose-400/50 bg-rose-500/15 text-rose-200' : 'border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]')}
            >
              <ShieldOff className="h-3.5 w-3.5" /> Uncensored only
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2 border-t border-white/10 pt-3">
          <Filter className="mt-1.5 h-3.5 w-3.5 text-slate-500" />
          {MODEL_CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={cn('rounded-lg px-3 py-1.5 text-xs font-medium transition',
                cat === c ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white' : 'bg-white/[0.05] text-slate-300 hover:bg-white/[0.1]')}
            >
              {c}
            </button>
          ))}
          <span className="ml-auto self-center font-mono text-[11px] text-slate-500">{list.length} models</span>
        </div>
      </GlassCard>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {list.map((m) => <ModelCard key={m.id} m={m} onOpen={setDetail} />)}
      </div>

      {list.length === 0 && (
        <GlassCard className="p-10 text-center">
          <p className="text-sm text-slate-400">Nothing matched those filters. Try the Hugging Face live search above.</p>
        </GlassCard>
      )}

      {hfItems.length > 0 && (
        <div>
          <SectionTitle
            title={`Live from Hugging Face — "${hfSearched}"`}
            sub="Fetched in real time. One click installs it to C:\LocalForge\Models."
          />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {hfItems.map((it) => (
              <GlassCard key={it.id} className="flex flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{it.id.split('/')[1] ?? it.id}</p>
                    <p className="truncate font-mono text-[10px] text-slate-500">{it.author}</p>
                  </div>
                  {it.hasONNX ? <Badge tone="emerald">ONNX</Badge> : it.hasGGUF ? <Badge tone="cyan">GGUF</Badge> : <Badge>Safetensors</Badge>}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {it.quantHints.slice(0, 4).map((h) => (
                    <span key={h} className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[9px] text-slate-300">{h}</span>
                  ))}
                </div>
                <p className="mt-2 font-mono text-[10px] text-slate-500">
                  {humanNum(it.downloads)} downloads · {it.likes} likes
                </p>
                <Btn
                  size="sm"
                  className="mt-3"
                  variant={isInstalled(it.id) ? 'subtle' : 'primary'}
                  disabled={isInstalled(it.id)}
                  onClick={() => installFromHF(it)}
                >
                  {isInstalled(it.id) ? <><Check className="h-3.5 w-3.5" /> Installed</> : <><Download className="h-3.5 w-3.5" /> Install</>}
                </Btn>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      <GlassCard className="p-5">
        <h3 className="text-sm font-semibold text-white">Which file format should I pick?</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {PRECISION_OPTIONS.map((p) => (
            <div key={p.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <p className="text-xs font-semibold text-white">{p.label}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{p.hint}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-slate-500">
          Not sure? Leave everything as it is — the defaults are already tuned for a Snapdragon X Elite Extreme.
        </p>
      </GlassCard>

      {detail && <DetailModal m={detail} onClose={() => setDetail(null)} />}
    </div>
  );
};

export default ModelLibrary;
