import type { AntibioticRoute } from './antibioticSpectra';
import type { RegionId } from './regions';
import type { MicrobeType } from '../sim/types';

export type StressorBurst = 'allergen' | 'alkaline' | 'stress' | 'default';

export interface StressorSpawn {
  type: MicrobeType;
  strain: string;
  count: number;
  fromAbove?: boolean;
}

/** Biome and vitality deltas applied when a stressor fires. */
export interface StressorBiomeDelta {
  ph?: number;
  phMin?: number;
  phMax?: number;
  moisture?: number;
  moistureMin?: number;
  moistureMax?: number;
  temperature?: number;
  temperatureMin?: number;
  temperatureMax?: number;
  sebum?: number;
  sebumMin?: number;
  sebumMax?: number;
  cerumen?: number;
  cerumenMax?: number;
  salinity?: number;
  salinityMax?: number;
  oxygenation?: number;
  oxygenationMin?: number;
  oxygenTension?: number;
  sweatRate?: number;
  sweatRateMax?: number;
  integrity?: number;
  integrityMin?: number;
  inflammation?: number;
  biofilm?: number;
  sugarLoad?: number;
  sugarLoadMax?: number;
  postbioticLevel?: number;
  postbioticMin?: number;
  allergenAdhesion?: number;
  allergenAdhesionMax?: number;
  commensalVitality?: number;
  probioticVitality?: number;
  pathogenVitality?: number;
  yeastVitality?: number;
}

export interface StressorDef {
  id: string;
  label: string;
  regions: RegionId[];
  /** Static biome delta — merged on top when `antibioticRoute` is set (SIM-02). */
  biome?: StressorBiomeDelta;
  /** Region-specific antibiotic spectrum (vitality + route-typical biome effects). */
  antibioticRoute?: AntibioticRoute;
  spawns?: StressorSpawn[];
  /** Event-log lines shown when the stressor fires. */
  log: string[];
  burst?: StressorBurst;
}

function s(
  id: string,
  label: string,
  regions: RegionId[],
  log: string[],
  biome?: StressorBiomeDelta,
  spawns?: StressorSpawn[],
  burst?: StressorBurst,
  antibioticRoute?: AntibioticRoute,
): StressorDef {
  return { id, label, regions, biome, spawns, log, burst, antibioticRoute };
}

/** Exhaustive catalog of body stressors that disrupt tissue microbiomes. */
export const STRESSORS: StressorDef[] = [
  // ── Ear canal ─────────────────────────────────────────────────────────────
  s(
    'allergen',
    'TRIGGER ALLERGEN SPIKE',
    ['ear', 'nose'],
    ['Allergen spike detected — epithelial stress rising', 'Commensals retreating from tight junctions'],
    { inflammation: 0.45, integrity: -0.25, integrityMin: 0.2, commensalVitality: -0.25 },
    [{ type: 'allergen', strain: 'pollen', count: 35, fromAbove: true }],
    'allergen',
  ),
  s(
    'dry_air',
    'DRY AIR EXPOSURE',
    ['ear', 'nose'],
    ['Dry air exposure — mucus layer thinning'],
    { moisture: -0.25, moistureMin: 0.1, integrity: -0.12, integrityMin: 0.2, allergenAdhesion: 0.3, allergenAdhesionMax: 1 },
  ),
  s(
    'cerumen_impaction',
    'CERUMEN IMPACTION',
    ['ear'],
    ['Cerumen impaction — canal narrowed, oxygenation falling'],
    { cerumen: 0.35, cerumenMax: 1, oxygenation: -0.3, oxygenationMin: 0.15, integrity: -0.15, integrityMin: 0.2 },
  ),
  s(
    'swim_exposure',
    'SWIM / WATER EXPOSURE',
    ['ear'],
    ['Swim exposure — moisture and salinity spike'],
    { moisture: 0.22, moistureMax: 1, salinity: 0.18, salinityMax: 1 },
    [{ type: 'pathogen', strain: 'P. aeruginosa', count: 6 }],
  ),
  s(
    'bacterial_ear_infection',
    'BACTERIAL OTITIS EXTERNA',
    ['ear'],
    ['Bacterial otitis — S. aureus bloom in moist canal'],
    { inflammation: 0.35, integrity: -0.18, integrityMin: 0.2, moisture: 0.1, moistureMax: 1 },
    [{ type: 'pathogen', strain: 'S. aureus', count: 14 }],
    'stress',
  ),
  s(
    'fungal_otitis',
    'FUNGAL OTITIS EXTERNA',
    ['ear'],
    ['Fungal otitis — yeast colonizing cerumen-rich canal'],
    { moisture: 0.15, moistureMax: 1, biofilm: 0.2, inflammation: 0.22 },
    [{ type: 'yeast', strain: 'C. albicans', count: 12 }],
  ),
  s(
    'hearing_aid_occlusion',
    'HEARING AID OCCLUSION',
    ['ear'],
    ['Hearing aid occlusion — trapped moisture, cerumen rising'],
    { cerumen: 0.2, cerumenMax: 1, moisture: 0.18, moistureMax: 1, oxygenation: -0.22, oxygenationMin: 0.15, biofilm: 0.15 },
  ),
  s(
    'qtip_trauma',
    'Q-TIP / MICROTRAUMA',
    ['ear'],
    ['Canal microtrauma — epithelial barrier compromised'],
    { integrity: -0.22, integrityMin: 0.2, inflammation: 0.28 },
    [{ type: 'allergen', strain: 'irritant', count: 8, fromAbove: true }],
    'allergen',
  ),
  s(
    'chlorinated_pool_ear',
    'CHLORINATED POOL WATER',
    ['ear'],
    ['Chlorinated water — pH shift and opportunistic pathogens'],
    { ph: 0.4, phMax: 7.5, moisture: 0.12, moistureMax: 1, salinity: 0.12, salinityMax: 1, integrity: -0.1, integrityMin: 0.2 },
    [{ type: 'pathogen', strain: 'P. aeruginosa', count: 8 }],
  ),
  s(
    'smoke_pollution',
    'SMOKE / AIR POLLUTION',
    ['ear', 'nose'],
    ['Smoke exposure — ciliary stress and mucosal dryness'],
    { moisture: -0.18, moistureMin: 0.12, inflammation: 0.3, oxygenation: -0.15, oxygenationMin: 0.2, commensalVitality: -0.18 },
  ),
  s(
    'contact_allergen',
    'CONTACT ALLERGEN (METAL)',
    ['ear', 'skin'],
    ['Contact allergen — nickel sensitivity at epithelial surface'],
    { inflammation: 0.32, integrity: -0.15, integrityMin: 0.2 },
    [{ type: 'allergen', strain: 'nickel', count: 22, fromAbove: true }],
    'allergen',
  ),
  s(
    'antibiotic_ear_drops',
    'ANTIBIOTIC EAR DROPS',
    ['ear'],
    ['Antibiotic ear drops — commensal depletion in canal'],
    undefined,
    undefined,
    'stress',
    'otic',
  ),

  // ── Scalp ─────────────────────────────────────────────────────────────────
  s(
    'sebum_surge',
    'SEBUM SURGE',
    ['scalp'],
    ['Sebum surge — lipid film thickens, Malassezia bloom'],
    { sebum: 0.35, sebumMax: 1, biofilm: 0.2 },
    [{ type: 'yeast', strain: 'Malassezia', count: 14 }],
  ),
  s(
    'harsh_shampoo',
    'HARSH SHAMPOO (ALKALINE)',
    ['scalp'],
    ['Harsh shampoo — alkaline wash strips sebum film'],
    { ph: 0.8, phMax: 8, sebum: -0.25, sebumMin: 0.05, commensalVitality: -0.2 },
    undefined,
    'alkaline',
  ),
  s(
    'friction_irritant',
    'FRICTION / IRRITANT',
    ['scalp', 'skin'],
    ['Friction/irritant — barrier micro-tears forming'],
    { integrity: -0.2, integrityMin: 0.2, inflammation: 0.25 },
    [{ type: 'allergen', strain: 'irritant', count: 18, fromAbove: true }],
    'allergen',
  ),
  s(
    'heat_sweat_surge',
    'HEAT / SWEAT SURGE',
    ['scalp', 'skin'],
    ['Heat and sweat — occlusive moisture on lipid-rich skin'],
    { sweatRate: 0.35, sweatRateMax: 1, moisture: 0.2, moistureMax: 1, temperature: 0.12, temperatureMax: 1, biofilm: 0.12 },
  ),
  s(
    'stress_cortisol',
    'PSYCHOSOCIAL STRESS (CORTISOL)',
    ['scalp', 'gut', 'oral'],
    ['Stress axis activation — sebum and inflammatory signaling rise'],
    { sebum: 0.18, sebumMax: 1, inflammation: 0.22, integrity: -0.1, integrityMin: 0.25 },
    undefined,
    'stress',
  ),
  s(
    'chemical_hair_dye',
    'CHEMICAL HAIR DYE',
    ['scalp'],
    ['Hair dye chemicals — scalp barrier irritation and commensal loss'],
    { ph: 0.5, phMax: 8, integrity: -0.18, integrityMin: 0.2, inflammation: 0.3, commensalVitality: -0.22 },
    [{ type: 'allergen', strain: 'irritant', count: 12, fromAbove: true }],
    'allergen',
  ),
  s(
    'uv_sun_exposure',
    'UV / SUN EXPOSURE',
    ['scalp', 'skin'],
    ['UV exposure — lipid peroxidation and barrier dryness'],
    { moisture: -0.2, moistureMin: 0.15, inflammation: 0.28, integrity: -0.15, integrityMin: 0.2, commensalVitality: -0.12 },
  ),
  s(
    'hard_water_wash',
    'HARD WATER / MINERAL BUILDUP',
    ['scalp', 'skin'],
    ['Hard water minerals — alkaline residue on acid mantle'],
    { ph: 0.45, phMax: 8, sebum: -0.12, sebumMin: 0.05, biofilm: 0.1 },
    undefined,
    'alkaline',
  ),
  s(
    'hat_occlusion',
    'HAT / HELMET OCCLUSION',
    ['scalp'],
    ['Occlusive headwear — trapped heat, moisture, and yeast niche'],
    { moisture: 0.25, moistureMax: 1, temperature: 0.1, temperatureMax: 1, biofilm: 0.22 },
    [{ type: 'yeast', strain: 'Malassezia', count: 10 }],
  ),
  s(
    'dandruff_flare',
    'DANDRUFF / SEBORRHEIC FLARE',
    ['scalp'],
    ['Seborrheic flare — Malassezia overgrowth on inflamed scalp'],
    { biofilm: 0.28, inflammation: 0.25, sebum: 0.15, sebumMax: 1 },
    [{ type: 'yeast', strain: 'Malassezia', count: 18 }],
  ),
  s(
    'chlorinated_pool_scalp',
    'CHLORINATED POOL (SCALP)',
    ['scalp'],
    ['Chlorinated pool — scalp pH disruption and lipid stripping'],
    { ph: 0.55, phMax: 8, sebum: -0.2, sebumMin: 0.05, moisture: -0.15, moistureMin: 0.2, commensalVitality: -0.15 },
    undefined,
    'alkaline',
  ),

  // ── Nose / sinus ──────────────────────────────────────────────────────────
  s(
    'histamine',
    'HISTAMINE SURGE',
    ['nose'],
    ['Histamine surge — nasal inflammation rising'],
    { inflammation: 0.35, commensalVitality: -0.15 },
    undefined,
    'allergen',
  ),
  s(
    'viral_uri',
    'VIRAL UPPER RESPIRATORY INFECTION',
    ['nose'],
    ['Viral URI — mucosal inflammation and commensal displacement'],
    { inflammation: 0.38, integrity: -0.12, integrityMin: 0.2, moisture: 0.1, moistureMax: 1, commensalVitality: -0.2 },
    [{ type: 'pathogen', strain: 'H. influenzae', count: 8 }],
    'stress',
  ),
  s(
    'bacterial_sinusitis',
    'BACTERIAL SINUSITIS',
    ['nose'],
    ['Bacterial sinusitis — pathogen bloom in stagnant mucus'],
    { inflammation: 0.42, integrity: -0.15, integrityMin: 0.2, biofilm: 0.2, moisture: 0.08, moistureMax: 1 },
    [
      { type: 'pathogen', strain: 'S. aureus', count: 10 },
      { type: 'pathogen', strain: 'H. influenzae', count: 6 },
    ],
    'stress',
  ),
  s(
    'cigarette_smoke',
    'CIGARETTE SMOKE',
    ['nose', 'oral'],
    ['Cigarette smoke — ciliary toxicity and mucosal dryness'],
    { moisture: -0.22, moistureMin: 0.12, inflammation: 0.35, oxygenation: -0.2, oxygenationMin: 0.25, commensalVitality: -0.25 },
  ),
  s(
    'cold_air_burst',
    'COLD DRY AIR BURST',
    ['nose'],
    ['Cold air burst — nasal mucosa dehydrating rapidly'],
    { moisture: -0.28, moistureMin: 0.1, temperature: -0.15, temperatureMin: 0, integrity: -0.1, integrityMin: 0.2 },
  ),
  s(
    'pollution_pm25',
    'FINE PARTICULATE POLLUTION (PM2.5)',
    ['nose'],
    ['PM2.5 exposure — oxidative stress at respiratory epithelium'],
    { inflammation: 0.32, integrity: -0.14, integrityMin: 0.2, commensalVitality: -0.12 },
    [{ type: 'allergen', strain: 'irritant', count: 14, fromAbove: true }],
    'allergen',
  ),
  s(
    'mold_spore_exposure',
    'MOLD SPORE EXPOSURE',
    ['nose'],
    ['Mold spores — allergenic load on sinonasal mucosa'],
    { inflammation: 0.4, integrity: -0.12, integrityMin: 0.2, allergenAdhesion: 0.25, allergenAdhesionMax: 1 },
    [{ type: 'allergen', strain: 'mold', count: 30, fromAbove: true }],
    'allergen',
  ),
  s(
    'occupational_dust',
    'OCCUPATIONAL DUST EXPOSURE',
    ['nose'],
    ['Occupational dust — particulate barrier stress'],
    { inflammation: 0.28, integrity: -0.16, integrityMin: 0.2 },
    [{ type: 'allergen', strain: 'Dust', count: 28, fromAbove: true }],
    'allergen',
  ),
  s(
    'decongestant_overuse',
    'DECONGESTANT OVERUSE (RHINITIS MEDICAMENTOSA)',
    ['nose'],
    ['Decongestant rebound — mucosal ischemia and dryness'],
    { moisture: -0.32, moistureMin: 0.08, integrity: -0.14, integrityMin: 0.2, inflammation: 0.18 },
  ),

  // ── Oral ──────────────────────────────────────────────────────────────────
  s(
    'thrush_bloom',
    'ORAL THRUSH BLOOM',
    ['oral'],
    ['Oral thrush bloom — C. albicans patches spreading'],
    { biofilm: 0.3, inflammation: 0.2 },
    [{ type: 'yeast', strain: 'C. albicans', count: 22 }],
  ),
  s(
    'dry_mouth',
    'DRY MOUTH (XEROSTOMIA)',
    ['oral'],
    ['Dry mouth — saliva film depleted, yeast adhesion rising'],
    { moisture: -0.35, moistureMin: 0.12, salinity: 0.1, salinityMax: 1 },
    [{ type: 'yeast', strain: 'C. albicans', count: 10 }],
  ),
  s(
    'sugar_exposure',
    'SUGAR / CARB EXPOSURE',
    ['oral'],
    ['Sugar exposure — acid-tolerant pathogens mobilizing'],
    { sugarLoad: 0.7, sugarLoadMax: 1, ph: 0.3, phMax: 7.5 },
    [{ type: 'pathogen', strain: 'S. mutans', count: 8 }],
  ),
  s(
    'acid_reflux_lpr',
    'ACID REFLUX / LPR',
    ['oral'],
    ['Acid reflux — gastric acid insult to oral mucosa'],
    { ph: -0.6, phMin: 4.5, inflammation: 0.28, integrity: -0.14, integrityMin: 0.2 },
    undefined,
    'stress',
  ),
  s(
    'alcohol_exposure',
    'ALCOHOL EXPOSURE',
    ['oral', 'gut'],
    ['Alcohol exposure — mucosal dehydration and dysbiosis risk'],
    { moisture: -0.2, moistureMin: 0.15, inflammation: 0.25, commensalVitality: -0.18 },
    [{ type: 'yeast', strain: 'C. albicans', count: 6 }],
  ),
  s(
    'chlorhexidine_rinse',
    'CHLORHEXIDINE / ANTISEPTIC RINSE',
    ['oral'],
    ['Antiseptic rinse — broad commensal and probiotic depletion'],
    { commensalVitality: -0.4, probioticVitality: -0.35, biofilm: -0.1 },
    undefined,
    'stress',
  ),
  s(
    'poor_oral_hygiene',
    'POOR ORAL HYGIENE / PLAQUE',
    ['oral'],
    ['Plaque accumulation — S. mutans biofilm maturation'],
    { biofilm: 0.35, sugarLoad: 0.25, sugarLoadMax: 1, ph: 0.15, phMax: 7.2 },
    [{ type: 'pathogen', strain: 'S. mutans', count: 14 }],
  ),
  s(
    'acidic_beverage',
    'ACIDIC BEVERAGE (SODA / CITRUS)',
    ['oral'],
    ['Acidic beverage — enamel-adjacent pH drop and dysbiosis'],
    { ph: -0.45, phMin: 5.0, sugarLoad: 0.35, sugarLoadMax: 1 },
    [{ type: 'pathogen', strain: 'S. mutans', count: 6 }],
  ),
  s(
    'mouth_breathing',
    'MOUTH BREATHING (NASAL OBSTRUCTION)',
    ['oral'],
    ['Mouth breathing — chronic oral desiccation'],
    { moisture: -0.28, moistureMin: 0.1, salinity: 0.08, salinityMax: 1, inflammation: 0.15 },
    [{ type: 'yeast', strain: 'C. albicans', count: 8 }],
  ),
  s(
    'immunosuppression',
    'IMMUNOSUPPRESSION',
    ['oral', 'vaginal', 'gut'],
    ['Immunosuppression — opportunistic yeast and pathogen expansion'],
    { inflammation: 0.2, integrity: -0.12, integrityMin: 0.2, commensalVitality: -0.2 },
    [{ type: 'yeast', strain: 'C. albicans', count: 10 }],
    'stress',
  ),
  s(
    'radiation_xerostomia',
    'RADIATION-INDUCED XEROSTOMIA',
    ['oral'],
    ['Radiation xerostomia — severe salivary gland hypofunction'],
    { moisture: -0.45, moistureMin: 0.08, integrity: -0.18, integrityMin: 0.2, commensalVitality: -0.3 },
    [{ type: 'yeast', strain: 'C. albicans', count: 16 }],
  ),

  // ── Skin ──────────────────────────────────────────────────────────────────
  s(
    'alkaline',
    'RAISE pH + SUGAR LOAD',
    ['skin'],
    ['Alkaline shift + sugar load — C. albicans expansion'],
    { ph: 0.6, phMax: 8, sugarLoad: 0.6, sugarLoadMax: 1, biofilm: 0.35 },
    [
      { type: 'yeast', strain: 'C. albicans', count: 28 },
      { type: 'pathogen', strain: 'S. aureus', count: 8 },
    ],
    'alkaline',
  ),
  s(
    'topical_antibiotic',
    'TOPICAL ANTIBIOTIC',
    ['skin'],
    ['Topical antibiotic — commensal diversity reduced'],
    undefined,
    undefined,
    'stress',
    'topical',
  ),
  s(
    'occlusive_sweat',
    'OCCLUSIVE SWEAT / TIGHT CLOTHING',
    ['skin'],
    ['Occlusive sweat — warm moist niche favors yeast and biofilm'],
    { moisture: 0.28, moistureMax: 1, temperature: 0.1, temperatureMax: 1, biofilm: 0.25 },
    [{ type: 'yeast', strain: 'C. albicans', count: 12 }],
  ),
  s(
    'detergent_residue',
    'HARSH DETERGENT / SOAP RESIDUE',
    ['skin'],
    ['Detergent residue — acid mantle disruption on stratum corneum'],
    { ph: 0.5, phMax: 8, integrity: -0.16, integrityMin: 0.2, moisture: -0.12, moistureMin: 0.2, commensalVitality: -0.15 },
    undefined,
    'alkaline',
  ),
  s(
    'eczema_flare',
    'ECZEMA / ATOPIC FLARE',
    ['skin'],
    ['Eczema flare — barrier defect and Staphylococcus colonization'],
    { inflammation: 0.38, integrity: -0.25, integrityMin: 0.15, commensalVitality: -0.2 },
    [
      { type: 'pathogen', strain: 'S. aureus', count: 12 },
      { type: 'allergen', strain: 'irritant', count: 10, fromAbove: true },
    ],
    'allergen',
  ),
  s(
    'hot_shower_soap',
    'HOT SHOWER + ALKALINE SOAP',
    ['skin'],
    ['Hot alkaline wash — lipid barrier stripped from skin surface'],
    { ph: 0.7, phMax: 8, sebum: -0.2, sebumMin: 0.05, moisture: -0.15, moistureMin: 0.2, integrity: -0.1, integrityMin: 0.2 },
    undefined,
    'alkaline',
  ),
  s(
    'staph_colonization',
    'S. AUREUS COLONIZATION',
    ['skin'],
    ['S. aureus colonization — pathogen niche on compromised skin'],
    { biofilm: 0.2, inflammation: 0.22 },
    [{ type: 'pathogen', strain: 'S. aureus', count: 16 }],
    'stress',
  ),
  s(
    'fungal_intertrigo',
    'FUNGAL INTERTRIGO',
    ['skin'],
    ['Intertrigo — Candida bloom in skin folds'],
    { moisture: 0.22, moistureMax: 1, sugarLoad: 0.2, sugarLoadMax: 1, biofilm: 0.25, inflammation: 0.2 },
    [{ type: 'yeast', strain: 'C. albicans', count: 20 }],
  ),
  s(
    'dehydration',
    'DEHYDRATION / LOW TEWL RECOVERY',
    ['skin'],
    ['Dehydration — transepidermal water loss exceeds replenishment'],
    { moisture: -0.25, moistureMin: 0.15, integrity: -0.14, integrityMin: 0.2 },
  ),
  s(
    'hormonal_fluctuation',
    'HORMONAL FLUCTUATION',
    ['skin', 'vaginal'],
    ['Hormonal shift — sebum and glycogen substrate changes'],
    { sebum: 0.2, sebumMax: 1, moisture: 0.1, moistureMax: 1, sugarLoad: 0.15, sugarLoadMax: 1, inflammation: 0.12 },
  ),

  // ── Vaginal ─────────────────────────────────────────────────────────────────
  s(
    'alkaline_flush',
    'ALKALINE FLUSH (pH DISRUPTION)',
    ['vaginal'],
    ['Alkaline flush — vaginal pH disrupted, Candida bloom risk'],
    { ph: 1.2, phMax: 7.5, integrity: -0.18, integrityMin: 0.2 },
    [
      { type: 'yeast', strain: 'C. albicans', count: 16 },
      { type: 'pathogen', strain: 'Gardnerella', count: 6 },
    ],
    'alkaline',
  ),
  s(
    'antibiotic_course',
    'ANTIBIOTIC COURSE',
    ['vaginal'],
    ['Antibiotic course — Lactobacillus depleted, pH rising'],
    undefined,
    undefined,
    'stress',
    'vaginal_systemic',
  ),
  s(
    'glycogen_spike',
    'GLYCOGEN / SUGAR SPIKE',
    ['vaginal'],
    ['Glycogen spike — yeast substrate surge in mucosa'],
    { sugarLoad: 0.55, sugarLoadMax: 1, moisture: 0.12, moistureMax: 1 },
    [{ type: 'yeast', strain: 'C. albicans', count: 12 }],
  ),
  s(
    'douching',
    'DOUCHING / VAGINAL WASH',
    ['vaginal'],
    ['Douching — lactobacilli washed out, pH rises sharply'],
    { ph: 1.0, phMax: 7.2, moisture: -0.1, moistureMin: 0.25, commensalVitality: -0.35, probioticVitality: -0.4 },
    [{ type: 'pathogen', strain: 'Gardnerella', count: 10 }],
    'alkaline',
  ),
  s(
    'menstrual_flow',
    'MENSTRUAL FLOW',
    ['vaginal'],
    ['Menstrual flow — transient pH rise and iron-rich substrate'],
    { ph: 0.6, phMax: 6.8, moisture: 0.15, moistureMax: 1, inflammation: 0.12 },
    [{ type: 'pathogen', strain: 'Gardnerella', count: 4 }],
  ),
  s(
    'hormonal_contraceptive',
    'HORMONAL CONTRACEPTIVE SHIFT',
    ['vaginal'],
    ['Hormonal contraceptive — estrogen-driven glycogen and pH changes'],
    { ph: 0.35, phMax: 5.5, sugarLoad: 0.2, sugarLoadMax: 1, moisture: 0.08, moistureMax: 1 },
  ),
  s(
    'perfumed_products',
    'SCENTED / PERFUMED PRODUCTS',
    ['vaginal'],
    ['Perfumed products — mucosal irritant contact dermatitis'],
    { inflammation: 0.3, integrity: -0.16, integrityMin: 0.2, commensalVitality: -0.12 },
    [{ type: 'allergen', strain: 'irritant', count: 12, fromAbove: true }],
    'allergen',
  ),
  s(
    'synthetic_clothing',
    'SYNTHETIC / NON-BREATHABLE CLOTHING',
    ['vaginal'],
    ['Synthetic clothing — trapped heat and moisture favor yeast'],
    { moisture: 0.2, moistureMax: 1, temperature: 0.08, temperatureMax: 1, biofilm: 0.15 },
    [{ type: 'yeast', strain: 'C. albicans', count: 8 }],
  ),
  s(
    'semen_exposure',
    'SEMEN EXPOSURE (pH ALKALINIZATION)',
    ['vaginal'],
    ['Semen exposure — alkaline pH shift disrupts lactobacilli'],
    { ph: 0.9, phMax: 7.0, probioticVitality: -0.15 },
    [{ type: 'yeast', strain: 'C. albicans', count: 6 }],
    'alkaline',
  ),
  s(
    'heat_humidity',
    'HEAT / HUMIDITY EXPOSURE',
    ['vaginal'],
    ['Heat and humidity — warm moist environment for yeast overgrowth'],
    { moisture: 0.18, moistureMax: 1, temperature: 0.1, temperatureMax: 1 },
    [{ type: 'yeast', strain: 'C. albicans', count: 10 }],
  ),
  s(
    'spermicide_irritant',
    'SPERMICIDE / CHEMICAL IRRITANT',
    ['vaginal'],
    ['Spermicide — chemical barrier damage and commensal loss'],
    { integrity: -0.2, integrityMin: 0.2, inflammation: 0.28, commensalVitality: -0.25, probioticVitality: -0.2 },
    [{ type: 'allergen', strain: 'irritant', count: 8, fromAbove: true }],
    'allergen',
  ),

  // ── Gut ─────────────────────────────────────────────────────────────────────
  s(
    'stress',
    'SIMULATE MILD STRESS',
    ['gut'],
    ['Mild stress applied to epithelium'],
    { integrity: -0.15, integrityMin: 0.3, inflammation: 0.2 },
    undefined,
    'stress',
  ),
  s(
    'enteropathogen_bloom',
    'ENTEROPATHOGEN BLOOM',
    ['gut'],
    ['Enteropathogen bloom — gut inflammation rising'],
    { inflammation: 0.3 },
    [{ type: 'pathogen', strain: 'Enteropathogen', count: 12 }],
    'stress',
  ),
  s(
    'antibiotic_disruption',
    'ANTIBIOTIC DISRUPTION',
    ['gut'],
    ['Antibiotic disruption — commensals depleted, SCFA falling'],
    undefined,
    undefined,
    'stress',
    'gut_broad',
  ),
  s(
    'low_fiber_diet',
    'LOW-FIBER / WESTERN DIET',
    ['gut'],
    ['Low fiber intake — SCFA production and commensal diversity fall'],
    { postbioticLevel: -0.25, postbioticMin: 0, commensalVitality: -0.2, sugarLoad: 0.15, sugarLoadMax: 1 },
  ),
  s(
    'high_fat_meal',
    'HIGH-FAT / FATTY MEAL',
    ['gut'],
    ['High-fat meal — bile surge and transient dysbiosis'],
    { inflammation: 0.25, integrity: -0.08, integrityMin: 0.25, ph: 0.15, phMax: 7.0 },
  ),
  s(
    'food_poisoning',
    'FOOD POISONING',
    ['gut'],
    ['Food poisoning — enteropathogen surge and barrier stress'],
    { inflammation: 0.42, integrity: -0.2, integrityMin: 0.2 },
    [{ type: 'pathogen', strain: 'Enteropathogen', count: 18 }],
    'stress',
  ),
  s(
    'alcohol_binge',
    'ALCOHOL BINGE',
    ['gut'],
    ['Alcohol binge — mucosal permeability and inflammation rise'],
    { integrity: -0.22, integrityMin: 0.2, inflammation: 0.35, commensalVitality: -0.25, postbioticLevel: -0.15, postbioticMin: 0 },
    undefined,
    'stress',
  ),
  s(
    'nsaid_exposure',
    'NSAID / ASPIRIN EXPOSURE',
    ['gut'],
    ['NSAID exposure — COX inhibition damages gut mucosal barrier'],
    { integrity: -0.25, integrityMin: 0.2, inflammation: 0.3 },
    undefined,
    'stress',
  ),
  s(
    'gluten_challenge',
    'GLUTEN / FOOD SENSITIVITY CHALLENGE',
    ['gut'],
    ['Gluten challenge — immune activation at gut mucosa'],
    { inflammation: 0.35, integrity: -0.12, integrityMin: 0.25 },
    [{ type: 'allergen', strain: 'Food antigen', count: 20, fromAbove: true }],
    'allergen',
  ),
  s(
    'emulsifier_load',
    'EMULSIFIER / ULTRA-PROCESSED FOOD',
    ['gut'],
    ['Emulsifier load — mucus layer erosion and dysbiosis'],
    { integrity: -0.18, integrityMin: 0.2, inflammation: 0.22, commensalVitality: -0.15 },
  ),
  s(
    'sleep_deprivation',
    'SLEEP DEPRIVATION',
    ['gut'],
    ['Sleep deprivation — HPA axis stress disrupts gut barrier'],
    { integrity: -0.12, integrityMin: 0.25, inflammation: 0.18, commensalVitality: -0.1 },
    undefined,
    'stress',
  ),
  s(
    'viral_gastroenteritis',
    'VIRAL GASTROENTERITIS',
    ['gut'],
    ['Viral gastroenteritis — acute gut inflammation and fluid loss'],
    { inflammation: 0.4, integrity: -0.18, integrityMin: 0.2, moisture: -0.15, moistureMin: 0.35 },
    [{ type: 'pathogen', strain: 'Enteropathogen', count: 10 }],
    'stress',
  ),
  s(
    'ppi_antacid',
    'PPI / ANTACID USE',
    ['gut'],
    ['PPI/antacid — gastric pH rise alters downstream gut ecology'],
    { ph: 0.5, phMax: 7.5, commensalVitality: -0.12, postbioticLevel: -0.1, postbioticMin: 0 },
  ),
  s(
    'processed_food_load',
    'PROCESSED FOOD / ADDED SUGAR LOAD',
    ['gut'],
    ['Processed food — sugar spike with low fermentable fiber'],
    { sugarLoad: 0.5, sugarLoadMax: 1, postbioticLevel: -0.12, postbioticMin: 0, inflammation: 0.15 },
  ),
  s(
    'intense_exercise',
    'INTENSE EXERCISE (GUT ISCHEMIA)',
    ['gut'],
    ['Intense exercise — transient gut ischemia and barrier leak'],
    { integrity: -0.14, integrityMin: 0.25, inflammation: 0.2, moisture: -0.08, moistureMin: 0.4 },
    undefined,
    'stress',
  ),
  s(
    'travelers_diarrhea',
    'TRAVELER\'S DIARRHEA',
    ['gut'],
    ["Traveler's diarrhea — novel enteropathogen introduction"],
    { inflammation: 0.38, integrity: -0.16, integrityMin: 0.2, moisture: -0.1, moistureMin: 0.35 },
    [{ type: 'pathogen', strain: 'Enteropathogen', count: 14 }],
    'stress',
  ),
  s(
    'c_diff_after_antibiotics',
    'C. DIFF AFTER ANTIBIOTICS',
    ['gut'],
    ['Post-antibiotic C. difficile — commensal niche collapse'],
    {
      commensalVitality: -0.12,
      probioticVitality: -0.1,
      integrity: -0.12,
      integrityMin: 0.15,
      inflammation: 0.33,
      postbioticLevel: -0.12,
      postbioticMin: 0,
    },
    [{ type: 'pathogen', strain: 'Enteropathogen', count: 16 }],
    'stress',
    'gut_broad',
  ),
  s(
    'food_allergen',
    'FOOD ALLERGEN EXPOSURE',
    ['gut'],
    ['Food allergen — IgE-mediated mucosal immune activation'],
    { inflammation: 0.32, integrity: -0.1, integrityMin: 0.25 },
    [{ type: 'allergen', strain: 'Food antigen', count: 24, fromAbove: true }],
    'allergen',
  ),
];

const STRESSOR_BY_ID = new Map(STRESSORS.map((s) => [s.id, s]));

export function getStressor(id: string): StressorDef | undefined {
  return STRESSOR_BY_ID.get(id);
}

export function getStressorsForRegion(regionId: RegionId): StressorDef[] {
  return STRESSORS.filter((s) => s.regions.includes(regionId));
}

export function stressorActionsForRegion(regionId: RegionId): { id: string; label: string }[] {
  return getStressorsForRegion(regionId).map(({ id, label }) => ({ id, label }));
}

export function stressorBurstKind(id: string): StressorBurst {
  const def = getStressor(id);
  if (def?.burst) return def.burst;
  if (id === 'allergen' || id === 'histamine' || id.startsWith('friction')) return 'allergen';
  if (id.includes('alkaline') || id.includes('harsh') || id.includes('detergent')) return 'alkaline';
  if (id.includes('stress') || id.includes('antibiotic') || id.includes('pathogen')) return 'stress';
  return 'default';
}
