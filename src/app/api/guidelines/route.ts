import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/storage/repository';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const query = searchParams.get('q') || undefined;
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const guidelines = repository.listGuidelines({ category, query, activeOnly });
    return NextResponse.json({ success: true, count: guidelines.length, data: guidelines });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.title || !body.category || !body.rule) {
      return NextResponse.json(
        { success: false, error: 'Title, category, and rule are required.' },
        { status: 400 }
      );
    }

    const created = repository.createGuideline({
      title: body.title,
      category: body.category,
      rule: body.rule,
      description: body.description || '',
      sourceDocument: body.sourceDocument || 'Direct Entry',
      sourceExcerpt: body.sourceExcerpt || '',
      isActive: body.isActive !== undefined ? body.isActive : true,
      examples: body.examples || { approved: [], prohibited: [] },
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
