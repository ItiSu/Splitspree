import { aiChatAssistant } from '@/ai/flows/ai-chat-assistant';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { command, users, items } = await request.json();
    const result = await aiChatAssistant({ command, users, items });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
