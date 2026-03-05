import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { question, context } = await request.json();

    console.log('API Key present:', !!process.env.ANTHROPIC_API_KEY);
    console.log('Question:', question);

    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: `You are a trusted global health intelligence assistant. Answer this question about a health event clearly and concisely in 2-3 sentences. Be informative but not alarmist.

Health event context:
- Name: ${context.name}
- Location: ${context.location}
- Severity: ${context.severity}
- Key stat: ${context.keyStat}
- Source: ${context.source}

User question: ${question}`,
        },
      ],
    });

    const response = message.content[0].type === 'text' ? message.content[0].text : '';
    return NextResponse.json({ response });
  } catch (error) {
    console.error('Explain error:', error);
    return NextResponse.json({ response: 'Unable to get explanation right now.' }, { status: 500 });
  }
}