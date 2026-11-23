import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/storage/repository';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const creatorId = searchParams.get('creatorId') || undefined;
    const query = searchParams.get('q') || undefined;

    const submissions = repository.listSubmissions({ status, creatorId, query });
    return NextResponse.json({ success: true, count: submissions.length, data: submissions });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (typeof body.title !== 'string' || !body.title.trim() || typeof body.rawText !== 'string' || !body.rawText.trim() || (body.currentText !== undefined && (typeof body.currentText !== 'string' || !body.currentText.trim()))) {
      return NextResponse.json(
        { success: false, error: 'Title and content text are required.' },
        { status: 400 }
      );
    }

    const submission = repository.createSubmission({
      title: body.title,
      contentType: body.contentType || 'General promotional content',
      rawText: body.rawText,
      currentText: body.currentText,
      reviewCategories: body.reviewCategories || ['Tone of Voice', 'Terminology', 'Approved Facts'],
      latestReview: body.latestReview,
      reviewerNote: typeof body.reviewerNote === 'string' ? body.reviewerNote : undefined,
    });

    return NextResponse.json({ success: true, data: submission }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
