import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/storage/repository';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const submission = repository.getSubmission(params.id);
    if (!submission) {
      return NextResponse.json({ success: false, error: 'Submission not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: submission });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const updated = repository.updateSubmission(params.id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Submission not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
