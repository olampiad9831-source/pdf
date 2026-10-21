import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export interface PDFPageInfo {
  pageNumber: number;
  width: number;
  height: number;
  thumbnail: string;
  selected: boolean;
}

/**
 * Load PDF and extract page thumbnails
 */
export async function loadPDFPages(file: File): Promise<{
  pages: PDFPageInfo[];
  pdfDoc: pdfjsLib.PDFDocumentProxy;
}> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdfDoc.numPages;
  const pages: PDFPageInfo[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale: 0.5 });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await (page.render({
      canvasContext: ctx as unknown as CanvasRenderingContext2D,
      viewport,
    } as Parameters<typeof page.render>[0]).promise);

    const thumbnail = canvas.toDataURL('image/png');
    const originalViewport = page.getViewport({ scale: 1 });

    pages.push({
      pageNumber: i,
      width: originalViewport.width,
      height: originalViewport.height,
      thumbnail,
      selected: true,
    });

    page.cleanup();
  }

  return { pages, pdfDoc };
}

/**
 * Create a new PDF with only the selected pages
 */
export async function createFilteredPDF(
  originalFile: File,
  selectedPages: number[]
): Promise<Uint8Array> {
  const originalBytes = await originalFile.arrayBuffer();
  const originalPdf = await PDFDocument.load(originalBytes);
  const newPdf = await PDFDocument.create();

  const pages = await newPdf.copyPages(originalPdf, selectedPages.map(p => p - 1));
  
  for (const page of pages) {
    newPdf.addPage(page);
  }

  return await newPdf.save();
}

/**
 * Generate a preview blob URL for the filtered PDF
 */
export function createPreviewUrl(pdfBytes: Uint8Array): string {
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
  return URL.createObjectURL(blob);
}

/**
 * Download the filtered PDF
 */
export function downloadPDF(pdfBytes: Uint8Array, filename: string): void {
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
