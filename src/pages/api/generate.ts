import { APIRoute } from 'astro';
import { completeWithAnthropic, generatePrompt } from '@/utils/anthropic';
import type { ChatMessage } from '@/types';

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
