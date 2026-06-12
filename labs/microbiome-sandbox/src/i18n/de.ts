import type { I18nStrings } from './en';

/** German UI strings. */
export const de: I18nStrings = {
  header: {
    title: 'BIO-DYNAMICS: GANZKÖRPER-MIKROBIOM-SANDBOX',
  },
  regions: {
    title: 'KÖRPERKARTEN-REGIONSAUSWAHL',
    back: '← Zurück zum Körper',
    keyboardHint: 'Tasten 1–7 wählen Regionen · Esc kehrt zur Körperkarte zurück',
  },
  viewport: {
    bodyMap: 'KÖRPERKARTE',
    tissueView: 'GEWEBEANSICHT',
    fullBodyTitle: 'GANZKÖRPER-MIKROBIOM-KARTE',
    clickToZoom: 'Klicken Sie auf eine hervorgehobene Region zum Zoomen',
    dragToOrbit: 'ziehen zum Drehen · scrollen zum Zoomen',
    tissueGuideTitle: 'Querschnitt-Leitfaden',
    liveMicrobes: 'Lebende Mikroben',
    microbeHint: 'Partikelformen entsprechen der Legende — Farben kodieren Mikrobentyp',
    inflammationSpike: 'ENTZÜNDUNGSSPIKE',
    autoMicroBanner: 'Wechsel zur Gewebeansicht — {region}',
  },
  preset: {
    label: 'SZENARIO',
    variant: 'SZENARIO-VARIANTE',
    standard: 'Standard-Szenario',
    lifestage: 'Lebensphasen-Kontext',
    readArticle: 'Lesen: {title} →',
  },
  stats: {
    title: 'Echtzeit-Statistiken',
    sectionBarrier: 'Barriere & Stress',
    sectionMicrobes: 'Mikrobielles Gleichgewicht',
    sectionLifecycle: 'Biotischer Lebenszyklus',
    sectionAdvanced: 'Erweiterte Signale',
    integrity: 'Barrierenintegrität',
    inflammation: 'Entzündung',
    immune: 'Immunaktivität',
    sugarLoad: 'Zuckerbelastung',
    probiotics: 'Probiotische Stämme',
    pathogens: 'Pathogene Stämme',
    allergens: 'Allergenpartikel',
    commensals: 'Kommensalen',
    biofilm: 'Biofilm-Level',
    prebiotic: 'Präbiotisches Substrat',
    postbiotic: 'Postbiotische SCFA',
    tryptophanSupport: 'Tryptophan-Unterstützung',
    tryptophanSupportTitle:
      'Lehrmodell — steigt bei ruhiger Darmschleimhaut und starker SCFA-Produktion; Serotonin-Vorstufe',
    populationScaleNote:
      'Populationszahlen nutzen ×{scale} Anzeigeskala — jede Einheit steht für ~{scale} simulierte Zellen.',
    populationScaleTitle: 'Anzeigeskala: Rohzellzahl mit {scale} multiplizieren',
    trendUp: '↑ Steigend',
    trendDown: '↓ Fallend',
    trendStable: '→ Stabil',
  },
  eventLog: {
    title: 'EREIGNISPROTOKOLL',
    showAll: 'Alle anzeigen',
    showRecent: 'Neueste',
    export: 'Exportieren',
    exportTitle: 'Vollständiges Protokoll für den Unterricht herunterladen',
    count: '{count} Ereignisse',
    newEvent: 'Neues Ereignis: {text}',
  },
  env: {
    title: 'UMWELTVARIABLEN',
    advanced: 'Erweitert',
    advancedTitle: 'pH-Bänder, Immun-Proxy und Ernährungszeitplan anzeigen',
    regionHint: '{region} — lokale Gewebebedingungen anpassen',
    daySim: 'Tagessimulation',
    daySimHintOral:
      'Orale Mahlzeiten senken kurz den pH und erhöhen die Zuckerbelastung — Hefe/Pathogene beobachten',
    daySimHintGut:
      'Darmmahlzeiten erhöhen die Lumen-Zuckerbelastung — langsamerer Abbau als oral',
    dayStatus: 'Tag {day} · als Nächstes: {meal} ({step}/{total})',
  },
  stressors: {
    title: 'STRESSOREN',
    hint: 'Klicken zum Vorschauen und Anwenden — Gewebeansicht aktualisiert sich sofort',
  },
  regional: {
    title: 'REGIONALE PFLEGE',
    suggestedHint: 'Empfohlen für {region} — klicken zum Vorschauen und Anwenden',
    tissueTreatments: 'Gewebespezifische Behandlungen',
  },
  catalog: {
    title: 'INTERVENTIONEN',
    hint: 'Vollständiger Katalog — klicken zum Vorschauen und Anwenden',
    products: 'Produkte & Lebensmittel',
    strains: 'Stammbibliothek',
    prebiotics: 'Präbiotika',
    postbiotics: 'Postbiotika',
    impactTitle: 'AKTIONSVORSCHAU',
    impactPlaceholder:
      'Klicken Sie auf einen Stressor, eine regionale Behandlung oder einen Katalogeintrag für die Vorschau.',
    closePreview: 'Vorschau schließen',
  },
  footer: {
    engine: 'ENGINE: DETERMINISTISCH · {fps} FPS ZIEL',
    disclaimer: 'Lehrmodell — keine medizinische Beratung',
    advancedNote: 'Erweiterte Panels: nur illustrativ',
    techBlog: 'Tech-Blog',
    sourceCode: 'Quellcode',
  },
  lang: {
    label: 'Sprache',
  },
  tips: {
    dismiss: 'Tipp schließen',
    allergy:
      'Allergie-Szenario: Start an Nase/Nebenhöhle, Allergen-Stressoren auslösen, dann probiotische Inokulationen testen.',
    candida:
      'Candida-Szenario: Oral-, Vaginal- oder Darmgewebe wählen — pH alkalisch verschieben, Zucker hinzufügen, dann säuernde Behandlungen.',
    lifecycle:
      'Lebenszyklus-Szenario: Darmgewebe öffnen, Stress + Präbiotika testen — Tryptophan-Unterstützung steigt, wenn Entzündung sinkt und SCFA ansteigen.',
  },
  a11y: {
    regionShortcut: '{label} — Taste {key}',
    activeAction: 'AKTIV: {label}',
    statIntegrityLow: 'Barrierenintegrität auf {pct}% gesunken',
    statIntegrityHigh: 'Barrierenintegrität auf {pct}% erholt',
    statInflammationHigh: 'Entzündung auf {pct}% gestiegen',
    statInflammationLow: 'Entzündung auf {pct}% gesunken',
  },
  events: {
    prebioticAdded: '{name} Präbiotikum hinzugefügt — Substrat für Probiotika',
    postbioticReduced: '{label} — reduzierte Wirksamkeit außerhalb {regions}',
    postbioticApplied: '{label} angewendet — postbiotische Metabolite aktiv',
    productReduced: '{label} — reduzierte Wirksamkeit außerhalb {regions}',
    triggerUnavailable: 'Trigger „{id}" für {region}-Gewebe nicht verfügbar',
    unknownTrigger: 'Unbekannter Trigger „{id}"',
    inoculationUnavailable: 'Inokulation „{id}" für {region}-Gewebe nicht verfügbar',
    unknownInoculation: 'Unbekannte Inokulation „{id}"',
    inoculated: '{name} inokuliert — Stammkolonie bildet sich',
    dayBegins: 'Tag {day} beginnt — nächtlicher Zuckerabbau setzt sich fort',
  },
  session: {
    copyLink: 'Lab-Link kopieren',
    copyTitle: 'Teilbare URL mit Preset, Region, Biom und Tick kopieren',
    linkCopied: 'Lab-Link in Zwischenablage kopiert',
    linkManual: 'Link aus dem Dialog kopieren',
    resume: 'Sitzung fortsetzen',
    dismiss: 'Neu starten',
    resumePrompt:
      '{preset} auf {region} fortsetzen? (~{tick}s Sim · Barriere {integrity}%)',
  },
};
