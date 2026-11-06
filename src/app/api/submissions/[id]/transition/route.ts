import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/storage/repository';
import { SubmissionStatus } from '@/types';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { status, reason, reviewerId } = body;

    if (!status) {
      return NextResponse.json({ success: false, error: 'Status is required' }, { status: 400 });
    }

    const reviewer = reviewerId
      ? repository.getUsers().find((u) => u.id === reviewerId)
      : repository.getCurrentUser();

    const updated = repository.transitionStatus(params.id, status as SubmissionStatus, reviewer, reason);

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Submission not found' }, { status: 404 });
    }

    // If reason was provided, also record as review comment
    if (reason && reviewer) {
      repository.addComment(params.id, `Status changed to ${status}: ${reason}`, reviewer);
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
