import { useState, useCallback } from 'react';
import { extractTextFromPDF } from './utils/ocr';

type ProcessingState = 'idle' | 'loading-pdf' | 'rendering' | 'ocr' | 'done' | 'error';

interface ProcessingInfo {
  state: ProcessingState;
  currentPage: number;
  totalPages: number;
  progress: number;
  message: string;
}

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [processing, setProcessing] = useState<ProcessingInfo>({
    state: 'idle',
    currentPage: 0,
    totalPages: 0,
    progress: 0,
    message: '',
  });
  const [language, setLanguage] = useState<string>('fas+eng');
  const [copied, setCopied] = useState(false);
  const [renderScale, setRenderScale] = useState<number>(3.0);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setExtractedText('');
      setProcessing({ state: 'idle', currentPage: 0, totalPages: 0, progress: 0, message: '' });
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      setExtractedText('');
      setProcessing({ state: 'idle', currentPage: 0, totalPages: 0, progress: 0, message: '' });
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const processPDF = useCallback(async () => {
    if (!file) return;

    setExtractedText('');
    setProcessing({
      state: 'loading-pdf',
      currentPage: 0,
      totalPages: 0,
      progress: 0,
      message: 'در حال بارگذاری PDF...',
    });

    try {
      const text = await extractTextFromPDF(file, language, renderScale, (info) => {
        setProcessing(info);
      });
      setExtractedText(text);
      setProcessing((prev) => ({
        ...prev,
        state: 'done',
        progress: 100,
        message: 'استخراج متن با موفقیت انجام شد!',
      }));
    } catch (error) {
      console.error('Error processing PDF:', error);
      setProcessing({
        state: 'error',
        currentPage: 0,
        totalPages: 0,
        progress: 0,
        message: `خطا: ${error instanceof Error ? error.message : 'خطای نامشخص'}`,
      });
    }
  }, [file, language, renderScale]);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [extractedText]);

  const downloadText = useCallback(() => {
    const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file?.name?.replace('.pdf', '') || 'extracted'}_text.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [extractedText, file]);

  const isProcessing = processing.state !== 'idle' && processing.state !== 'done' && processing.state !== 'error';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" dir="rtl">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm bg-white/5">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white">استخراج متن از PDF</h1>
          </div>
          <span className="text-sm text-purple-300">OCR حرفه‌ای</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Upload Section */}
        <div className="mb-8">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
              file
                ? 'border-purple-500 bg-purple-500/10'
                : 'border-white/20 bg-white/5 hover:border-purple-400 hover:bg-purple-500/5'
            }`}
          >
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              {file ? (
                <div>
                  <p className="text-lg font-medium text-white">{file.name}</p>
                  <p className="text-sm text-purple-300 mt-1">
                    {(file.size / 1024 / 1024).toFixed(2)} مگابایت
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-lg font-medium text-white">فایل PDF خود را اینجا بکشید یا کلیک کنید</p>
                  <p className="text-sm text-gray-400 mt-1">فقط فایل‌های PDF پشتیبانی می‌شوند</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="mb-8 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            تنظیمات OCR
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">زبان سند</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="fas+eng">فارسی + انگلیسی</option>
                <option value="eng">انگلیسی</option>
                <option value="fas">فارسی</option>
                <option value="ara+eng">عربی + انگلیسی</option>
                <option value="ara">عربی</option>
                <option value="fra+eng">فرانسوی + انگلیسی</option>
                <option value="deu+eng">آلمانی + انگلیسی</option>
                <option value="spa+eng">اسپانیایی + انگلیسی</option>
                <option value="tur+eng">ترکی + انگلیسی</option>
                <option value="chi_sim+eng">چینی ساده + انگلیسی</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                کیفیت رندر: {renderScale.toFixed(1)}x
                <span className="text-xs text-gray-500 mr-2">(بالاتر = دقیق‌تر ولی کندتر)</span>
              </label>
              <input
                type="range"
                min="1.5"
                max="5"
                step="0.5"
                value={renderScale}
                onChange={(e) => setRenderScale(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>سریع‌تر</span>
                <span>دقیق‌تر</span>
              </div>
            </div>
          </div>
        </div>

        {/* Process Button */}
        <div className="mb-8 text-center">
          <button
            onClick={processPDF}
            disabled={!file || isProcessing}
            className={`px-8 py-4 rounded-2xl text-lg font-bold transition-all duration-300 ${
              !file || isProcessing
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 hover:shadow-lg hover:shadow-purple-500/25 transform hover:scale-105'
            }`}
          >
            {isProcessing ? (
              <span className="flex items-center gap-3">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                در حال پردازش...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                شروع استخراج متن
              </span>
            )}
          </button>
        </div>

        {/* Progress */}
        {processing.state !== 'idle' && (
          <div className="mb-8 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-300">{processing.message}</span>
              <span className="text-sm font-mono text-purple-400">{Math.round(processing.progress)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${processing.progress}%` }}
              />
            </div>
            {processing.totalPages > 0 && (
              <div className="mt-3 flex items-center gap-4 text-sm text-gray-400">
                <span>صفحه {processing.currentPage} از {processing.totalPages}</span>
                {processing.state === 'ocr' && (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    در حال OCR
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {processing.state === 'error' && (
          <div className="mb-8 bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-300">{processing.message}</p>
            </div>
          </div>
        )}

        {/* Result */}
        {extractedText && (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                متن استخراج شده
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-all flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      کپی شد!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      کپی
                    </>
                  )}
                </button>
                <button
                  onClick={downloadText}
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  دانلود
                </button>
              </div>
            </div>
            <div className="p-6">
              <pre className="whitespace-pre-wrap text-gray-200 font-mono text-sm leading-relaxed max-h-[600px] overflow-y-auto bg-slate-900/50 rounded-xl p-4 border border-white/5">
                {extractedText}
              </pre>
            </div>
            <div className="px-6 py-3 border-t border-white/10 bg-white/5">
              <p className="text-xs text-gray-400">
                تعداد کاراکترها: {extractedText.length.toLocaleString('fa-IR')} | 
                تعداد کلمات: {extractedText.split(/\s+/).filter(Boolean).length.toLocaleString('fa-IR')}
              </p>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h4 className="text-white font-semibold mb-2">پردازش محلی</h4>
            <p className="text-sm text-gray-400">تمام پردازش‌ها در مرورگر شما انجام می‌شود و هیچ فایلی به سرور ارسال نمی‌شود.</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h4 className="text-white font-semibold mb-2">دقت بالا</h4>
            <p className="text-sm text-gray-400">با رندر در رزولوشن بالا و استفاده از Tesseract.js، بهترین نتیجه OCR حاصل می‌شود.</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </div>
            <h4 className="text-white font-semibold mb-2">پشتیبانی چندزبانه</h4>
            <p className="text-sm text-gray-400">پشتیبانی از فارسی، انگلیسی، عربی و سایر زبان‌ها به صورت همزمان.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          ساخته شده با ❤️ | OCR مبتنی بر Tesseract.js
        </div>
      </footer>
    </div>
  );
}

export default App;
