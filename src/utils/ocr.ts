import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export interface ProcessingInfo {
  state: 'idle' | 'loading-pdf' | 'rendering' | 'ocr' | 'post-processing' | 'done' | 'error';
  currentPage: number;
  totalPages: number;
  progress: number;
  message: string;
  estimatedTimeRemaining: number | null; // in seconds
  elapsedTime: number; // in seconds
}

type ProgressCallback = (info: ProcessingInfo) => void;

/**
 * Preprocess image for better OCR accuracy
 * Enhanced for mathematical formulas
 */
function preprocessImage(canvas: HTMLCanvasElement, enhanceMath: boolean = true): HTMLCanvasElement {
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Enhanced preprocessing for math formulas
  const contrast = enhanceMath ? 1.8 : 1.5;
  const brightness = enhanceMath ? 5 : 10;

  // First pass: calculate statistics for adaptive thresholding
  let sumGray = 0;
  let sumGraySq = 0;
  const pixelCount = data.length / 4;
  const grayValues: number[] = [];

  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    grayValues.push(gray);
    sumGray += gray;
    sumGraySq += gray * gray;
  }

  // Otsu's method for optimal threshold
  const meanGray = sumGray / pixelCount;
  const variance = (sumGraySq / pixelCount) - (meanGray * meanGray);
  const stdDev = Math.sqrt(variance);
  
  // Adaptive threshold based on image statistics
  const adaptiveThreshold = meanGray + (stdDev * 0.3);

  // Second pass: apply enhancement
  for (let i = 0; i < data.length; i += 4) {
    let gray = grayValues[i / 4];

    // Apply brightness
    gray = gray + brightness;

    // Apply contrast
    gray = ((gray - 128) * contrast) + 128;

    // Clamp
    gray = Math.max(0, Math.min(255, gray));

    // Adaptive binarization
    const finalValue = gray > adaptiveThreshold ? 255 : 0;

    data[i] = finalValue;
    data[i + 1] = finalValue;
    data[i + 2] = finalValue;
  }

  // Edge enhancement for math symbols (dilation-like effect)
  if (enhanceMath) {
    const tempData = new Uint8ClampedArray(data);
    const width = canvas.width;
    const height = canvas.height;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        if (tempData[idx] === 0) { // Black pixel
          // Check neighbors and slightly thicken
          const neighbors = [
            ((y - 1) * width + x) * 4,
            ((y + 1) * width + x) * 4,
            (y * width + (x - 1)) * 4,
            (y * width + (x + 1)) * 4,
          ];
          
          for (const nIdx of neighbors) {
            if (tempData[nIdx] === 255) {
              // Light gray neighbor - make it slightly darker for better edge
              data[nIdx] = 180;
              data[nIdx + 1] = 180;
              data[nIdx + 2] = 180;
            }
          }
        }
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/**
 * Post-process OCR text to fix common math symbol issues
 */
function postProcessMathText(text: string): string {
  let processed = text;

  // Common math symbol corrections
  const mathReplacements: [RegExp, string][] = [
    [/\s*([+\-*/=<>!])\s*/g, ' $1 '], // Space around operators
    [/(\d)\s*([+\-*/=<>!])\s*(\d)/g, '$1 $2 $3'], // Ensure spacing around operators
    [/\^(\d)/g, '^$1'], // Superscript notation
    [/sqrt\s*\(([^)]+)\)/g, '√($1)'], // Square root
    [/sum\s*\(([^)]+)\)/g, 'Σ($1)'], // Summation
    [/int\s*\(([^)]+)\)/g, '∫($1)'], // Integral
    [/pi\b/g, 'π'],
    [/theta\b/g, 'θ'],
    [/alpha\b/g, 'α'],
    [/beta\b/g, 'β'],
    [/gamma\b/g, 'γ'],
    [/delta\b/g, 'δ'],
    [/epsilon\b/g, 'ε'],
    [/lambda\b/g, 'λ'],
    [/sigma\b/g, 'σ'],
    [/omega\b/g, 'ω'],
    [/infinity\b/g, '∞'],
    [/\bneq\b/g, '≠'],
    [/\bleq\b/g, '≤'],
    [/\bgeq\b/g, '≥'],
    [/\bapprox\b/g, '≈'],
    [/\btimes\b/g, '×'],
    [/\bdiv\b/g, '÷'],
    [/\bpm\b/g, '±'],
  ];

  for (const [pattern, replacement] of mathReplacements) {
    processed = processed.replace(pattern, replacement);
  }

  return processed;
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

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const renderTask = page.render({
    canvasContext: ctx as unknown as CanvasRenderingContext2D,
    viewport,
  } as Parameters<typeof page.render>[0]);
  await renderTask.promise;

  return canvas;
}

/**
 * Calculate estimated time remaining based on completed pages
 */
function calculateEstimatedTime(
  completedPages: number,
  totalPages: number,
  startTime: number
): number | null {
  if (completedPages < 1) return null;
  
  const elapsedMs = Date.now() - startTime;
  const avgTimePerPage = elapsedMs / completedPages;
  const remainingPages = totalPages - completedPages;
  
  return Math.round((avgTimePerPage * remainingPages) / 1000);
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
  const startTime = Date.now();

  onProgress({
    state: 'loading-pdf',
    currentPage: 0,
    totalPages: 0,
    progress: 2,
    message: 'در حال بارگذاری PDF...',
    estimatedTimeRemaining: null,
    elapsedTime: 0,
  });

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const totalPages = pdf.numPages;

  onProgress({
    state: 'loading-pdf',
    currentPage: 0,
    totalPages,
    progress: 5,
    message: `PDF با ${totalPages} صفحه بارگذاری شد`,
    estimatedTimeRemaining: null,
    elapsedTime: Math.round((Date.now() - startTime) / 1000),
  });

  let fullText = '';
  const pageTimes: number[] = [];

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const pageStartTime = Date.now();

    // Render page
    onProgress({
      state: 'rendering',
      currentPage: pageNum,
      totalPages,
      progress: ((pageNum - 1) / totalPages) * 100,
      message: `در حال رندر صفحه ${toPersianNum(pageNum)} از ${toPersianNum(totalPages)}...`,
      estimatedTimeRemaining: calculateEstimatedTime(pageNum - 1, totalPages, startTime),
      elapsedTime: Math.round((Date.now() - startTime) / 1000),
    });

    const page = await pdf.getPage(pageNum);
    let canvas = await renderPageToCanvas(page, renderScale);

    // Apply preprocessing
    canvas = preprocessImage(canvas, true);

    const imageDataUrl = canvas.toDataURL('image/png');

    // OCR
    onProgress({
      state: 'ocr',
      currentPage: pageNum,
      totalPages,
      progress: ((pageNum - 1) / totalPages) * 100,
      message: `در حال OCR صفحه ${toPersianNum(pageNum)} از ${toPersianNum(totalPages)}...`,
      estimatedTimeRemaining: calculateEstimatedTime(pageNum - 1, totalPages, startTime),
      elapsedTime: Math.round((Date.now() - startTime) / 1000),
    });

    try {
      const result = await Tesseract.recognize(imageDataUrl, language, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            const pageProgress = (pageNum - 1 + m.progress) / totalPages;
            onProgress({
              state: 'ocr',
              currentPage: pageNum,
              totalPages,
              progress: pageProgress * 100,
              message: `شناسایی متن صفحه ${toPersianNum(pageNum)}... (${toPersianNum(Math.round(m.progress * 100))}%)`,
              estimatedTimeRemaining: calculateEstimatedTime(pageNum - 1 + m.progress, totalPages, startTime),
              elapsedTime: Math.round((Date.now() - startTime) / 1000),
            });
          }
        },
      });

      let pageText = result.data.text.trim();

      // Post-process for math formulas
      pageText = postProcessMathText(pageText);

      if (pageText) {
        fullText += `\n--- صفحه ${toPersianNum(pageNum)} ---\n\n${pageText}\n`;
      }
    } catch (error) {
      console.error(`Error OCR on page ${pageNum}:`, error);
      fullText += `\n--- صفحه ${toPersianNum(pageNum)} ---\n\n[خطا در شناسایی متن این صفحه]\n`;
    }

    // Record page time
    const pageTime = Date.now() - pageStartTime;
    pageTimes.push(pageTime);

    page.cleanup();
  }

  onProgress({
    state: 'done',
    currentPage: totalPages,
    totalPages,
    progress: 100,
    message: `استخراج متن با موفقیت انجام شد! (زمان کل: ${toPersianNum(Math.round((Date.now() - startTime) / 1000))} ثانیه)`,
    estimatedTimeRemaining: 0,
    elapsedTime: Math.round((Date.now() - startTime) / 1000),
  });

  return fullText.trim();
}

/**
 * Convert number to Persian digits
 */
export function toPersianNum(num: number): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (d) => persianDigits[parseInt(d)]);
}

/**
 * Format seconds to human readable time
 */
export function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${toPersianNum(seconds)} ثانیه`;
  } else if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${toPersianNum(mins)} دقیقه و ${toPersianNum(secs)} ثانیه`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${toPersianNum(hours)} ساعت و ${toPersianNum(mins)} دقیقه`;
  }
}
