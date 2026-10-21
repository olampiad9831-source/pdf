import { useState, useCallback, useRef, useEffect } from 'react';
import { extractTextFromPDF, formatTime, type ProcessingInfo } from './utils/ocr';
import { loadPDFPages, createFilteredPDF, createPreviewUrl, downloadPDF, type PDFPageInfo } from './utils/pdfEditor';
import { type Language, type Translations, getTranslation, formatTranslation } from './utils/translations';

type ActiveTab = 'ocr' | 'editor';

function App() {
  // Language state
  const [uiLanguage, setUiLanguage] = useState<Language>('fa');
  const t: Translations = getTranslation(uiLanguage);

  // Common state
  const [file, setFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('ocr');

  // OCR state
  const [extractedText, setExtractedText] = useState<string>('');
  const [processing, setProcessing] = useState<ProcessingInfo>({
    state: 'idle',
    currentPage: 0,
    totalPages: 0,
    progress: 0,
    message: '',
    estimatedTimeRemaining: null,
    elapsedTime: 0,
  });
  const [ocrLanguage, setOcrLanguage] = useState<string>('fas+eng');
  const [copied, setCopied] = useState(false);
  const [renderScale, setRenderScale] = useState<number>(3.0);
  const [enhanceMath, setEnhanceMath] = useState<boolean>(true);

  // PDF Editor state
  const [pdfPages, setPdfPages] = useState<PDFPageInfo[]>([]);
  const [loadingPages, setLoadingPages] = useState(false);
  const [filteredPdfBytes, setFilteredPdfBytes] = useState<Uint8Array | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [rangeInput, setRangeInput] = useState<string>('');
  const [editorStep, setEditorStep] = useState<'select' | 'review'>('select');
  const [editorError, setEditorError] = useState<string | null>(null);

  const previewRef = useRef<HTMLIFrameElement>(null);

  // Helper function for translations with params
  const tt = (key: keyof Translations, params?: Record<string, string | number>): string => {
    const text = t[key];
    return params ? formatTranslation(text, params) : text;
  };

  // Handle file change
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setExtractedText('');
      setProcessing({
        state: 'idle',
        currentPage: 0,
        totalPages: 0,
        progress: 0,
        message: '',
        estimatedTimeRemaining: null,
        elapsedTime: 0,
      });
      setPdfPages([]);
      setFilteredPdfBytes(null);
      setPreviewUrl(null);
      setShowPreview(false);
      setEditorStep('select');
      setEditorError(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      setExtractedText('');
      setProcessing({
        state: 'idle',
        currentPage: 0,
        totalPages: 0,
        progress: 0,
        message: '',
        estimatedTimeRemaining: null,
        elapsedTime: 0,
      });
      setPdfPages([]);
      setFilteredPdfBytes(null);
      setPreviewUrl(null);
      setShowPreview(false);
      setEditorStep('select');
      setEditorError(null);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  // Load PDF pages for editor
  useEffect(() => {
    if (file && activeTab === 'editor' && pdfPages.length === 0) {
      setLoadingPages(true);
      loadPDFPages(file).then(({ pages }) => {
        setPdfPages(pages);
        setLoadingPages(false);
      }).catch((err) => {
        console.error('Error loading PDF pages:', err);
        setLoadingPages(false);
      });
    }
  }, [file, activeTab, pdfPages.length]);

  // OCR Processing
  const processPDF = useCallback(async () => {
    if (!file) return;

    setExtractedText('');
    setProcessing({
      state: 'loading-pdf',
      currentPage: 0,
      totalPages: 0,
      progress: 0,
      message: tt('loadingPDF'),
      estimatedTimeRemaining: null,
      elapsedTime: 0,
    });

    try {
      const text = await extractTextFromPDF(file, ocrLanguage, renderScale, (info) => {
        setProcessing(info);
      });
      
      if (text && text.trim()) {
        setExtractedText(text);
      } else {
        setProcessing({
          state: 'error',
          currentPage: 0,
          totalPages: 0,
          progress: 0,
          message: 'هیچ متنی استخراج نشد. لطفاً تنظیمات را بررسی کنید.',
          estimatedTimeRemaining: null,
          elapsedTime: 0,
        });
      }
    } catch (error) {
      console.error('Error processing PDF:', error);
      setProcessing({
        state: 'error',
        currentPage: 0,
        totalPages: 0,
        progress: 0,
        message: `${tt('error')}: ${error instanceof Error ? error.message : tt('unknownError')}`,
        estimatedTimeRemaining: null,
        elapsedTime: 0,
      });
    }
  }, [file, ocrLanguage, renderScale, t]);

  // PDF Editor functions
  const togglePage = useCallback((pageNum: number) => {
    setPdfPages(prev => prev.map(p =>
      p.pageNumber === pageNum ? { ...p, selected: !p.selected } : p
    ));
  }, []);

  const selectAllPages = useCallback(() => {
    setPdfPages(prev => prev.map(p => ({ ...p, selected: true })));
  }, []);

  const deselectAllPages = useCallback(() => {
    setPdfPages(prev => prev.map(p => ({ ...p, selected: false })));
  }, []);

  const invertSelection = useCallback(() => {
    setPdfPages(prev => prev.map(p => ({ ...p, selected: !p.selected })));
  }, []);

  const handleRangeInput = useCallback(() => {
    if (!rangeInput.trim()) return;
    
    const ranges = rangeInput.split(',').map(r => r.trim());
    const pagesToRemove = new Set<number>();

    for (const range of ranges) {
      if (range.includes('-')) {
        const [start, end] = range.split('-').map(Number);
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
            pagesToRemove.add(i);
          }
        }
      } else {
        const num = Number(range);
        if (!isNaN(num)) {
          pagesToRemove.add(num);
        }
      }
    }

    setPdfPages(prev => prev.map(p => ({
      ...p,
      selected: !pagesToRemove.has(p.pageNumber)
    })));

    setRangeInput('');
  }, [rangeInput]);

  const applyFilter = useCallback(async () => {
    if (!file) return;
    
    setEditorError(null);
    const selectedPageNumbers = pdfPages
      .filter(p => p.selected)
      .map(p => p.pageNumber);

    if (selectedPageNumbers.length === 0) {
      setEditorError('حداقل یک صفحه باید انتخاب شود');
      return;
    }

    try {
      console.log('Starting PDF filter process...');
      console.log('Selected pages:', selectedPageNumbers.length);
      console.log('File size:', file.size, 'bytes');

      const bytes = await createFilteredPDF(file, selectedPageNumbers);
      console.log('PDF filtered successfully, size:', bytes.length, 'bytes');
      
      setFilteredPdfBytes(bytes);
      
      const url = createPreviewUrl(bytes);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(url);
      
      setEditorStep('review');
      setShowPreview(true);
      console.log('Preview ready');
    } catch (error) {
      console.error('Error creating filtered PDF:', error);
      setEditorError(`خطا در ساخت PDF: ${error instanceof Error ? error.message : 'خطای نامشخص'}`);
    }
  }, [file, pdfPages, previewUrl]);

  const downloadFilteredPDF = useCallback(() => {
    if (!filteredPdfBytes || !file) return;
    const newName = file.name.replace('.pdf', '_edited.pdf');
    downloadPDF(filteredPdfBytes, newName);
  }, [filteredPdfBytes, file]);

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
  const selectedCount = pdfPages.filter(p => p.selected).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950" dir={uiLanguage === 'en' ? 'ltr' : 'rtl'}>
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-xl bg-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">{t.appTitle}</h1>
              <p className="text-xs text-indigo-300">{t.appSubtitle}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <select
              value={uiLanguage}
              onChange={(e) => setUiLanguage(e.target.value as Language)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            >
              <option value="fa">فارسی</option>
              <option value="en">English</option>
              <option value="ar">العربية</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="es">Español</option>
              <option value="tr">Türkçe</option>
            </select>

            {/* Tab Navigation */}
            <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/10">
              <button
                onClick={() => setActiveTab('ocr')}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeTab === 'ocr'
                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {t.tabOCR}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('editor')}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeTab === 'editor'
                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
                  </svg>
                  {t.tabEditor}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Upload Section */}
        <div className="mb-8">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className={`relative border-2 border-dashed rounded-3xl p-10 text-center transition-all duration-500 group ${
              file
                ? 'border-violet-500/50 bg-violet-500/5 shadow-lg shadow-violet-500/10'
                : 'border-white/15 bg-white/[0.02] hover:border-violet-400/50 hover:bg-violet-500/5'
            }`}
          >
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="space-y-4">
              <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center transition-all duration-500 ${
                file 
                  ? 'bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30' 
                  : 'bg-white/5 group-hover:bg-violet-500/10'
              }`}>
                <svg className={`w-10 h-10 transition-colors ${file ? 'text-violet-400' : 'text-gray-500 group-hover:text-violet-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              {file ? (
                <div>
                  <p className="text-lg font-semibold text-white">{file.name}</p>
                  <p className="text-sm text-indigo-300 mt-1">
                    {(file.size / 1024 / 1024).toFixed(2)} MB • {t.uploadReady}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-lg font-medium text-white">{t.uploadTitle}</p>
                  <p className="text-sm text-gray-500 mt-2">{t.uploadSubtitle} • {t.uploadMaxSize}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* OCR Tab */}
        {activeTab === 'ocr' && (
          <div className="space-y-8">
            {/* Settings */}
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-1.066-2.573c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                {t.settingsTitle}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{t.languageLabel}</label>
                  <select
                    value={ocrLanguage}
                    onChange={(e) => setOcrLanguage(e.target.value)}
                    className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                  >
                    <option value="fas+eng">فارسی + انگلیسی</option>
                    <option value="eng">English</option>
                    <option value="fas">فارسی</option>
                    <option value="ara+eng">العربية + English</option>
                    <option value="ara">العربية</option>
                    <option value="fra+eng">Français + English</option>
                    <option value="deu+eng">Deutsch + English</option>
                    <option value="spa+eng">Español + English</option>
                    <option value="tur+eng">Türkçe + English</option>
                    <option value="chi_sim+eng">中文 + English</option>
                    <option value="rus+eng">Русский + English</option>
                    <option value="jpn+eng">日本語 + English</option>
                    <option value="kor+eng">한국어 + English</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t.renderQuality}: {(renderScale * 10).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="1.5"
                    max="5"
                    step="0.5"
                    value={renderScale}
                    onChange={(e) => setRenderScale(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>{t.faster}</span>
                    <span>{t.moreAccurate}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{t.mathEnhance}</label>
                  <div className="flex items-center gap-3 mt-3">
                    <button
                      onClick={() => setEnhanceMath(!enhanceMath)}
                      className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
                        enhanceMath ? 'bg-violet-600' : 'bg-slate-700'
                      }`}
                    >
                      <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 ${
                        enhanceMath ? 'right-1' : 'right-8'
                      }`} />
                    </button>
                    <span className="text-sm text-gray-400">
                      {enhanceMath ? t.mathEnhanceActive : t.mathEnhanceInactive}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Process Button */}
            <div className="text-center">
              <button
                onClick={processPDF}
                disabled={!file || isProcessing}
                className={`px-10 py-4 rounded-2xl text-lg font-bold transition-all duration-500 ${
                  !file || isProcessing
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 text-white hover:shadow-2xl hover:shadow-violet-500/30 transform hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {isProcessing ? (
                  <span className="flex items-center gap-3">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {t.processing}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {t.startOCR}
                  </span>
                )}
              </button>
            </div>

            {/* Progress */}
            {processing.state !== 'idle' && (
              <div className="bg-white/[0.03] backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-300">{processing.message}</span>
                  <span className="text-sm font-mono text-violet-400 bg-violet-500/10 px-3 py-1 rounded-lg">
                    {Math.round(processing.progress)}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 rounded-full transition-all duration-500 ease-out relative"
                    style={{ width: `${processing.progress}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                  </div>
                </div>
                
                {/* Time Info */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {processing.totalPages > 0 && (
                    <div className="flex items-center gap-2 bg-white/5 rounded-xl px-4 py-3">
                      <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span className="text-sm text-gray-400">
                        {tt('pageOf', { current: processing.currentPage, total: processing.totalPages })}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 bg-white/5 rounded-xl px-4 py-3">
                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-gray-400">
                      {tt('elapsedTime', { time: formatTime(processing.elapsedTime) })}
                    </span>
                  </div>
                  {processing.estimatedTimeRemaining !== null && processing.estimatedTimeRemaining > 0 && (
                    <div className="flex items-center gap-2 bg-white/5 rounded-xl px-4 py-3">
                      <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm text-gray-400">
                        {tt('remainingTime', { time: formatTime(processing.estimatedTimeRemaining) })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Error */}
            {processing.state === 'error' && (
              <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-red-300">{processing.message}</p>
                </div>
              </div>
            )}

            {/* Result */}
            {extractedText && (
              <div className="bg-white/[0.03] backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-xl">
                <div className="flex items-center justify-between px-8 py-5 border-b border-white/10 bg-white/[0.02]">
                  <h3 className="text-lg font-bold text-white flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    {t.extractedText}
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={copyToClipboard}
                      className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm transition-all flex items-center gap-2"
                    >
                      {copied ? (
                        <>
                          <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {t.copied}
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          {t.copy}
                        </>
                      )}
                    </button>
                    <button
                      onClick={downloadText}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-sm transition-all flex items-center gap-2 shadow-lg shadow-violet-500/20"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      {t.downloadTXT}
                    </button>
                  </div>
                </div>
                <div className="p-8">
                  <pre className="whitespace-pre-wrap text-gray-200 font-mono text-sm leading-relaxed max-h-[600px] overflow-y-auto bg-slate-900/50 rounded-2xl p-6 border border-white/5">
                    {extractedText}
                  </pre>
                </div>
                <div className="px-8 py-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
                  <p className="text-xs text-gray-400">
                    {t.characters}: {extractedText.length} | {t.words}: {extractedText.split(/\s+/).filter(Boolean).length}
                  </p>
                  {enhanceMath && (
                    <span className="text-xs text-violet-400 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      {t.mathEnhanceLabel}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Editor Tab */}
        {activeTab === 'editor' && (
          <div className="space-y-8">
            {!file && (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-400">{t.selectFileFirst}</p>
              </div>
            )}

            {file && loadingPages && (
              <div className="text-center py-16">
                <svg className="animate-spin h-10 w-10 mx-auto text-violet-400 mb-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <p className="text-gray-400">{t.loadingPages}</p>
              </div>
            )}

            {file && !loadingPages && pdfPages.length > 0 && (
              <>
                {/* Editor Controls */}
                <div className="bg-white/[0.03] backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-xl">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-fuchsia-500/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-fuchsia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                      </div>
                      {t.selectPages}
                      <span className="text-sm font-normal text-gray-400">
                        ({tt('pagesSelected', { selected: selectedCount, total: pdfPages.length })})
                      </span>
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={selectAllPages}
                        className="px-3 py-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 text-sm transition-all border border-green-500/20"
                      >
                        {t.selectAll}
                      </button>
                      <button
                        onClick={deselectAllPages}
                        className="px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm transition-all border border-red-500/20"
                      >
                        {t.deselectAll}
                      </button>
                      <button
                        onClick={invertSelection}
                        className="px-3 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-sm transition-all border border-amber-500/20"
                      >
                        {t.invertSelection}
                      </button>
                    </div>
                  </div>

                  {/* Range Input */}
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={rangeInput}
                        onChange={(e) => setRangeInput(e.target.value)}
                        placeholder={t.rangePlaceholder}
                        className="flex-1 bg-slate-800/80 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRangeInput();
                        }}
                      />
                      <button
                        onClick={handleRangeInput}
                        disabled={!rangeInput.trim()}
                        className="px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm transition-all border border-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        {t.removePages}
                      </button>
                    </div>
                  </div>

                  {/* Pages Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 max-h-[500px] overflow-y-auto p-2">
                    {pdfPages.map((page) => (
                      <div
                        key={page.pageNumber}
                        onClick={() => togglePage(page.pageNumber)}
                        className={`relative group cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                          page.selected
                            ? 'border-violet-500 shadow-lg shadow-violet-500/20 scale-[1.02]'
                            : 'border-white/10 opacity-50 hover:opacity-75'
                        }`}
                      >
                        <img
                          src={page.thumbnail}
                          alt={`${t.page} ${page.pageNumber}`}
                          className="w-full aspect-[3/4] object-cover bg-white"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-2">
                          <span className="text-xs font-medium text-white bg-black/50 px-2 py-1 rounded-md">
                            {t.page} {page.pageNumber}
                          </span>
                        </div>
                        <div className={`absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                          page.selected
                            ? 'bg-violet-500'
                            : 'bg-slate-700 border border-white/30'
                        }`}>
                          {page.selected && (
                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        {!page.selected && (
                          <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-red-500/80 flex items-center justify-center">
                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Error Message */}
                {editorError && (
                  <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4">
                    <p className="text-red-300 text-sm">{editorError}</p>
                  </div>
                )}

                {/* Action Buttons */}
                {editorStep === 'select' && (
                  <div className="text-center">
                    <button
                      onClick={applyFilter}
                      disabled={selectedCount === 0}
                      className={`px-10 py-4 rounded-2xl text-lg font-bold transition-all duration-500 ${
                        selectedCount === 0
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 text-white hover:shadow-2xl hover:shadow-violet-500/30 transform hover:scale-[1.02] active:scale-[0.98]'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {t.applyAndPreview}
                      </span>
                    </button>
                  </div>
                )}

                {/* Preview */}
                {editorStep === 'review' && showPreview && previewUrl && (
                  <div className="bg-white/[0.03] backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-xl">
                    <div className="flex items-center justify-between px-8 py-5 border-b border-white/10 bg-white/[0.02]">
                      <h3 className="text-lg font-bold text-white flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </div>
                        {t.previewTitle}
                        <span className="text-sm font-normal text-gray-400">
                          ({selectedCount} {t.page})
                        </span>
                      </h3>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditorStep('select');
                            setShowPreview(false);
                          }}
                          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm transition-all flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                          </svg>
                          {t.backToEdit}
                        </button>
                        <button
                          onClick={downloadFilteredPDF}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white text-sm transition-all flex items-center gap-2 shadow-lg shadow-green-500/20"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          {t.downloadPDF}
                        </button>
                      </div>
                    </div>
                    <div className="p-6">
                      <iframe
                        ref={previewRef}
                        src={previewUrl}
                        className="w-full h-[600px] rounded-2xl border border-white/10 bg-white"
                        title="PDF Preview"
                      />
                    </div>
                    <div className="px-8 py-4 border-t border-white/10 bg-white/[0.02]">
                      <p className="text-xs text-gray-400">
                        {t.pagesRemoved}: {pdfPages.length - selectedCount} |
                        {t.pagesRemaining}: {selectedCount} |
                        {t.approxSize}: {((filteredPdfBytes?.length || 0) / 1024).toFixed(0)} KB
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Info Cards */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-violet-500/30 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-all">
              <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h4 className="text-white font-semibold mb-2">{t.privateTitle}</h4>
            <p className="text-sm text-gray-400">{t.privateDesc}</p>
          </div>
          <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-green-500/30 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-all">
              <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h4 className="text-white font-semibold mb-2">{t.mathTitle}</h4>
            <p className="text-sm text-gray-400">{t.mathDesc}</p>
          </div>
          <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-fuchsia-500/30 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-fuchsia-500/10 flex items-center justify-center mb-4 group-hover:bg-fuchsia-500/20 transition-all">
              <svg className="w-6 h-6 text-fuchsia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </div>
            <h4 className="text-white font-semibold mb-2">{t.languagesTitle}</h4>
            <p className="text-sm text-gray-400">{t.languagesDesc}</p>
          </div>
          <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-amber-500/30 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4 group-hover:bg-amber-500/20 transition-all">
              <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
              </svg>
            </div>
            <h4 className="text-white font-semibold mb-2">{t.cropTitle}</h4>
            <p className="text-sm text-gray-400">{t.cropDesc}</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center">
          <p className="text-sm text-gray-500">{t.footerText}</p>
          <p className="text-xs text-gray-600 mt-2">{t.footerPrivacy}</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
