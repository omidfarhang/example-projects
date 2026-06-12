/** English UI strings — default locale. */
export const en = {
  header: {
    title: 'BIO-DYNAMICS: FULL-BODY MICROBIOME SANDBOX',
  },
  regions: {
    title: 'BODY-MAP REGION SELECTOR',
    back: '← Back to body',
    keyboardHint: 'Keys 1–7 select active regions · Esc returns to body map',
  },
  viewport: {
    bodyMap: 'BODY MAP',
    tissueView: 'TISSUE VIEW',
    fullBodyTitle: 'FULL-BODY MICROBIOME MAP',
    clickToZoom: 'Click a highlighted region to zoom in',
    inflammationSpike: 'INFLAMMATION SPIKE',
    autoMicroBanner: 'Entering tissue view — {region}',
  },
  preset: {
    label: 'PRESET',
    variant: 'SCENARIO VARIANT',
    standard: 'Standard scenario',
    lifestage: 'Life-stage context',
    readArticle: 'Read: {title} →',
  },
  stats: {
    title: 'REAL-TIME STATS',
    integrity: 'Barrier integrity',
    inflammation: 'Inflammation',
    immune: 'Immune activity',
    sugarLoad: 'Sugar load',
    probiotics: 'Probiotic strains',
    pathogens: 'Pathogen strains',
    allergens: 'Allergen particles',
    commensals: 'Commensal count',
    biofilm: 'Biofilm level',
    prebiotic: 'Prebiotic substrate',
    postbiotic: 'Postbiotic SCFA',
    populationScaleNote:
      'Population counts use ×{scale} display scale — each unit represents ~{scale} simulated cells for readability.',
    populationScaleTitle: 'Display scale: multiply raw cell count by {scale}',
    trendUp: '↑ Increasing',
    trendDown: '↓ Decreasing',
    trendStable: '→ Stable',
  },
  eventLog: {
    title: 'EVENT LOG',
    showAll: 'Show all',
    showRecent: 'Show recent',
    export: 'Export',
    exportTitle: 'Download full log for classroom use',
    count: '{count} events',
    newEvent: 'New event: {text}',
  },
  env: {
    title: 'ENVIRONMENTAL VARIABLES',
    advanced: 'Advanced',
    advancedTitle: 'Show cited pH bands, immune proxy, and diet timeline',
    regionHint: '{region} — adjust local tissue conditions',
    daySim: 'Day simulation',
    daySimHintOral:
      'Oral meals briefly dip pH and raise sugar load — watch yeast/pathogen response',
    daySimHintGut:
      'Gut meals raise lumen sugar load — slower decay than oral saliva clearance',
    dayStatus: 'Day {day} · next: {meal} ({step}/{total})',
  },
  stressors: {
    title: 'STRESSORS',
    hint: 'Click to preview and apply — tissue view updates immediately',
  },
  regional: {
    title: 'REGIONAL CARE',
    suggestedHint: 'Suggested for {region} — click to preview and apply',
    tissueTreatments: 'Tissue-specific treatments',
  },
  catalog: {
    title: 'INTERVENTIONS',
    hint: 'Full catalog — click to preview and apply',
    products: 'Products & foods',
    strains: 'Strain library',
    prebiotics: 'Prebiotics',
    postbiotics: 'Postbiotics',
    impactTitle: 'ACTION PREVIEW',
    impactPlaceholder:
      'Click any stressor, regional treatment, or catalog item to preview its effect on this tissue.',
    closePreview: 'Close preview',
  },
  footer: {
    engine: 'ENGINE: DETERMINISTIC · {fps} FPS TARGET',
    disclaimer: 'Educational model — not medical advice',
    advancedNote: 'Advanced panels: illustrative only',
    techBlog: 'Tech Blog',
    sourceCode: 'Source Code',
  },
  lang: {
    label: 'Language',
  },
  tips: {
    dismiss: 'Dismiss tip',
    allergy:
      'Allergy preset: start on nose/sinus, run allergen triggers, then try probiotic inoculations to watch barrier recovery.',
    candida:
      'Candida preset: pick oral, vaginal, or gut tissue — shift pH alkaline and add sugar load, then acidifying treatments.',
    lifecycle:
      'Lifecycle preset: open gut tissue, add prebiotic fiber, watch probiotics convert substrate into postbiotic SCFA.',
  },
  a11y: {
    regionShortcut: '{label} — press {key}',
    activeAction: 'ACTIVE: {label}',
    statIntegrityLow: 'Barrier integrity dropped to {pct}%',
    statIntegrityHigh: 'Barrier integrity recovered to {pct}%',
    statInflammationHigh: 'Inflammation rose to {pct}%',
    statInflammationLow: 'Inflammation eased to {pct}%',
  },
  events: {
    prebioticAdded: '{name} prebiotic added — substrate for probiotics',
    postbioticReduced: '{label} — reduced efficacy outside {regions}',
    postbioticApplied: '{label} applied — postbiotic metabolites active',
    productReduced: '{label} — reduced efficacy outside {regions}',
    triggerUnavailable: 'Trigger "{id}" not available for {region} tissue',
    unknownTrigger: 'Unknown trigger "{id}"',
    inoculationUnavailable: 'Inoculation "{id}" not available for {region} tissue',
    unknownInoculation: 'Unknown inoculation "{id}"',
    inoculated: '{name} inoculated — strain colony forming',
    dayBegins: 'Day {day} begins — overnight sugar load decay continues',
  },
  session: {
    copyLink: 'Copy lab link',
    copyTitle: 'Copy shareable URL with preset, region, biome, tick, and microbe positions',
    linkCopied: 'Lab link copied to clipboard',
    linkManual: 'Copy the link from the dialog',
    resume: 'Resume session',
    dismiss: 'Start fresh',
    resumePrompt:
      'Resume {preset} on {region}? (~{tick}s sim · barrier {integrity}%)',
  },
} as const;

export type I18nStrings = typeof en;
