import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { age, location, conditions, lifestyle } = await request.json();

    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: `You are a trusted personal health intelligence assistant. Generate a concise, personalized health brief for this person based on current global health events. Be warm, clear, and actionable. Never be alarmist. Format with clear sections.

Person profile:
- Age: ${age || 'Not specified'}
- Location: ${location || 'Not specified'}
- Health conditions: ${conditions.length > 0 ? conditions.join(', ') : 'None specified'}
- Lifestyle factors: ${lifestyle.length > 0 ? lifestyle.join(', ') : 'None specified'}

Current global health context (March 2026):
- Nipah virus outbreak in Kerala, India (40-75% fatality, no vaccine)
- H5N1 avian flu in US dairy farms (3 human cases)
- Dengue at record levels in Brazil
- MERS-CoV cases in Saudi Arabia
- Psilocybin Phase 3 trial shows 67% remission in treatment-resistant depression
- GLP-1 drugs showing cardiovascular benefits beyond diabetes
- mRNA malaria vaccine shows 77% efficacy in Africa

Generate a personal health brief with these sections:
1. YOUR RISK LEVEL — based on their location and conditions
2. WHAT TO WATCH — 2-3 specific things relevant to them
3. WHAT'S GOOD NEWS FOR YOU — breakthroughs relevant to their conditions
4. YOUR ACTION ITEMS — 2-3 practical steps

Keep it under 300 words. Be specific to their profile.`,
        },
      ],
    });

    const brief = message.content[0].type === 'text' ? message.content[0].text : '';
    return NextResponse.json({ brief });
  } catch (error) {
    console.error('MyHealth error:', error);
    return NextResponse.json({ brief: 'Unable to generate your health brief right now. Please try again.' }, { status: 500 });
  }
}
