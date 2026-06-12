import type { I18nStrings } from './en';

/** Persian UI strings. */
export const fa: I18nStrings = {
  header: {
    title: 'بیو-دینامیک: ساندباکس میکروبیوم تمام‌بدن',
  },
  regions: {
    title: 'انتخاب ناحیه نقشه بدن',
    back: '← بازگشت به بدن',
    keyboardHint: 'کلیدهای ۱–۷ نواحی را انتخاب می‌کنند · Esc به نقشه بدن برمی‌گردد',
  },
  viewport: {
    bodyMap: 'نقشه بدن',
    tissueView: 'نمای بافت',
    fullBodyTitle: 'نقشه میکروبیوم تمام‌بدن',
    clickToZoom: 'روی ناحیه برجسته کلیک کنید تا بزرگ‌نمایی شود',
    dragToOrbit: 'کشیدن برای چرخش · اسکرول برای زوم',
    tissueGuideTitle: 'راهنمای برش مقطع',
    microbeHint: 'شکل ذرات با راهنمای پایین مطابقت دارد — رنگ‌ها نوع میکروب را نشان می‌دهند',
    inflammationSpike: 'جهش التهاب',
    autoMicroBanner: 'ورود به نمای بافت — {region}',
  },
  preset: {
    label: 'سناریو',
    variant: 'نوع سناریو',
    standard: 'سناریوی استاندارد',
    lifestage: 'زمینه مرحله زندگی',
    readArticle: 'مطالعه: {title} →',
  },
  stats: {
    title: 'آمار لحظه‌ای',
    integrity: 'یکپارچگی سد',
    inflammation: 'التهاب',
    immune: 'فعالیت ایمنی',
    sugarLoad: 'بار قند',
    probiotics: 'سویه‌های پروبیوتیک',
    pathogens: 'سویه‌های بیماری‌زا',
    allergens: 'ذرات آلرژن',
    commensals: 'تعداد کومنسال',
    biofilm: 'سطح بیوفیلم',
    prebiotic: 'بستر پری‌بیوتیک',
    postbiotic: 'SCFA پس‌بیوتیک',
    tryptophanSupport: 'پشتیبانی تریپتوفان',
    tryptophanSupportTitle:
      'مدل آموزشی — با التهاب کم روده و SCFA بالا افزایش می‌یابد؛ پیش‌ساز سروتونین',
    populationScaleNote:
      'شمارش جمعیت با مقیاس ×{scale} نمایش داده می‌شود — هر واحد ~{scale} سلول شبیه‌سازی‌شده است.',
    populationScaleTitle: 'مقیاس نمایش: شمارش خام × {scale}',
    trendUp: '↑ در حال افزایش',
    trendDown: '↓ در حال کاهش',
    trendStable: '→ پایدار',
  },
  eventLog: {
    title: 'گزارش رویداد',
    showAll: 'نمایش همه',
    showRecent: 'اخیر',
    export: 'خروجی',
    exportTitle: 'دانلود گزارش کامل برای کلاس',
    count: '{count} رویداد',
    newEvent: 'رویداد جدید: {text}',
  },
  env: {
    title: 'متغیرهای محیطی',
    advanced: 'پیشرفته',
    advancedTitle: 'نمایش باندهای pH، نماینده ایمنی و جدول زمانی رژیم',
    regionHint: '{region} — تنظیم شرایط محلی بافت',
    daySim: 'شبیه‌سازی روز',
    daySimHintOral:
      'وعده‌های دهانی pH را موقتاً پایین و بار قند را بالا می‌برند — واکنش مخمر/بیماری‌زا را ببینید',
    daySimHintGut:
      'وعده‌های روده بار قند فضای داخلی را بالا می‌برند — کاهش کندتر از دهان',
    dayStatus: 'روز {day} · بعدی: {meal} ({step}/{total})',
  },
  stressors: {
    title: 'استرسورها',
    hint: 'کلیک برای پیش‌نمایش و اعمال — نمای بافت فوراً به‌روز می‌شود',
  },
  regional: {
    title: 'مراقبت منطقه‌ای',
    suggestedHint: 'پیشنهادی برای {region} — کلیک برای پیش‌نمایش و اعمال',
    tissueTreatments: 'درمان‌های اختصاصی بافت',
  },
  catalog: {
    title: 'مداخلات',
    hint: 'فهرست کامل — کلیک برای پیش‌نمایش و اعمال',
    products: 'محصولات و غذاها',
    strains: 'کتابخانه سویه',
    prebiotics: 'پری‌بیوتیک‌ها',
    postbiotics: 'پس‌بیوتیک‌ها',
    impactTitle: 'پیش‌نمایش اقدام',
    impactPlaceholder:
      'روی هر استرسور، درمان منطقه‌ای یا مورد فهرست کلیک کنید تا اثر آن را ببینید.',
    closePreview: 'بستن پیش‌نمایش',
  },
  footer: {
    engine: 'موتور: قطعی · هدف {fps} FPS',
    disclaimer: 'مدل آموزشی — توصیه پزشکی نیست',
    advancedNote: 'پنل‌های پیشرفته: فقط نمایشی',
    techBlog: 'وبلاگ فنی',
    sourceCode: 'کد منبع',
  },
  lang: {
    label: 'زبان',
  },
  tips: {
    dismiss: 'بستن نکته',
    allergy:
      'سناریوی آلرژی: از بینی/سینوس شروع کنید، محرک‌های آلرژن را اجرا کنید، سپس تلقیح پروبیوتیک را امتحان کنید.',
    candida:
      'سناریوی کاندیدا: بافت دهان، واژن یا روده — pH را قلیایی کنید و قند اضافه کنید، سپس درمان‌های اسیدی‌کننده.',
    lifecycle:
      'سناریوی چرخه زیستی: بافت روده را باز کنید، استرس و پری‌بیوتیک را امتحان کنید — پشتیبانی تریپتوفان با کاهش التهاب و SCFA بالاتر می‌رود.',
  },
  a11y: {
    regionShortcut: '{label} — کلید {key}',
    activeAction: 'فعال: {label}',
    statIntegrityLow: 'یکپارچگی سد به {pct}% کاهش یافت',
    statIntegrityHigh: 'یکپارچگی سد به {pct}% بهبود یافت',
    statInflammationHigh: 'التهاب به {pct}% افزایش یافت',
    statInflammationLow: 'التهاب به {pct}% کاهش یافت',
  },
  events: {
    prebioticAdded: '{name} پری‌بیوتیک اضافه شد — بستر برای پروبیوتیک‌ها',
    postbioticReduced: '{label} — اثربخشی کمتر خارج از {regions}',
    postbioticApplied: '{label} اعمال شد — متابولیت‌های پس‌بیوتیک فعال',
    productReduced: '{label} — اثربخشی کمتر خارج از {regions}',
    triggerUnavailable: 'محرک «{id}» برای بافت {region} در دسترس نیست',
    unknownTrigger: 'محرک ناشناخته «{id}»',
    inoculationUnavailable: 'تلقیح «{id}» برای بافت {region} در دسترس نیست',
    unknownInoculation: 'تلقیح ناشناخته «{id}»',
    inoculated: '{name} تلقیح شد — کلونی در حال شکل‌گیری',
    dayBegins: 'روز {day} آغاز شد — کاهش شبانه بار قند ادامه دارد',
  },
  session: {
    copyLink: 'کپی لینک آزمایشگاه',
    copyTitle: 'URL قابل اشتراک با preset، ناحیه، biome و tick',
    linkCopied: 'لینک در کلیپ‌بورد کپی شد',
    linkManual: 'لینک را از پنجره کپی کنید',
    resume: 'ادامه جلسه',
    dismiss: 'شروع تازه',
    resumePrompt:
      'ادامه {preset} روی {region}؟ (~{tick}ثانیه · سد {integrity}%)',
  },
};
