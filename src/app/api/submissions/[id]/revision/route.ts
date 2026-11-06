import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/storage/repository';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { content, changeSummary, authorName } = body;

    if (!content) {
      return NextResponse.json({ success: false, error: 'Revision content is required' }, { status: 400 });
    }

    const author = authorName || repository.getCurrentUser().name;
    const summary = changeSummary || 'Applied AI correction suggestions';

    const updated = repository.addRevision(params.id, content, summary, author);

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Submission not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
