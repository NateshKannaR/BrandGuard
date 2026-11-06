import { NextRequest, NextResponse } from 'next/server';
import { evaluateImageCreative } from '@/lib/ai/vision';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No image file uploaded.' }, { status: 400 });
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'Image exceeds maximum size of 10MB.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    const result = await evaluateImageCreative(dataUrl, file.name, file.type);

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Visual review error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
