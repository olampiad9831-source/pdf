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
 * Load PDF and extract page thumbnails with memory management
 */
export async function loadPDFPages(file: File): Promise<{
  pages: PDFPageInfo[];
  pdfDoc: pdfjsLib.PDFDocumentProxy;
}> {
  console.log('Loading PDF pages...');
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdfDoc.numPages;
  const pages: PDFPageInfo[] = [];

  console.log(`PDF has ${numPages} pages`);

  // Process pages in batches to manage memory
  const batchSize = 20;
  for (let batch = 0; batch < numPages; batch += batchSize) {
    const end = Math.min(batch + batchSize, numPages);
    
    for (let i = batch + 1; i <= end; i++) {
      const page = await pdfDoc.getPage(i);
      const viewport = page.getViewport({ scale: 0.3 }); // Smaller scale for thumbnails

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

      const thumbnail = canvas.toDataURL('image/jpeg', 0.6); // Use JPEG with compression
      const originalViewport = page.getViewport({ scale: 1 });

      pages.push({
        pageNumber: i,
        width: originalViewport.width,
        height: originalViewport.height,
        thumbnail,
        selected: true,
      });

      // Clean up
      page.cleanup();
    }
  }

  console.log('All pages loaded');
  return { pages, pdfDoc };
}

/**
 * Create a new PDF with only the selected pages
 * Optimized for large files
 */
export async function createFilteredPDF(
  originalFile: File,
  selectedPages: number[]
): Promise<Uint8Array> {
  console.log('Creating filtered PDF...');
  console.log('Selected pages:', selectedPages.length);
  
  const originalBytes = await originalFile.arrayBuffer();
  console.log('Original file loaded, size:', originalBytes.byteLength, 'bytes');
  
  const originalPdf = await PDFDocument.load(originalBytes, { 
    ignoreEncryption: true,
    updateMetadata: false 
  });
  console.log('Original PDF parsed');
  
  const newPdf = await PDFDocument.create();
  
  // Copy pages in batches to manage memory
  const batchSize = 50;
  for (let i = 0; i < selectedPages.length; i += batchSize) {
    const batch = selectedPages.slice(i, i + batchSize);
    const pageIndexes = batch.map(p => p - 1);
    
    console.log(`Copying batch ${Math.floor(i / batchSize) + 1}, pages:`, batch.length);
    
    const pages = await newPdf.copyPages(originalPdf, pageIndexes);
    
    for (const page of pages) {
      newPdf.addPage(page);
    }
  }

  console.log('All pages copied, saving...');
  const result = await newPdf.save({
    useObjectStreams: false, // Faster for large files
  });
  
  console.log('PDF saved, size:', result.length, 'bytes');
  return result;
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
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}
