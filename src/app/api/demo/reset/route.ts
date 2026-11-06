import { NextResponse } from 'next/server';
import { repository } from '@/lib/storage/repository';

export async function POST() {
  try {
    repository.resetToDemoData();
    return NextResponse.json({ success: true, message: 'Reset to pristine NovaTech demo state.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
