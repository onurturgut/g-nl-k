import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'nodejs';

function fallbackReport(payload: { tasks?: Array<{ status?: string }>; notes?: unknown[] }) {
  const tasks = payload.tasks || [];
  const completed = tasks.filter((task) => task.status === 'completed').length;
  const pct = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  return [
    `Bu hafta ${tasks.length} görevden ${completed} tanesi tamamlandı. Tamamlama oranı %${pct}.`,
    `Not arşivinde bu hafta ${payload.notes?.length || 0} tarihli not var.`,
    'Önümüzdeki hafta için en iyi adım: görev sayısını gerçekçi tutup her güne 1 ana öncelik yazmak.',
  ].join('\n\n');
}

export async function POST(request: NextRequest) {
  const payload = await request.json();

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ report: fallbackReport(payload), source: 'fallback' });
  }

  const client = new OpenAI();
  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || 'gpt-5',
    input: [
      'Sen üretkenlik koçu gibi davran. Kullanıcının haftalık görev, not ve günlük verisinden kısa, uygulanabilir Türkçe rapor hazırla.',
      'Format: 1 kısa özet, 3 güçlü içgörü, 3 net öneri. Abartma, veri yoksa bunu söyle.',
      JSON.stringify(payload),
    ].join('\n\n'),
  });

  return NextResponse.json({ report: response.output_text, source: 'openai' });
}
