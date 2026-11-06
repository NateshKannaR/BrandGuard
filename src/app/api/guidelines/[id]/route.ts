import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/storage/repository';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const guideline = repository.getGuideline(params.id);
    if (!guideline) {
      return NextResponse.json({ success: false, error: 'Guideline not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: guideline });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const updated = repository.updateGuideline(params.id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Guideline not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const success = repository.deleteGuideline(params.id);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Guideline not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Guideline deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
