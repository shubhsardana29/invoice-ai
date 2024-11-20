import { FileProcessingError } from './errors';

export async function readFileAsBase64(file: File): Promise<{ mimeType: string; data: string }> {
  try {
    if (file.size === 0) {
      throw new FileProcessingError('File is empty', file.name);
    }

    if (file.size > 20 * 1024 * 1024) {
      throw new FileProcessingError('File size exceeds maximum limit of 20MB', file.name);
    }

    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);
    const binary = uint8Array.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
    const base64 = btoa(binary);

    const mimeType = getMimeType(file);
    return { mimeType, data: base64 };
  } catch (error) {
    if (error instanceof FileProcessingError) throw error;
    throw new FileProcessingError(`Failed to read file: ${error.message}`, file.name);
  }
}

function getMimeType(file: File): string {
  if (file.type) return file.type;

  const extension = file.name.toLowerCase().split('.').pop();
  const mimeTypes: Record<string, string> = {
    pdf: 'application/pdf',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    xls: 'application/vnd.ms-excel',
    txt: 'text/plain',
    csv: 'text/csv',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  };

  const mimeType = mimeTypes[extension || ''];
  if (!mimeType) {
    throw new FileProcessingError('Unsupported file type', file.name);
  }

  return mimeType;
}