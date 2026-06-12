import type { RegionId } from './regions';

export type MealId = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealDef {
  id: MealId;
  label: string;
  timeLabel: string;
  /** Regions where dietary sugar load is modeled. */
  activeRegions: RegionId[];
  sugarLoad: number;
  /** Optional brief pH dip for oral after fermentable carbs. */
  oralPhDelta?: number;
  eventLog: string;
}

export const MEAL_ORDER: MealId[] = ['breakfast', 'lunch', 'dinner', 'snack'];

export const DAY_MEALS: Record<MealId, MealDef> = {
  breakfast: {
    id: 'breakfast',
    label: 'Breakfast',
    timeLabel: '~8:00',
    activeRegions: ['gut', 'oral'],
    sugarLoad: 0.35,
    oralPhDelta: -0.15,
    eventLog: 'Breakfast — fermentable carbs raise lumen sugar load (oral pH may dip briefly)',
  },
  lunch: {
    id: 'lunch',
    label: 'Lunch',
    timeLabel: '~12:30',
    activeRegions: ['gut', 'oral'],
    sugarLoad: 0.45,
    oralPhDelta: -0.12,
    eventLog: 'Lunch — sugar load spike; pathogens/yeast benefit if pH stays elevated',
  },
  dinner: {
    id: 'dinner',
    label: 'Dinner',
    timeLabel: '~18:30',
    activeRegions: ['gut', 'oral'],
    sugarLoad: 0.4,
    oralPhDelta: -0.1,
    eventLog: 'Dinner — sustained substrate for biofilm-prone oral/gut communities',
  },
  snack: {
    id: 'snack',
    label: 'Late snack',
    timeLabel: '~21:00',
    activeRegions: ['gut', 'oral'],
    sugarLoad: 0.28,
    oralPhDelta: -0.08,
    eventLog: 'Late snack — smaller sugar pulse before overnight decay',
  },
};

export const MEAL_LIST = MEAL_ORDER.map((id) => DAY_MEALS[id]);

/** Tissues where the day-simulation panel is offered. */
export const DAY_SIM_REGIONS: RegionId[] = ['gut', 'oral'];
