import { APIRoute } from 'astro';
import type { ChatMessage } from '@/types';

const apiKey = import.meta.env.ANTHROPIC_API_KEY;
const model = import.meta.env.ANTHROPIC_API_MODEL || 'claude-v1';

export const generatePrompt = (messages: ChatMessage[]): string => {
  let prompt = "";
  messages.forEach(message => {
    prompt += `\n\n${message.role === 'user' ? 'Human' : 'Assistant'}: ${message.content}`;
  });
  prompt += `\n\nAssistant:`;
  return prompt;
};

const completeWithAnthropic = async (prompt: string) => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        prompt,
        model,
        stop_sequences: ['Human'],
        max_tokens_to_sample: 200,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.completion;
  } catch (error) {
    console.error("Anthropic API Error: ", error);
    throw error;
  }
};

export const post: APIRoute = async (context) => {
  try {
    const body = await context.request.json();
    const messages: ChatMessage[] = body.messages;
    const prompt = generatePrompt(messages);

    const completion = await completeWithAnthropic(prompt);
    return {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        completion,
      }),
    };
  } catch (error) {
    console.error("Anthropic API Error: ", error);
    return {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: {
          code: error.name,
          message: error.message,
        },
      }),
    };
  }
};
