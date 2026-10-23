export type Language = 'fa' | 'en' | 'ar' | 'fr' | 'de' | 'es' | 'tr';

export interface Translations {
  // Header
  appTitle: string;
  appSubtitle: string;
  tabOCR: string;
  tabEditor: string;

  // Upload
  uploadTitle: string;
  uploadSubtitle: string;
  uploadReady: string;
  uploadMaxSize: string;

  // Settings
  settingsTitle: string;
  languageLabel: string;
  renderQuality: string;
  faster: string;
  moreAccurate: string;
  mathEnhance: string;
  mathEnhanceActive: string;
  mathEnhanceInactive: string;

  // OCR
  startOCR: string;
  processing: string;
  loadingPDF: string;
  pdfLoaded: string;
  renderingPage: string;
  ocrPage: string;
  recognizingText: string;
  completed: string;
  totalTime: string;
  error: string;
  unknownError: string;

  // Progress
  pageOf: string;
  elapsedTime: string;
  remainingTime: string;
  ocrProcessing: string;

  // Result
  extractedText: string;
  copy: string;
  copied: string;
  downloadTXT: string;
  characters: string;
  words: string;
  mathEnhanceLabel: string;

  // Editor
  selectPages: string;
  pagesSelected: string;
  selectAll: string;
  deselectAll: string;
  invertSelection: string;
  rangePlaceholder: string;
  removePages: string;
  applyAndPreview: string;
  previewTitle: string;
  backToEdit: string;
  downloadPDF: string;
  pagesRemoved: string;
  pagesRemaining: string;
  approxSize: string;
  selectFileFirst: string;
  loadingPages: string;
  page: string;

  // Info cards
  privateTitle: string;
  privateDesc: string;
  mathTitle: string;
  mathDesc: string;
  languagesTitle: string;
  languagesDesc: string;
  cropTitle: string;
  cropDesc: string;

  // Footer
  footerText: string;
  footerPrivacy: string;

  // Language selector
  uiLanguage: string;
}

export const translations: Record<Language, Translations> = {
  fa: {
    appTitle: 'PDF Toolkit Pro',
    appSubtitle: 'ابزار حرفه‌ای کار با PDF',
    tabOCR: 'استخراج متن (OCR)',
    tabEditor: 'ویرایش و برش PDF',

    uploadTitle: 'فایل PDF خود را اینجا بکشید یا کلیک کنید',
    uploadSubtitle: 'فقط فایل‌های PDF پشتیبانی می‌شوند',
    uploadReady: 'آماده پردازش',
    uploadMaxSize: 'حداکثر ۵۰۰ مگابایت',

    settingsTitle: 'تنظیمات OCR',
    languageLabel: 'زبان سند',
    renderQuality: 'کیفیت رندر',
    faster: 'سریع‌تر',
    moreAccurate: 'دقیق‌تر',
    mathEnhance: 'بهبود فرمول‌های ریاضی',
    mathEnhanceActive: 'فعال - تشخیص بهتر فرمول‌ها و نمادهای ریاضی',
    mathEnhanceInactive: 'غیرفعال',

    startOCR: 'شروع استخراج متن',
    processing: 'در حال پردازش...',
    loadingPDF: 'در حال بارگذاری PDF...',
    pdfLoaded: 'PDF با {pages} صفحه بارگذاری شد',
    renderingPage: 'در حال رندر صفحه {current} از {total}...',
    ocrPage: 'در حال OCR صفحه {current} از {total}...',
    recognizingText: 'شناسایی متن صفحه {current}... ({progress}%)',
    completed: 'استخراج متن با موفقیت انجام شد! (زمان کل: {time} ثانیه)',
    totalTime: 'زمان کل',
    error: 'خطا',
    unknownError: 'خطای نامشخص',

    pageOf: 'صفحه {current} از {total}',
    elapsedTime: 'زمان سپری شده: {time}',
    remainingTime: 'زمان باقی‌مانده: {time}',
    ocrProcessing: 'در حال پردازش OCR',

    extractedText: 'متن استخراج شده',
    copy: 'کپی',
    copied: 'کپی شد!',
    downloadTXT: 'دانلود TXT',
    characters: 'تعداد کاراکترها',
    words: 'تعداد کلمات',
    mathEnhanceLabel: 'بهبود فرمول‌های ریاضی فعال',

    selectPages: 'انتخاب صفحات',
    pagesSelected: '{selected} از {total} صفحه انتخاب شده',
    selectAll: 'انتخاب همه',
    deselectAll: 'حذف انتخاب همه',
    invertSelection: 'معکوس کردن',
    rangePlaceholder: 'مثال: 1-3, 5, 7-10 (صفحات حذفی)',
    removePages: 'حذف صفحات',
    applyAndPreview: 'اعمال برش و پیش‌نمایش',
    previewTitle: 'پیش‌نمایش PDF جدید',
    backToEdit: 'بازگشت به ویرایش',
    downloadPDF: 'دانلود PDF',
    pagesRemoved: 'صفحات حذف شده',
    pagesRemaining: 'صفحات باقی‌مانده',
    approxSize: 'اندازه تقریبی',
    selectFileFirst: 'لطفاً ابتدا یک فایل PDF انتخاب کنید',
    loadingPages: 'در حال بارگذاری صفحات PDF...',
    page: 'صفحه',

    privateTitle: '۱۰۰٪ خصوصی',
    privateDesc: 'تمام پردازش‌ها در مرورگر شما انجام می‌شود',
    mathTitle: 'فرمول‌های ریاضی',
    mathDesc: 'تشخیص هوشمند فرمول‌ها و نمادهای ریاضی',
    languagesTitle: '۱۳+ زبان',
    languagesDesc: 'پشتیبانی از فارسی، انگلیسی، عربی و...',
    cropTitle: 'برش PDF',
    cropDesc: 'حذف صفحات و ساخت PDF جدید با پیش‌نمایش',

    footerText: 'PDF Toolkit Pro • OCR مبتنی بر Tesseract.js • پردازش کاملاً محلی',
    footerPrivacy: 'هیچ اطلاعاتی به سرور ارسال نمی‌شود • تمام داده‌ها در مرورگر شما پردازش می‌شوند',

    uiLanguage: 'زبان رابط کاربری',
  },

  en: {
    appTitle: 'PDF Toolkit Pro',
    appSubtitle: 'Professional PDF Tools',
    tabOCR: 'Text Extraction (OCR)',
    tabEditor: 'Edit & Crop PDF',

    uploadTitle: 'Drag & drop your PDF here or click to browse',
    uploadSubtitle: 'Only PDF files are supported',
    uploadReady: 'Ready to process',
    uploadMaxSize: 'Maximum 500 MB',

    settingsTitle: 'OCR Settings',
    languageLabel: 'Document Language',
    renderQuality: 'Render Quality',
    faster: 'Faster',
    moreAccurate: 'More Accurate',
    mathEnhance: 'Math Formula Enhancement',
    mathEnhanceActive: 'Active - Better recognition of formulas and math symbols',
    mathEnhanceInactive: 'Inactive',

    startOCR: 'Start Text Extraction',
    processing: 'Processing...',
    loadingPDF: 'Loading PDF...',
    pdfLoaded: 'PDF loaded with {pages} pages',
    renderingPage: 'Rendering page {current} of {total}...',
    ocrPage: 'OCR on page {current} of {total}...',
    recognizingText: 'Recognizing text on page {current}... ({progress}%)',
    completed: 'Text extraction completed successfully! (Total time: {time} seconds)',
    totalTime: 'Total time',
    error: 'Error',
    unknownError: 'Unknown error',

    pageOf: 'Page {current} of {total}',
    elapsedTime: 'Elapsed time: {time}',
    remainingTime: 'Remaining time: {time}',
    ocrProcessing: 'Processing OCR',

    extractedText: 'Extracted Text',
    copy: 'Copy',
    copied: 'Copied!',
    downloadTXT: 'Download TXT',
    characters: 'Characters',
    words: 'Words',
    mathEnhanceLabel: 'Math formula enhancement active',

    selectPages: 'Select Pages',
    pagesSelected: '{selected} of {total} pages selected',
    selectAll: 'Select All',
    deselectAll: 'Deselect All',
    invertSelection: 'Invert Selection',
    rangePlaceholder: 'Example: 1-3, 5, 7-10 (pages to remove)',
    removePages: 'Remove Pages',
    applyAndPreview: 'Apply & Preview',
    previewTitle: 'New PDF Preview',
    backToEdit: 'Back to Edit',
    downloadPDF: 'Download PDF',
    pagesRemoved: 'Pages removed',
    pagesRemaining: 'Pages remaining',
    approxSize: 'Approximate size',
    selectFileFirst: 'Please select a PDF file first',
    loadingPages: 'Loading PDF pages...',
    page: 'Page',

    privateTitle: '100% Private',
    privateDesc: 'All processing happens in your browser',
    mathTitle: 'Math Formulas',
    mathDesc: 'Smart recognition of formulas and math symbols',
    languagesTitle: '13+ Languages',
    languagesDesc: 'Support for Persian, English, Arabic, and more',
    cropTitle: 'PDF Cropping',
    cropDesc: 'Remove pages and create new PDF with preview',

    footerText: 'PDF Toolkit Pro • Powered by Tesseract.js • Fully local processing',
    footerPrivacy: 'No data is sent to any server • All data is processed in your browser',

    uiLanguage: 'UI Language',
  },

  ar: {
    appTitle: 'PDF Toolkit Pro',
    appSubtitle: 'أدوات PDF احترافية',
    tabOCR: 'استخراج النص (OCR)',
    tabEditor: 'تحرير وقص PDF',

    uploadTitle: 'اسحب ملف PDF هنا أو انقر للتصفح',
    uploadSubtitle: 'يتم دعم ملفات PDF فقط',
    uploadReady: 'جاهز للمعالجة',
    uploadMaxSize: 'الحد الأقصى 500 ميجابايت',

    settingsTitle: 'إعدادات OCR',
    languageLabel: 'لغة المستند',
    renderQuality: 'جودة العرض',
    faster: 'أسرع',
    moreAccurate: 'أكثر دقة',
    mathEnhance: 'تحسين الصيغ الرياضية',
    mathEnhanceActive: 'نشط - تعرف أفضل على الصيغ والرموز الرياضية',
    mathEnhanceInactive: 'غير نشط',

    startOCR: 'بدء استخراج النص',
    processing: 'جاري المعالجة...',
    loadingPDF: 'جاري تحميل PDF...',
    pdfLoaded: 'تم تحميل PDF بـ {pages} صفحة',
    renderingPage: 'جاري عرض الصفحة {current} من {total}...',
    ocrPage: 'OCR للصفحة {current} من {total}...',
    recognizingText: 'التعرف على نص الصفحة {current}... ({progress}%)',
    completed: 'تم استخراج النص بنجاح! (الوقت الإجمالي: {time} ثانية)',
    totalTime: 'الوقت الإجمالي',
    error: 'خطأ',
    unknownError: 'خطأ غير معروف',

    pageOf: 'الصفحة {current} من {total}',
    elapsedTime: 'الوقت المنقضي: {time}',
    remainingTime: 'الوقت المتبقي: {time}',
    ocrProcessing: 'جاري معالجة OCR',

    extractedText: 'النص المستخرج',
    copy: 'نسخ',
    copied: 'تم النسخ!',
    downloadTXT: 'تحميل TXT',
    characters: 'الأحرف',
    words: 'الكلمات',
    mathEnhanceLabel: 'تحسين الصيغ الرياضية نشط',

    selectPages: 'حدد الصفحات',
    pagesSelected: '{selected} من {total} صفحة محددة',
    selectAll: 'تحديد الكل',
    deselectAll: 'إلغاء تحديد الكل',
    invertSelection: 'عكس التحديد',
    rangePlaceholder: 'مثال: 1-3, 5, 7-10 (الصفحات المراد إزالتها)',
    removePages: 'إزالة الصفحات',
    applyAndPreview: 'تطبيق ومعاينة',
    previewTitle: 'معاينة PDF الجديد',
    backToEdit: 'العودة للتحرير',
    downloadPDF: 'تحميل PDF',
    pagesRemoved: 'الصفحات المحذوفة',
    pagesRemaining: 'الصفحات المتبقية',
    approxSize: 'الحجم التقريبي',
    selectFileFirst: 'يرجى تحديد ملف PDF أولاً',
    loadingPages: 'جاري تحميل صفحات PDF...',
    page: 'صفحة',

    privateTitle: 'خاص 100%',
    privateDesc: 'تتم جميع المعالجات في متصفحك',
    mathTitle: 'الصيغ الرياضية',
    mathDesc: 'تعرف ذكي على الصيغ والرموز الرياضية',
    languagesTitle: '+13 لغة',
    languagesDesc: 'دعم الفارسية والإنجليزية والعربية والمزيد',
    cropTitle: 'قص PDF',
    cropDesc: 'إزالة الصفحات وإنشاء PDF جديد مع معاينة',

    footerText: 'PDF Toolkit Pro • مدعوم بواسطة Tesseract.js • معالجة محلية بالكامل',
    footerPrivacy: 'لا يتم إرسال أي بيانات إلى أي خادم • تتم معالجة جميع البيانات في متصفحك',

    uiLanguage: 'لغة الواجهة',
  },

  fr: {
    appTitle: 'PDF Toolkit Pro',
    appSubtitle: 'Outils PDF professionnels',
    tabOCR: 'Extraction de texte (OCR)',
    tabEditor: 'Modifier et rogner PDF',

    uploadTitle: 'Glissez-déposez votre PDF ici ou cliquez pour parcourir',
    uploadSubtitle: 'Seuls les fichiers PDF sont pris en charge',
    uploadReady: 'Prêt à traiter',
    uploadMaxSize: 'Maximum 500 Mo',

    settingsTitle: 'Paramètres OCR',
    languageLabel: 'Langue du document',
    renderQuality: 'Qualité de rendu',
    faster: 'Plus rapide',
    moreAccurate: 'Plus précis',
    mathEnhance: 'Amélioration des formules mathématiques',
    mathEnhanceActive: 'Actif - Meilleure reconnaissance des formules et symboles mathématiques',
    mathEnhanceInactive: 'Inactif',

    startOCR: "Démarrer l'extraction de texte",
    processing: 'Traitement en cours...',
    loadingPDF: 'Chargement du PDF...',
    pdfLoaded: 'PDF chargé avec {pages} pages',
    renderingPage: 'Rendu de la page {current} sur {total}...',
    ocrPage: 'OCR page {current} sur {total}...',
    recognizingText: 'Reconnaissance du texte page {current}... ({progress}%)',
    completed: 'Extraction de texte réussie! (Temps total: {time} secondes)',
    totalTime: 'Temps total',
    error: 'Erreur',
    unknownError: 'Erreur inconnue',

    pageOf: 'Page {current} sur {total}',
    elapsedTime: 'Temps écoulé: {time}',
    remainingTime: 'Temps restant: {time}',
    ocrProcessing: 'Traitement OCR en cours',

    extractedText: 'Texte extrait',
    copy: 'Copier',
    copied: 'Copié!',
    downloadTXT: 'Télécharger TXT',
    characters: 'Caractères',
    words: 'Mots',
    mathEnhanceLabel: 'Amélioration des formules mathématiques active',

    selectPages: 'Sélectionner les pages',
    pagesSelected: '{selected} sur {total} pages sélectionnées',
    selectAll: 'Tout sélectionner',
    deselectAll: 'Tout désélectionner',
    invertSelection: 'Inverser la sélection',
    rangePlaceholder: 'Exemple: 1-3, 5, 7-10 (pages à supprimer)',
    removePages: 'Supprimer les pages',
    applyAndPreview: 'Appliquer et prévisualiser',
    previewTitle: 'Aperçu du nouveau PDF',
    backToEdit: "Retour à l'édition",
    downloadPDF: 'Télécharger PDF',
    pagesRemoved: 'Pages supprimées',
    pagesRemaining: 'Pages restantes',
    approxSize: 'Taille approximative',
    selectFileFirst: 'Veuillez d\'abord sélectionner un fichier PDF',
    loadingPages: 'Chargement des pages PDF...',
    page: 'Page',

    privateTitle: '100% Privé',
    privateDesc: 'Tout le traitement se fait dans votre navigateur',
    mathTitle: 'Formules mathématiques',
    mathDesc: 'Reconnaissance intelligente des formules et symboles mathématiques',
    languagesTitle: '13+ langues',
    languagesDesc: 'Support du persan, anglais, arabe et plus',
    cropTitle: 'Rognage PDF',
    cropDesc: 'Supprimer des pages et créer un nouveau PDF avec aperçu',

    footerText: 'PDF Toolkit Pro • Propulsé par Tesseract.js • Traitement entièrement local',
    footerPrivacy: 'Aucune donnée n\'est envoyée à un serveur • Toutes les données sont traitées dans votre navigateur',

    uiLanguage: 'Langue de l\'interface',
  },

  de: {
    appTitle: 'PDF Toolkit Pro',
    appSubtitle: 'Professionelle PDF-Werkzeuge',
    tabOCR: 'Textextraktion (OCR)',
    tabEditor: 'PDF bearbeiten & zuschneiden',

    uploadTitle: 'PDF hierher ziehen oder klicken zum Durchsuchen',
    uploadSubtitle: 'Nur PDF-Dateien werden unterstützt',
    uploadReady: 'Bereit zur Verarbeitung',
    uploadMaxSize: 'Maximal 500 MB',

    settingsTitle: 'OCR-Einstellungen',
    languageLabel: 'Dokumentensprache',
    renderQuality: 'Renderqualität',
    faster: 'Schneller',
    moreAccurate: 'Genauer',
    mathEnhance: 'Mathematische Formelverbesserung',
    mathEnhanceActive: 'Aktiv - Bessere Erkennung von Formeln und mathematischen Symbolen',
    mathEnhanceInactive: 'Inaktiv',

    startOCR: 'Textextraktion starten',
    processing: 'Verarbeitung...',
    loadingPDF: 'PDF wird geladen...',
    pdfLoaded: 'PDF mit {pages} Seiten geladen',
    renderingPage: 'Seite {current} von {total} wird gerendert...',
    ocrPage: 'OCR Seite {current} von {total}...',
    recognizingText: 'Texterkennung Seite {current}... ({progress}%)',
    completed: 'Textextraktion erfolgreich! (Gesamtzeit: {time} Sekunden)',
    totalTime: 'Gesamtzeit',
    error: 'Fehler',
    unknownError: 'Unbekannter Fehler',

    pageOf: 'Seite {current} von {total}',
    elapsedTime: 'Verstrichene Zeit: {time}',
    remainingTime: 'Verbleibende Zeit: {time}',
    ocrProcessing: 'OCR-Verarbeitung',

    extractedText: 'Extrahierter Text',
    copy: 'Kopieren',
    copied: 'Kopiert!',
    downloadTXT: 'TXT herunterladen',
    characters: 'Zeichen',
    words: 'Wörter',
    mathEnhanceLabel: 'Mathematische Formelverbesserung aktiv',

    selectPages: 'Seiten auswählen',
    pagesSelected: '{selected} von {total} Seiten ausgewählt',
    selectAll: 'Alle auswählen',
    deselectAll: 'Alle abwählen',
    invertSelection: 'Auswahl umkehren',
    rangePlaceholder: 'Beispiel: 1-3, 5, 7-10 (zu entfernende Seiten)',
    removePages: 'Seiten entfernen',
    applyAndPreview: 'Anwenden & Vorschau',
    previewTitle: 'Neue PDF-Vorschau',
    backToEdit: 'Zurück zur Bearbeitung',
    downloadPDF: 'PDF herunterladen',
    pagesRemoved: 'Entfernte Seiten',
    pagesRemaining: 'Verbleibende Seiten',
    approxSize: 'Ungefähre Größe',
    selectFileFirst: 'Bitte wählen Sie zuerst eine PDF-Datei aus',
    loadingPages: 'PDF-Seiten werden geladen...',
    page: 'Seite',

    privateTitle: '100% Privat',
    privateDesc: 'Alle Verarbeitung erfolgt in Ihrem Browser',
    mathTitle: 'Mathematische Formeln',
    mathDesc: 'Intelligente Erkennung von Formeln und mathematischen Symbolen',
    languagesTitle: '13+ Sprachen',
    languagesDesc: 'Unterstützung für Persisch, Englisch, Arabisch und mehr',
    cropTitle: 'PDF-Zuschneiden',
    cropDesc: 'Seiten entfernen und neues PDF mit Vorschau erstellen',

    footerText: 'PDF Toolkit Pro • Powered by Tesseract.js • Vollständig lokale Verarbeitung',
    footerPrivacy: 'Keine Daten werden an einen Server gesendet • Alle Daten werden in Ihrem Browser verarbeitet',

    uiLanguage: 'UI-Sprache',
  },

  es: {
    appTitle: 'PDF Toolkit Pro',
    appSubtitle: 'Herramientas PDF profesionales',
    tabOCR: 'Extracción de texto (OCR)',
    tabEditor: 'Editar y recortar PDF',

    uploadTitle: 'Arrastra tu PDF aquí o haz clic para buscar',
    uploadSubtitle: 'Solo se admiten archivos PDF',
    uploadReady: 'Listo para procesar',
    uploadMaxSize: 'Máximo 500 MB',

    settingsTitle: 'Configuración de OCR',
    languageLabel: 'Idioma del documento',
    renderQuality: 'Calidad de renderizado',
    faster: 'Más rápido',
    moreAccurate: 'Más preciso',
    mathEnhance: 'Mejora de fórmulas matemáticas',
    mathEnhanceActive: 'Activo - Mejor reconocimiento de fórmulas y símbolos matemáticos',
    mathEnhanceInactive: 'Inactivo',

    startOCR: 'Iniciar extracción de texto',
    processing: 'Procesando...',
    loadingPDF: 'Cargando PDF...',
    pdfLoaded: 'PDF cargado con {pages} páginas',
    renderingPage: 'Renderizando página {current} de {total}...',
    ocrPage: 'OCR página {current} de {total}...',
    recognizingText: 'Reconociendo texto página {current}... ({progress}%)',
    completed: '¡Extracción de texto completada! (Tiempo total: {time} segundos)',
    totalTime: 'Tiempo total',
    error: 'Error',
    unknownError: 'Error desconocido',

    pageOf: 'Página {current} de {total}',
    elapsedTime: 'Tiempo transcurrido: {time}',
    remainingTime: 'Tiempo restante: {time}',
    ocrProcessing: 'Procesando OCR',

    extractedText: 'Texto extraído',
    copy: 'Copiar',
    copied: '¡Copiado!',
    downloadTXT: 'Descargar TXT',
    characters: 'Caracteres',
    words: 'Palabras',
    mathEnhanceLabel: 'Mejora de fórmulas matemáticas activa',

    selectPages: 'Seleccionar páginas',
    pagesSelected: '{selected} de {total} páginas seleccionadas',
    selectAll: 'Seleccionar todo',
    deselectAll: 'Deseleccionar todo',
    invertSelection: 'Invertir selección',
    rangePlaceholder: 'Ejemplo: 1-3, 5, 7-10 (páginas a eliminar)',
    removePages: 'Eliminar páginas',
    applyAndPreview: 'Aplicar y vista previa',
    previewTitle: 'Vista previa del nuevo PDF',
    backToEdit: 'Volver a editar',
    downloadPDF: 'Descargar PDF',
    pagesRemoved: 'Páginas eliminadas',
    pagesRemaining: 'Páginas restantes',
    approxSize: 'Tamaño aproximado',
    selectFileFirst: 'Por favor, selecciona un archivo PDF primero',
    loadingPages: 'Cargando páginas PDF...',
    page: 'Página',

    privateTitle: '100% Privado',
    privateDesc: 'Todo el procesamiento ocurre en tu navegador',
    mathTitle: 'Fórmulas matemáticas',
    mathDesc: 'Reconocimiento inteligente de fórmulas y símbolos matemáticos',
    languagesTitle: '13+ idiomas',
    languagesDesc: 'Soporte para persa, inglés, árabe y más',
    cropTitle: 'Recorte de PDF',
    cropDesc: 'Eliminar páginas y crear nuevo PDF con vista previa',

    footerText: 'PDF Toolkit Pro • Impulsado por Tesseract.js • Procesamiento completamente local',
    footerPrivacy: 'No se envían datos a ningún servidor • Todos los datos se procesan en tu navegador',

    uiLanguage: 'Idioma de la interfaz',
  },

  tr: {
    appTitle: 'PDF Toolkit Pro',
    appSubtitle: 'Profesyonel PDF Araçları',
    tabOCR: 'Metin Çıkarma (OCR)',
    tabEditor: 'PDF Düzenle ve Kırp',

    uploadTitle: 'PDF\'inizi buraya sürükleyin veya göz atmak için tıklayın',
    uploadSubtitle: 'Yalnızca PDF dosyaları desteklenir',
    uploadReady: 'İşlemeye hazır',
    uploadMaxSize: 'Maksimum 500 MB',

    settingsTitle: 'OCR Ayarları',
    languageLabel: 'Belge Dili',
    renderQuality: 'Oluşturma Kalitesi',
    faster: 'Daha Hızlı',
    moreAccurate: 'Daha Doğru',
    mathEnhance: 'Matematik Formül İyileştirmesi',
    mathEnhanceActive: 'Aktif - Formüllerin ve matematik sembollerinin daha iyi tanınması',
    mathEnhanceInactive: 'Devre dışı',

    startOCR: 'Metin Çıkarmayı Başlat',
    processing: 'İşleniyor...',
    loadingPDF: 'PDF yükleniyor...',
    pdfLoaded: '{pages} sayfalı PDF yüklendi',
    renderingPage: '{total} sayfanın {current}. sayfası oluşturuluyor...',
    ocrPage: '{total} sayfanın {current}. sayfasında OCR...',
    recognizingText: '{current}. sayfanın metni tanınıyor... ({progress}%)',
    completed: 'Metin çıkarma başarıyla tamamlandı! (Toplam süre: {time} saniye)',
    totalTime: 'Toplam süre',
    error: 'Hata',
    unknownError: 'Bilinmeyen hata',

    pageOf: '{total} sayfanın {current}. sayfası',
    elapsedTime: 'Geçen süre: {time}',
    remainingTime: 'Kalan süre: {time}',
    ocrProcessing: 'OCR işleniyor',

    extractedText: 'Çıkarılan Metin',
    copy: 'Kopyala',
    copied: 'Kopyalandı!',
    downloadTXT: 'TXT İndir',
    characters: 'Karakter',
    words: 'Kelime',
    mathEnhanceLabel: 'Matematik formül iyileştirmesi aktif',

    selectPages: 'Sayfaları Seç',
    pagesSelected: '{total} sayfanın {selected} tanesi seçildi',
    selectAll: 'Tümünü Seç',
    deselectAll: 'Tüm Seçimi Kaldır',
    invertSelection: 'Seçimi Tersine Çevir',
    rangePlaceholder: 'Örnek: 1-3, 5, 7-10 (kaldırılacak sayfalar)',
    removePages: 'Sayfaları Kaldır',
    applyAndPreview: 'Uygula ve Önizle',
    previewTitle: 'Yeni PDF Önizlemesi',
    backToEdit: 'Düzenlemeye Dön',
    downloadPDF: 'PDF İndir',
    pagesRemoved: 'Kaldırılan sayfalar',
    pagesRemaining: 'Kalan sayfalar',
    approxSize: 'Yaklaşık boyut',
    selectFileFirst: 'Lütfen önce bir PDF dosyası seçin',
    loadingPages: 'PDF sayfaları yükleniyor...',
    page: 'Sayfa',

    privateTitle: '%100 Gizli',
    privateDesc: 'Tüm işlemler tarayıcınızda gerçekleşir',
    mathTitle: 'Matematik Formülleri',
    mathDesc: 'Formüllerin ve matematik sembollerinin akıllı tanınması',
    languagesTitle: '13+ Dil',
    languagesDesc: 'Farsça, İngilizce, Arapça ve daha fazlası desteği',
    cropTitle: 'PDF Kırpma',
    cropDesc: 'Sayfaları kaldırın ve önizlemeli yeni PDF oluşturun',

    footerText: 'PDF Toolkit Pro • Tesseract.js destekli • Tamamen yerel işleme',
    footerPrivacy: 'Hiçbir veri sunucuya gönderilmez • Tüm veriler tarayıcınızda işlenir',

    uiLanguage: 'Arayüz Dili',
  },
};

export function getTranslation(lang: Language): Translations {
  return translations[lang];
}

export function formatTranslation(text: string, params: Record<string, string | number>): string {
  let result = text;
  for (const [key, value] of Object.entries(params)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
  }
  return result;
}
