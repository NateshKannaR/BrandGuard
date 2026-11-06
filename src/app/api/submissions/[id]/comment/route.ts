import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/storage/repository';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { text, userId, issueId } = body;

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Comment text is required' }, { status: 400 });
    }

    const user = userId
      ? repository.getUsers().find((u) => u.id === userId) || repository.getCurrentUser()
      : repository.getCurrentUser();

    const updated = repository.addComment(params.id, text.trim(), user, issueId);

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Submission not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
