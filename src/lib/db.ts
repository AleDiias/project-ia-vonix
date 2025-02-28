
import { supabase } from './supabase';
import { ChatMessage } from './api';

export async function createChat(title: string) {
  const { data, error } = await supabase
    .from('chats')
    .insert([{ title }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getChatHistory() {
  const { data, error } = await supabase
    .from('chats')
    .select('*')
    .eq('archived', false)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getChatMessages(chatId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('role, content, created_at')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

export async function saveMessage(chatId: string, message: ChatMessage) {
  const { data, error } = await supabase
    .from('messages')
    .insert([{
      chat_id: chatId,
      content: message.content,
      role: message.role
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function archiveChat(chatId: string) {
  const { data, error } = await supabase
    .from('chats')
    .update({ archived: true })
    .eq('id', chatId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteChat(chatId: string) {
  const { error } = await supabase
    .from('chats')
    .delete()
    .eq('id', chatId);

  if (error) throw error;
}

export async function updateChatTitle(chatId: string, title: string) {
  const { data, error } = await supabase
    .from('chats')
    .update({ title })
    .eq('id', chatId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
