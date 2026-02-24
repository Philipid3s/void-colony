import { ResourceId } from './resources';

export interface Recipe {
  id: string;
  name: string;
  buildingTypes: string[]; // which buildings can run this
  inputs: { resource: ResourceId; amount: number }[];
  outputs: { resource: ResourceId; amount: number }[];
  timeTicks: number; // how long one batch takes
  workersNeeded: number;
}

// Time helper: game-hours to ticks
const h = (hours: number) => hours * 30;

export const RECIPES: Recipe[] = [
  // ── Smelter ──────────────────────────────────────────────────────────────
  {
    id: 'smelt_steel',
    name: 'Smelt Steel',
    buildingTypes: ['smelter'],
    inputs: [{ resource: 'iron_ore', amount: 15 }, { resource: 'coal', amount: 5 }],
    outputs: [{ resource: 'steel', amount: 10 }],
    timeTicks: h(1),
    workersNeeded: 2,
  },
  {
    id: 'smelt_glass',
    name: 'Smelt Glass',
    buildingTypes: ['smelter'],
    inputs: [{ resource: 'sand', amount: 20 }],
    outputs: [{ resource: 'glass', amount: 5 }],
    timeTicks: h(1),
    workersNeeded: 1,
  },
  {
    id: 'smelt_alloy_plates',
    name: 'Cast Alloy Plates',
    buildingTypes: ['smelter', 'workshop_adv'],
    inputs: [{ resource: 'titanium', amount: 10 }, { resource: 'nickel', amount: 5 }],
    outputs: [{ resource: 'alloy_plates', amount: 3 }],
    timeTicks: h(2),
    workersNeeded: 2,
  },

  // ── Workshop ──────────────────────────────────────────────────────────────
  {
    id: 'make_concrete',
    name: 'Mix Concrete',
    buildingTypes: ['repair_station', 'workshop_adv'],
    inputs: [{ resource: 'sand', amount: 10 }, { resource: 'clay', amount: 5 }, { resource: 'water', amount: 5 }],
    outputs: [{ resource: 'concrete', amount: 10 }],
    timeTicks: h(1),
    workersNeeded: 1,
  },
  {
    id: 'make_plastic',
    name: 'Process Plastic',
    buildingTypes: ['chem_lab', 'workshop_adv'],
    inputs: [{ resource: 'oil', amount: 10 }],
    outputs: [{ resource: 'plastic', amount: 8 }],
    timeTicks: h(1),
    workersNeeded: 1,
  },
  {
    id: 'make_electronics',
    name: 'Assemble Electronics',
    buildingTypes: ['workshop_adv', 'fab_plant'],
    inputs: [{ resource: 'copper', amount: 5 }, { resource: 'silicon', amount: 3 }, { resource: 'gold', amount: 1 }],
    outputs: [{ resource: 'electronics', amount: 5 }],
    timeTicks: h(2),
    workersNeeded: 2,
  },
  {
    id: 'make_wiring',
    name: 'Fabricate Wiring',
    buildingTypes: ['workshop_adv', 'repair_station'],
    inputs: [{ resource: 'copper', amount: 3 }, { resource: 'plastic', amount: 2 }],
    outputs: [{ resource: 'wiring', amount: 10 }],
    timeTicks: h(1),
    workersNeeded: 1,
  },
  {
    id: 'make_battery_cells',
    name: 'Assemble Battery Cells',
    buildingTypes: ['workshop_adv', 'fab_plant'],
    inputs: [{ resource: 'lithium', amount: 5 }, { resource: 'nickel', amount: 3 }, { resource: 'copper', amount: 2 }],
    outputs: [{ resource: 'battery_cells', amount: 3 }],
    timeTicks: h(2),
    workersNeeded: 2,
  },
  {
    id: 'make_insulation',
    name: 'Make Insulation',
    buildingTypes: ['workshop_adv'],
    inputs: [{ resource: 'clay', amount: 5 }, { resource: 'plastic', amount: 3 }],
    outputs: [{ resource: 'insulation', amount: 5 }],
    timeTicks: h(1),
    workersNeeded: 1,
  },
  {
    id: 'make_carbon_fiber',
    name: 'Produce Carbon Fiber',
    buildingTypes: ['workshop_adv', 'fab_plant'],
    inputs: [{ resource: 'coal', amount: 10 }],
    outputs: [{ resource: 'carbon_fiber', amount: 3 }],
    timeTicks: h(3),
    workersNeeded: 2,
  },
  {
    id: 'make_optical_fiber',
    name: 'Draw Optical Fiber',
    buildingTypes: ['fab_plant'],
    inputs: [{ resource: 'glass', amount: 5 }, { resource: 'rare_earth', amount: 2 }],
    outputs: [{ resource: 'optical_fiber', amount: 10 }],
    timeTicks: h(2),
    workersNeeded: 2,
  },

  // ── Chemical Lab ──────────────────────────────────────────────────────────
  {
    id: 'make_medicine',
    name: 'Produce Medicine',
    buildingTypes: ['chem_lab'],
    inputs: [{ resource: 'biomass', amount: 5 }, { resource: 'water', amount: 3 }],
    outputs: [{ resource: 'medicine', amount: 3 }],
    timeTicks: h(2),
    workersNeeded: 1,
  },
  {
    id: 'make_fertilizer',
    name: 'Mix Fertilizer',
    buildingTypes: ['chem_lab'],
    inputs: [{ resource: 'sulfur', amount: 5 }, { resource: 'biomass', amount: 3 }, { resource: 'water', amount: 2 }],
    outputs: [{ resource: 'fertilizer', amount: 8 }],
    timeTicks: h(1),
    workersNeeded: 1,
  },
  {
    id: 'make_rocket_fuel',
    name: 'Synthesize Rocket Fuel',
    buildingTypes: ['chem_lab'],
    inputs: [{ resource: 'oil', amount: 20 }, { resource: 'hydrogen', amount: 10 }],
    outputs: [{ resource: 'rocket_fuel', amount: 15 }],
    timeTicks: h(3),
    workersNeeded: 2,
  },
  {
    id: 'make_hydrogen',
    name: 'Electrolyze Hydrogen',
    buildingTypes: ['chem_lab'],
    inputs: [{ resource: 'water', amount: 10 }],
    outputs: [{ resource: 'hydrogen', amount: 8 }, { resource: 'oxygen', amount: 4 }],
    timeTicks: h(2),
    workersNeeded: 1,
  },
];
