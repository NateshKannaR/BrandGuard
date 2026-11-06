import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/storage/repository';

export async function GET() {
  try {
    const users = repository.getUsers();
    const currentUser = repository.getCurrentUser();
    return NextResponse.json({ success: true, data: { users, currentUser } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = body;
    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }
    const updated = repository.setCurrentUser(userId);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
