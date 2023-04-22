import { APIRoute } from 'astro';
import { generatePrompt } from '@/utils/anthropic';
import type { ChatMessage } from '@/types';

const apiKey = import.meta.env.ANTHROPIC_API_KEY;
const model = import.meta.env.ANTHROPIC_API_MODEL || 'claude-v1';

export const post: APIRoute = async (context) => {
  try {
    const body = await context.request.json();
    const messages: ChatMessage[] = body.messages;
    const prompt = generatePrompt(messages);

    const completion = await completeWithAnthropic(prompt);
    return new Response(JSON.stringify({
      completion,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error("Anthropic API Error: ", error);
    return new Response(JSON.stringify({
      error: {
        code: error.name,
        message: error.message,
      },
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

const completeWithAnthropic = async (prompt: string) => {
  try {
    const response = await fetch('https://api.anthropic.com/complete', {
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
