import React, { useState } from 'react';
import { Bell, Check, Loader2 } from 'lucide-react';
import { GlassCard, Btn } from '@/components/forge/ui';
import { useForge } from '@/contexts/ForgeContext';

const CRM_URL = 'https://famous.ai/api/crm/6a685d97f47329210cafd2c9/subscribe';

const UpdatesSignup: React.FC<{ compact?: boolean }> = ({ compact }) => {
  const { pushToast } = useForge();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [sms, setSms] = useState(true);
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setState('sending');
    try {
      await fetch(CRM_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || undefined,
          phone: phone.trim() || undefined,
          sms_opt_in: sms === true,
          source: 'app-model-drop-alerts',
          tags: ['newsletter', 'localforge-npu', 'uncensored-model-drops']
        })
      });
      setState('done');
      pushToast('You are on the list', 'We will ping you the moment new uncensored NPU builds land.');
    } catch {
      setState('done');
    }
  };

  if (state === 'done') {
    return (
      <GlassCard className="p-6 text-center">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/20">
          <Check className="h-5 w-5 text-emerald-300" />
        </div>
        <h3 className="text-lg font-semibold text-white">You&apos;re subscribed</h3>
        <p className="mx-auto mt-1 max-w-md text-sm text-slate-400">
          New uncensored model drops, NPU speed-ups and one-click ONNX bundles will arrive in your inbox
          {sms && phone.trim() ? ' and by text' : ''}.
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="overflow-hidden">
      <div className="border-b border-white/10 bg-gradient-to-r from-violet-600/15 to-cyan-500/10 px-6 py-4">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-violet-300" />
          <h3 className="text-base font-semibold text-white">New model drop alerts</h3>
        </div>
        <p className="mt-1 text-sm text-slate-400">
          Get told first when a fresh uncensored model gets an NPU-ready ONNX build. No spam, unsubscribe any time.
        </p>
      </div>
      <form onSubmit={submit} className="space-y-3 p-6">
        <div className={compact ? 'space-y-3' : 'grid gap-3 sm:grid-cols-3'}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="First name"
            className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.05] px-3 text-sm text-white placeholder:text-slate-500 focus:border-violet-400/50 focus:outline-none"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            required
            className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.05] px-3 text-sm text-white placeholder:text-slate-500 focus:border-violet-400/50 focus:outline-none"
          />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone number (optional)"
            className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.05] px-3 text-sm text-white placeholder:text-slate-500 focus:border-violet-400/50 focus:outline-none"
          />
        </div>
        <label className="flex cursor-pointer items-start gap-2.5 text-[11px] leading-relaxed text-slate-400">
          <input
            type="checkbox"
            checked={sms}
            onChange={(e) => setSms(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-white/10 accent-violet-500"
          />
          <span>Text me updates. Msg &amp; data rates may apply. Reply STOP to unsubscribe.</span>
        </label>
        {error && <p className="text-xs text-rose-300">{error}</p>}
        <Btn type="submit" disabled={state === 'sending'} className="w-full sm:w-auto">
          {state === 'sending' ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing you up…</> : 'Keep me posted'}
        </Btn>
      </form>
    </GlassCard>
  );
};

export default UpdatesSignup;
