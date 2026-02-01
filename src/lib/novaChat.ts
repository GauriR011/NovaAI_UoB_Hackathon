import { supabase } from './supabase';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface NovaResponse {
  response: string;
  debug?: {
    chunksUsed: number;
    model: string;
  };
  error?: string;
}

export async function sendMessageToNova(
  message: string,
  conversationHistory: ChatMessage[] = []
): Promise<NovaResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('nova-chat', {
      body: {
        message,
        conversationHistory
      }
    });

    if (error) {
      console.error('Supabase function error:', error);
      return {
        response: "I'm having trouble connecting right now. Please try again in a moment.",
        error: error.message
      };
    }

    return data as NovaResponse;
  } catch (err) {
    console.error('Nova chat error:', err);
    return {
      response: "Something went wrong. Please try again.",
      error: err instanceof Error ? err.message : 'Unknown error'
    };
  }
}

export function formatConversationHistory(
  messages: Array<{ type: 'user' | 'ai'; content: string }>
): ChatMessage[] {
  return messages
    .filter(msg => msg.type === 'user' || msg.type === 'ai')
    .map(msg => ({
      role: msg.type === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));
}
