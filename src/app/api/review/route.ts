import { NextRequest, NextResponse } from 'next/server';
import { evaluateContentWithAI } from '@/lib/ai/provider';
import { ContentType, GuidelineCategory } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { content, contentType, categories } = body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Content text is required for review.' },
        { status: 400 }
      );
    }

    const validContentType: ContentType = contentType || 'Marketing document';
    const validCategories: GuidelineCategory[] =
      categories && Array.isArray(categories) && categories.length > 0
        ? categories
        : ['Tone of Voice', 'Terminology', 'Approved Facts', 'Promotional Claims'];

    const result = await evaluateContentWithAI(content, validContentType, validCategories);

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Review API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
