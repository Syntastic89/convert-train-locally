import React from 'react';
import { HelpCircle } from 'lucide-react';
import { useForge } from '@/contexts/ForgeContext';
import { cn } from '@/lib/utils';

export const GlassCard: React.FC<{ className?: string; children: React.ReactNode; glow?: boolean }> = ({
  className, children, glow
}) => (
  <div
    className={cn(
      'relative rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl',
      'shadow-[0_8px_40px_-12px_rgba(0,0,0,0.8)]',
      glow && 'ring-1 ring-violet-500/30 shadow-[0_0_60px_-20px_rgba(139,92,246,0.6)]',
      className
    )}
  >
    {children}
  </div>
);

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'outline' | 'danger' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
};

export const Btn: React.FC<BtnProps> = ({ variant = 'primary', size = 'md', className, children, ...rest }) => {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60';
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2.5 text-sm', lg: 'px-6 py-3 text-base' };
  const variants = {
    primary:
      'bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-500 text-white hover:brightness-110 hover:shadow-[0_0_28px_-6px_rgba(139,92,246,0.8)] active:scale-[0.98]',
    outline: 'border border-white/15 bg-white/[0.03] text-slate-200 hover:bg-white/[0.09] hover:border-white/25',
    ghost: 'text-slate-300 hover:bg-white/[0.07] hover:text-white',
    subtle: 'bg-white/[0.07] text-slate-100 hover:bg-white/[0.12]',
    danger: 'bg-rose-600/90 text-white hover:bg-rose-500'
  };
  return (
    <button className={cn(base, sizes[size], variants[variant], className)} {...rest}>
      {children}
    </button>
  );
};

export const HelpDot: React.FC<{ term: string; className?: string }> = ({ term, className }) => {
  const { showGlossary } = useForge();
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); showGlossary(term); }}
      title="What does this mean?"
      className={cn(
        'inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-cyan-300/70 transition hover:text-cyan-200 hover:scale-125',
        className
      )}
    >
      <HelpCircle className="h-4 w-4" />
    </button>
  );
};

export const Badge: React.FC<{ children: React.ReactNode; tone?: 'violet' | 'cyan' | 'emerald' | 'amber' | 'slate' | 'rose'; className?: string }> = ({
  children, tone = 'slate', className
}) => {
  const tones = {
    violet: 'bg-violet-500/15 text-violet-200 border-violet-400/30',
    cyan: 'bg-cyan-500/15 text-cyan-200 border-cyan-400/30',
    emerald: 'bg-emerald-500/15 text-emerald-200 border-emerald-400/30',
    amber: 'bg-amber-500/15 text-amber-200 border-amber-400/30',
    rose: 'bg-rose-500/15 text-rose-200 border-rose-400/30',
    slate: 'bg-white/[0.06] text-slate-300 border-white/10'
  };
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider', tones[tone], className)}>
      {children}
    </span>
  );
};

export const ProgressRing: React.FC<{ value: number; size?: number; stroke?: number; label?: string }> = ({
  value, size = 56, stroke = 5, label
}) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (Math.min(100, Math.max(0, value)) / 100) * c;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.10)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke="url(#ringGrad)" strokeWidth={stroke} fill="none"
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.3s ease' }}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute font-mono text-[11px] font-semibold text-white">
        {label ?? `${Math.round(value)}%`}
      </span>
    </div>
  );
};

export const ShimmerBar: React.FC<{ value: number; className?: string; tone?: string }> = ({ value, className, tone }) => (
  <div className={cn('relative h-2 w-full overflow-hidden rounded-full bg-white/10', className)}>
    <div
      className={cn('h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 transition-all duration-300', tone)}
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    >
      <div className="h-full w-full animate-[shimmer_1.6s_infinite] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.55),transparent)] bg-[length:200%_100%]" />
    </div>
  </div>
);

export const Meter: React.FC<{
  label: string; value: number; unit?: string; term?: string; max?: number; accent?: string;
}> = ({ label, value, unit = '%', term, max = 100, accent = 'from-violet-500 to-cyan-400' }) => (
  <div>
    <div className="mb-1.5 flex items-center justify-between">
      <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
        {label} {term && <HelpDot term={term} />}
      </span>
      <span className="font-mono text-xs font-semibold text-white">
        {value.toFixed(unit === '%' ? 0 : 1)}{unit}
      </span>
    </div>
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
      <div
        className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-700', accent)}
        style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
      />
    </div>
  </div>
);

export const SectionTitle: React.FC<{ title: string; sub?: string; term?: string; right?: React.ReactNode }> = ({
  title, sub, term, right
}) => (
  <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
    <div>
      <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">
        {title} {term && <HelpDot term={term} className="h-5 w-5" />}
      </h2>
      {sub && <p className="mt-1 max-w-2xl text-sm text-slate-400">{sub}</p>}
    </div>
    {right}
  </div>
);

export const Stars: React.FC<{ value: number }> = ({ value }) => (
  <span className="inline-flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <svg key={i} viewBox="0 0 20 20" className={cn('h-3 w-3', i <= Math.round(value) ? 'fill-amber-400' : 'fill-white/15')}>
        <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9z" />
      </svg>
    ))}
    <span className="ml-1 font-mono text-[11px] text-slate-400">{value.toFixed(1)}</span>
  </span>
);
