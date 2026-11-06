import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';

export interface ParsedDocument {
  text: string;
  filename: string;
  wordCount: number;
  mimeType: string;
}

export async function parseDocumentFile(file: File | Blob, filename: string): Promise<ParsedDocument> {
  const extension = filename.split('.').pop()?.toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());

  // 10MB safety threshold
  if (buffer.length > 10 * 1024 * 1024) {
    throw new Error('File exceeds maximum supported size of 10MB.');
  }

  let text = '';

  if (extension === 'txt' || extension === 'md') {
    text = buffer.toString('utf-8');
  } else if (extension === 'docx') {
    const result = await mammoth.extractRawText({ buffer });
    text = result.value;
  } else if (extension === 'pdf') {
    const pdfData = await pdfParse(buffer);
    text = pdfData.text;
  } else {
    throw new Error(`Unsupported document extension .${extension}. Please upload TXT, PDF, or DOCX.`);
  }

  // Sanitize text and remove any null bytes
  text = text.replace(/\0/g, '').trim();

  const words = text.split(/\s+/).filter((w) => w.length > 0);

  return {
    text,
    filename,
    wordCount: words.length,
    mimeType: file.type || 'text/plain',
  };
}
