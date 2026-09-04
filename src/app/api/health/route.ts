import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ ok: false, database: 'not_configured' }, { status: 503 });
  }

  try {
    await prisma.$runCommandRaw({ ping: 1 });
    return NextResponse.json({ ok: true, database: 'connected' });
  } catch (error) {
    console.error('Database health check failed:', error);
    return NextResponse.json({ ok: false, database: 'unreachable' }, { status: 503 });
  }
}