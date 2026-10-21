import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

// Configure PDF.js worker - use unpkg for exact version match
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface ProcessingInfo {
  state: 'idle' | 'loading-pdf' | 'rendering' | 'ocr' | 'done' | 'error';
  currentPage: number;
  totalPages: number;
  progress: number;
  message: string;
}

type ProgressCallback = (info: ProcessingInfo) => void;

/**
 * Preprocess image for better OCR accuracy
 * Applies contrast enhancement and sharpening
 */
function preprocessImage(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Apply contrast enhancement and binarization for better OCR
  const contrast = 1.5;
  const brightness = 10;

  for (let i = 0; i < data.length; i += 4) {
    // Convert to grayscale
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;

    // Apply brightness
    let adjusted = gray + brightness;

    // Apply contrast
    adjusted = ((adjusted - 128) * contrast) + 128;

    // Clamp values
    adjusted = Math.max(0, Math.min(255, adjusted));

    // Apply adaptive thresholding (Otsu-like)
    const threshold = 140;
    const finalValue = adjusted > threshold ? 255 : 0;

    data[i] = finalValue;
    data[i + 1] = finalValue;
    data[i + 2] = finalValue;
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/**
 * Render a single PDF page to a high-quality canvas
 */
async function renderPageToCanvas(
  page: pdfjsLib.PDFPageProxy,
  scale: number
): Promise<HTMLCanvasElement> {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  // Set canvas dimensions
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  // White background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Render PDF page
  const renderTask = page.render({
    canvasContext: ctx as unknown as CanvasRenderingContext2D,
    viewport,
  } as Parameters<typeof page.render>[0]);
  await renderTask.promise;

  return canvas;
}

/**
 * Main function to extract text from PDF using OCR
 */
export async function extractTextFromPDF(
  file: File,
  language: string,
  renderScale: number,
  onProgress: ProgressCallback
): Promise<string> {
  // Step 1: Load PDF
  onProgress({
    state: 'loading-pdf',
    currentPage: 0,
    totalPages: 0,
    progress: 5,
    message: 'در حال بارگذاری PDF...',
  });

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const totalPages = pdf.numPages;

  onProgress({
    state: 'loading-pdf',
    currentPage: 0,
    totalPages,
    progress: 10,
    message: `PDF با ${totalPages} صفحه بارگذاری شد`,
  });

  let fullText = '';

  // Step 2: Process each page
  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    // Render page
    onProgress({
      state: 'rendering',
      currentPage: pageNum,
      totalPages,
      progress: ((pageNum - 1) / totalPages) * 100,
      message: `در حال رندر صفحه ${pageNum} از ${totalPages}...`,
    });

    const page = await pdf.getPage(pageNum);
    let canvas = await renderPageToCanvas(page, renderScale);

    // Apply preprocessing for better OCR accuracy
    canvas = preprocessImage(canvas);

    // Convert canvas to data URL
    const imageDataUrl = canvas.toDataURL('image/png');

    // Step 3: OCR
    onProgress({
      state: 'ocr',
      currentPage: pageNum,
      totalPages,
      progress: ((pageNum - 1) / totalPages) * 100,
      message: `در حال OCR صفحه ${pageNum} از ${totalPages}...`,
    });

    try {
      const result = await Tesseract.recognize(imageDataUrl, language, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            const pageProgress = ((pageNum - 1 + m.progress) / totalPages) * 100;
            onProgress({
              state: 'ocr',
              currentPage: pageNum,
              totalPages,
              progress: pageProgress,
              message: `در حال شناسایی متن صفحه ${pageNum}... (${Math.round(m.progress * 100)}%)`,
            });
          }
        },
      });

      const pageText = result.data.text.trim();

      if (pageText) {
        fullText += `\n--- صفحه ${pageNum} ---\n\n${pageText}\n`;
      }
    } catch (error) {
      console.error(`Error OCR on page ${pageNum}:`, error);
      fullText += `\n--- صفحه ${pageNum} ---\n\n[خطا در شناسایی متن این صفحه]\n`;
    }

    // Clean up
    page.cleanup();
  }

  onProgress({
    state: 'done',
    currentPage: totalPages,
    totalPages,
    progress: 100,
    message: 'استخراج متن با موفقیت انجام شد!',
  });

  return fullText.trim();
}
