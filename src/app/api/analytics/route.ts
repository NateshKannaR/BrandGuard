import { NextResponse } from 'next/server';
import { repository } from '@/lib/storage/repository';

export async function GET() {
  try {
    const metrics = repository.getMetrics();
    return NextResponse.json({ success: true, data: metrics });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
