import { supabase } from '@/lib/supabase';

// A stable per-install key so history survives app restarts without any login.
const DEVICE_LS = 'localforge-device-key';

export const getDeviceKey = (): string => {
  try {
    let k = localStorage.getItem(DEVICE_LS);
    if (!k) {
      k = `dev-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
      localStorage.setItem(DEVICE_LS, k);
    }
    return k;
  } catch {
    return 'dev-fallback';
  }
};

export interface Conversation {
  id: string;
  title: string;
  model_id: string | null;
  model_name: string | null;
  pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface StoredMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  tps: number | null;
  created_at: string;
}

export const titleFromText = (text: string) => {
  const t = text.replace(/\s+/g, ' ').trim();
  return (t.length > 48 ? `${t.slice(0, 48)}…` : t) || 'New chat';
};

export const listConversations = async (): Promise<Conversation[]> => {
  const { data, error } = await supabase
    .from('forge_conversations')
    .select('*')
    .eq('device_key', getDeviceKey())
    .order('pinned', { ascending: false })
    .order('updated_at', { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data ?? []) as Conversation[];
};

export const listMessages = async (conversationId: string): Promise<StoredMessage[]> => {
  const { data, error } = await supabase
    .from('forge_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as StoredMessage[];
};

export const createConversation = async (
  title: string,
  modelId?: string | null,
  modelName?: string | null
): Promise<Conversation | null> => {
  const { data, error } = await supabase
    .from('forge_conversations')
    .insert({ device_key: getDeviceKey(), title, model_id: modelId ?? null, model_name: modelName ?? null })
    .select()
    .single();
  if (error) throw error;
  return (data ?? null) as Conversation | null;
};

export const addMessage = async (
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
  tps?: number
) => {
  await supabase.from('forge_messages').insert({
    conversation_id: conversationId,
    device_key: getDeviceKey(),
    role,
    content,
    tps: tps ?? null
  });
  await supabase
    .from('forge_conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId);
};

export const renameConversation = async (id: string, title: string) => {
  await supabase.from('forge_conversations').update({ title, updated_at: new Date().toISOString() }).eq('id', id);
};

export const setPinned = async (id: string, pinned: boolean) => {
  await supabase.from('forge_conversations').update({ pinned }).eq('id', id);
};

export const deleteConversation = async (id: string) => {
  await supabase.from('forge_messages').delete().eq('conversation_id', id);
  await supabase.from('forge_conversations').delete().eq('id', id);
};

export const exportMarkdown = (conv: Conversation, msgs: { role: string; content: string; tps?: number | null }[]) => {
  const lines = [
    `# ${conv.title}`,
    '',
    `- Model: ${conv.model_name ?? 'unknown'} (${conv.model_id ?? 'n/a'})`,
    `- Started: ${new Date(conv.created_at).toLocaleString()}`,
    `- Exported from LocalForge NPU (offline)`,
    '',
    '---',
    ''
  ];
  for (const m of msgs) {
    lines.push(m.role === 'user' ? '**You**' : `**${conv.model_name ?? 'Model'}**`);
    lines.push('');
    lines.push(m.content);
    lines.push('');
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${conv.title.replace(/[^\w\-]+/g, '-').slice(0, 40) || 'chat'}.md`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
};
