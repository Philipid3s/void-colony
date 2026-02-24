import { ResourceId } from './resources';

export type BuildingId =
  | 'ship' | 'quarters_basic' | 'cooking_station' | 'warehouse_small'
  | 'repair_station' | 'radio_broken'
  | 'water_well' | 'atmo_condenser' | 'solar_array' | 'mine_basic'
  | 'hydroponics' | 'insect_farm' | 'algae_tank' | 'storage_depot'
  | 'fence' | 'comms_relay'
  | 'research_lab' | 'infirmary' | 'geothermal' | 'mine_advanced'
  | 'mushroom_farm' | 'seaweed_farm' | 'recycling_center' | 'water_purifier'
  | 'dormitory' | 'rec_room' | 'smelter' | 'chem_lab' | 'workshop_adv'
  | 'nuclear_reactor' | 'hospital' | 'drone_bay' | 'vehicle_hangar'
  | 'bio_dome' | 'observatory' | 'defense_turret' | 'fab_plant'
  | 'bunker' | 'spaceport'
  | 'radio_repaired' | 'rescue_beacon' | 'fusion_reactor'
  | 'terraform_hub' | 'monument';

export type BuildingTier = 0 | 1 | 2 | 3 | 4;

export interface BuildingCost {
  resource: ResourceId;
  amount: number;
}

export interface BuildingProduction {
  resource: ResourceId;
  perTick: number; // units per tick (1 tick = 2s real = 1/30 game-hour)
}

export interface BuildingConsumption {
  resource: ResourceId;
  perTick: number;
}

export interface BuildingDef {
  id: BuildingId;
  name: string;
  tier: BuildingTier;
  cost: BuildingCost[];
  buildTimeTicks: number; // 0 = pre-built
  workers: { min: number; max: number };
  energyCostPerTick: number;
  production: BuildingProduction[];
  consumption: BuildingConsumption[];
  storageBonus?: number;
  crewCapacity?: number;
  prereqTech?: string;
  description: string;
}

// Helper: convert game-hours to ticks  (1 game-hour = 30 ticks)
const h = (hours: number) => hours * 30;

export const BUILDINGS: Record<BuildingId, BuildingDef> = {
  // ── Starting buildings ──────────────────────────────────────────────────
  ship: {
    id: 'ship', name: 'Crashed Ship', tier: 0,
    cost: [], buildTimeTicks: 0, workers: { min: 0, max: 0 },
    energyCostPerTick: 0, production: [], consumption: [],
    description: 'Main hub with basic systems and salvageable parts.',
  },
  quarters_basic: {
    id: 'quarters_basic', name: 'Basic Living Quarters', tier: 0,
    cost: [], buildTimeTicks: 0, workers: { min: 0, max: 0 },
    energyCostPerTick: 0.02, production: [], consumption: [],
    crewCapacity: 50,
    description: 'Cramped sleeping area for the crew.',
  },
  cooking_station: {
    id: 'cooking_station', name: 'Cooking Station', tier: 0,
    cost: [], buildTimeTicks: 0, workers: { min: 1, max: 3 },
    energyCostPerTick: 0.01, production: [], consumption: [],
    description: 'Basic food preparation. Converts food for better morale.',
  },
  warehouse_small: {
    id: 'warehouse_small', name: 'Small Warehouse', tier: 0,
    cost: [], buildTimeTicks: 0, workers: { min: 0, max: 0 },
    energyCostPerTick: 0, production: [], consumption: [],
    storageBonus: 500,
    description: 'Basic resource storage.',
  },
  repair_station: {
    id: 'repair_station', name: 'Repair Station', tier: 0,
    cost: [], buildTimeTicks: 0, workers: { min: 1, max: 4 },
    energyCostPerTick: 0.01, production: [], consumption: [],
    description: 'Basic workshop for repairs.',
  },
  radio_broken: {
    id: 'radio_broken', name: 'Radio Transmitter', tier: 0,
    cost: [], buildTimeTicks: 0, workers: { min: 0, max: 0 },
    energyCostPerTick: 0, production: [], consumption: [],
    description: 'Damaged beyond basic repair. Requires advanced research.',
  },

  // ── Tier 1 ──────────────────────────────────────────────────────────────
  water_well: {
    id: 'water_well', name: 'Water Well', tier: 1,
    cost: [{ resource: 'iron_ore', amount: 50 }, { resource: 'steel', amount: 20 }],
    buildTimeTicks: h(6), workers: { min: 1, max: 2 },
    energyCostPerTick: 0.02,
    production: [{ resource: 'water', perTick: 20 / 30 }], // 20L/h → per tick
    consumption: [],
    description: 'Extracts underground water. Produces 20L/h.',
  },
  atmo_condenser: {
    id: 'atmo_condenser', name: 'Atmospheric Condenser', tier: 1,
    cost: [{ resource: 'aluminium', amount: 30 }, { resource: 'electronics', amount: 10 }],
    buildTimeTicks: h(8), workers: { min: 1, max: 1 },
    energyCostPerTick: 0.03,
    production: [{ resource: 'water', perTick: 5 / 30 }],
    consumption: [],
    description: 'Captures atmospheric moisture. Produces 5L/h.',
  },
  solar_array: {
    id: 'solar_array', name: 'Solar Panel Array', tier: 1,
    cost: [{ resource: 'silicon', amount: 40 }, { resource: 'glass', amount: 20 }, { resource: 'wiring', amount: 10 }],
    buildTimeTicks: h(4), workers: { min: 1, max: 2 },
    energyCostPerTick: 0,
    production: [{ resource: 'energy', perTick: 50 / 30 }], // 50 kWh/day (day only)
    consumption: [],
    description: 'Generates 50 kWh during daytime.',
  },
  mine_basic: {
    id: 'mine_basic', name: 'Basic Mine', tier: 1,
    cost: [{ resource: 'iron_ore', amount: 80 }, { resource: 'concrete', amount: 20 }],
    buildTimeTicks: h(12), workers: { min: 1, max: 4 },
    energyCostPerTick: 0.05,
    production: [{ resource: 'iron_ore', perTick: 8 / 30 }], // ~8 kg/h per worker
    consumption: [],
    description: 'Digs into the ground to extract raw materials. Select what to mine in the Buildings panel.',
  },
  hydroponics: {
    id: 'hydroponics', name: 'Hydroponics Bay', tier: 1,
    cost: [{ resource: 'glass', amount: 30 }, { resource: 'plastic', amount: 20 }, { resource: 'wiring', amount: 10 }],
    buildTimeTicks: h(8), workers: { min: 1, max: 3 },
    energyCostPerTick: 0.04,
    production: [{ resource: 'food', perTick: 10 / 720 }], // 10 rations/day
    consumption: [{ resource: 'water', perTick: 5 / 30 }],
    description: 'Grows food. Produces 10 rations/day.',
  },
  insect_farm: {
    id: 'insect_farm', name: 'Insect Farm', tier: 1,
    cost: [{ resource: 'glass', amount: 20 }, { resource: 'plastic', amount: 10 }, { resource: 'biomass', amount: 5 }],
    buildTimeTicks: h(4), workers: { min: 1, max: 2 },
    energyCostPerTick: 0.01,
    production: [{ resource: 'food', perTick: 5 / 720 }],
    consumption: [],
    description: 'Protein source. Produces 5 rations/day.',
  },
  algae_tank: {
    id: 'algae_tank', name: 'Algae Tank', tier: 1,
    cost: [{ resource: 'glass', amount: 15 }, { resource: 'plastic', amount: 10 }],
    buildTimeTicks: h(3), workers: { min: 1, max: 2 },
    energyCostPerTick: 0.02,
    production: [{ resource: 'oxygen', perTick: 3 / 30 }, { resource: 'food', perTick: 2 / 720 }],
    consumption: [{ resource: 'water', perTick: 2 / 30 }],
    description: 'Produces O₂ and small food amount.',
  },
  storage_depot: {
    id: 'storage_depot', name: 'Storage Depot', tier: 1,
    cost: [{ resource: 'iron_ore', amount: 100 }, { resource: 'concrete', amount: 50 }],
    buildTimeTicks: h(10), workers: { min: 1, max: 3 },
    energyCostPerTick: 0,
    production: [], consumption: [],
    storageBonus: 2000,
    description: '+2000 units storage capacity.',
  },
  fence: {
    id: 'fence', name: 'Perimeter Fence', tier: 1,
    cost: [{ resource: 'iron_ore', amount: 60 }, { resource: 'steel', amount: 20 }],
    buildTimeTicks: h(6), workers: { min: 2, max: 3 },
    energyCostPerTick: 0,
    production: [], consumption: [],
    description: 'Basic colony protection.',
  },
  comms_relay: {
    id: 'comms_relay', name: 'Comms Relay', tier: 1,
    cost: [{ resource: 'electronics', amount: 20 }, { resource: 'wiring', amount: 15 }, { resource: 'copper', amount: 5 }],
    buildTimeTicks: h(4), workers: { min: 1, max: 1 },
    energyCostPerTick: 0.02,
    production: [], consumption: [],
    description: 'Extends scouting communication range.',
  },

  // ── Tier 2 ──────────────────────────────────────────────────────────────
  research_lab: {
    id: 'research_lab', name: 'Research Lab', tier: 2,
    cost: [{ resource: 'steel', amount: 50 }, { resource: 'electronics', amount: 30 }, { resource: 'glass', amount: 20 }],
    buildTimeTicks: h(16), workers: { min: 1, max: 4 },
    energyCostPerTick: 0.06, production: [], consumption: [],
    prereqTech: 'basic_infrastructure',
    description: 'Generates Research Points when staffed.',
  },
  infirmary: {
    id: 'infirmary', name: 'Infirmary', tier: 2,
    cost: [{ resource: 'steel', amount: 40 }, { resource: 'plastic', amount: 20 }, { resource: 'electronics', amount: 15 }, { resource: 'medicine', amount: 10 }],
    buildTimeTicks: h(12), workers: { min: 1, max: 3 },
    energyCostPerTick: 0.04, production: [], consumption: [],
    prereqTech: 'basic_infrastructure',
    description: 'Treats sick and injured crew members.',
  },
  geothermal: {
    id: 'geothermal', name: 'Geothermal Plant', tier: 2,
    cost: [{ resource: 'steel', amount: 100 }, { resource: 'titanium', amount: 50 }, { resource: 'electronics', amount: 30 }],
    buildTimeTicks: h(24), workers: { min: 2, max: 4 },
    energyCostPerTick: 0,
    production: [{ resource: 'energy', perTick: 200 / 30 }],
    consumption: [],
    prereqTech: 'energy_systems',
    description: 'Continuous energy. Produces 200 kWh/h day and night.',
  },
  mine_advanced: {
    id: 'mine_advanced', name: 'Advanced Mine', tier: 2,
    cost: [{ resource: 'steel', amount: 120 }, { resource: 'electronics', amount: 40 }, { resource: 'alloy_plates', amount: 20 }],
    buildTimeTicks: h(20), workers: { min: 2, max: 6 },
    energyCostPerTick: 0.08,
    production: [{ resource: 'iron_ore', perTick: 15 / 30 }],
    consumption: [],
    prereqTech: 'mining_technology',
    description: 'Higher yield deeper ores.',
  },
  mushroom_farm: {
    id: 'mushroom_farm', name: 'Mushroom Farm', tier: 2,
    cost: [{ resource: 'concrete', amount: 20 }, { resource: 'biomass', amount: 10 }, { resource: 'fertilizer', amount: 15 }],
    buildTimeTicks: h(6), workers: { min: 1, max: 2 },
    energyCostPerTick: 0.02,
    production: [{ resource: 'food', perTick: 8 / 720 }],
    consumption: [],
    prereqTech: 'agriculture',
    description: 'Grows mushrooms. Produces 8 rations/day.',
  },
  seaweed_farm: {
    id: 'seaweed_farm', name: 'Seaweed Cultivator', tier: 2,
    cost: [{ resource: 'glass', amount: 25 }, { resource: 'plastic', amount: 15 }],
    buildTimeTicks: h(8), workers: { min: 1, max: 2 },
    energyCostPerTick: 0.02,
    production: [{ resource: 'food', perTick: 6 / 720 }, { resource: 'oxygen', perTick: 2 / 30 }],
    consumption: [{ resource: 'water', perTick: 3 / 30 }],
    prereqTech: 'agriculture',
    description: 'Seaweed cultivation for food and O₂.',
  },
  recycling_center: {
    id: 'recycling_center', name: 'Recycling Center', tier: 2,
    cost: [{ resource: 'steel', amount: 60 }, { resource: 'electronics', amount: 25 }],
    buildTimeTicks: h(14), workers: { min: 1, max: 3 },
    energyCostPerTick: 0.04, production: [], consumption: [],
    prereqTech: 'sustainability',
    description: 'Recovers materials from waste.',
  },
  water_purifier: {
    id: 'water_purifier', name: 'Water Purification Plant', tier: 2,
    cost: [{ resource: 'steel', amount: 50 }, { resource: 'electronics', amount: 20 }, { resource: 'plastic', amount: 15 }],
    buildTimeTicks: h(12), workers: { min: 1, max: 2 },
    energyCostPerTick: 0.03,
    production: [{ resource: 'water', perTick: 30 / 30 }],
    consumption: [{ resource: 'energy', perTick: 0.1 / 30 }],
    prereqTech: 'water_systems',
    description: 'Purifies water at higher yield.',
  },
  dormitory: {
    id: 'dormitory', name: 'Dormitory Block', tier: 2,
    cost: [{ resource: 'concrete', amount: 80 }, { resource: 'steel', amount: 40 }, { resource: 'insulation', amount: 20 }],
    buildTimeTicks: h(18), workers: { min: 2, max: 4 },
    energyCostPerTick: 0.03,
    production: [], consumption: [],
    crewCapacity: 100,
    prereqTech: 'basic_infrastructure',
    description: 'Comfortable dormitory for 100 crew.',
  },
  rec_room: {
    id: 'rec_room', name: 'Recreation Room', tier: 2,
    cost: [{ resource: 'steel', amount: 30 }, { resource: 'plastic', amount: 15 }, { resource: 'electronics', amount: 10 }],
    buildTimeTicks: h(8), workers: { min: 1, max: 2 },
    energyCostPerTick: 0.03,
    production: [], consumption: [],
    prereqTech: 'basic_infrastructure',
    description: 'Boosts crew morale.',
  },
  smelter: {
    id: 'smelter', name: 'Smelter / Foundry', tier: 1,
    cost: [{ resource: 'iron_ore', amount: 60 }, { resource: 'clay', amount: 25 }, { resource: 'coal', amount: 15 }],
    buildTimeTicks: h(16), workers: { min: 2, max: 4 },
    energyCostPerTick: 0.08,
    production: [{ resource: 'steel', perTick: 10 / 30 }],
    consumption: [{ resource: 'iron_ore', perTick: 15 / 30 }, { resource: 'coal', perTick: 5 / 30 }],
    description: 'Smelts iron ore into steel and sand into glass. Required for most Tier 1+ buildings.',
  },
  chem_lab: {
    id: 'chem_lab', name: 'Chemical Lab', tier: 2,
    cost: [{ resource: 'steel', amount: 40 }, { resource: 'glass', amount: 30 }, { resource: 'electronics', amount: 20 }],
    buildTimeTicks: h(14), workers: { min: 1, max: 3 },
    energyCostPerTick: 0.05, production: [], consumption: [],
    prereqTech: 'chemistry',
    description: 'Produces medicine, fertilizer, fuel.',
  },
  workshop_adv: {
    id: 'workshop_adv', name: 'Advanced Workshop', tier: 2,
    cost: [{ resource: 'steel', amount: 60 }, { resource: 'electronics', amount: 25 }, { resource: 'alloy_plates', amount: 15 }],
    buildTimeTicks: h(16), workers: { min: 2, max: 4 },
    energyCostPerTick: 0.06, production: [], consumption: [],
    prereqTech: 'manufacturing',
    description: 'Manufactures advanced components.',
  },

  // ── Tier 3 ──────────────────────────────────────────────────────────────
  nuclear_reactor: {
    id: 'nuclear_reactor', name: 'Nuclear Reactor', tier: 3,
    cost: [{ resource: 'titanium', amount: 200 }, { resource: 'electronics', amount: 100 }, { resource: 'uranium', amount: 50 }, { resource: 'alloy_plates', amount: 30 }],
    buildTimeTicks: h(48), workers: { min: 3, max: 6 },
    energyCostPerTick: 0,
    production: [{ resource: 'energy', perTick: 1000 / 30 }],
    consumption: [{ resource: 'uranium', perTick: 1 / 720 }],
    prereqTech: 'nuclear_energy',
    description: 'Produces 1000 kWh/h continuously.',
  },
  hospital: {
    id: 'hospital', name: 'Advanced Hospital', tier: 3,
    cost: [{ resource: 'steel', amount: 100 }, { resource: 'electronics', amount: 60 }, { resource: 'medicine', amount: 30 }, { resource: 'plastic', amount: 20 }],
    buildTimeTicks: h(30), workers: { min: 2, max: 4 },
    energyCostPerTick: 0.06, production: [], consumption: [],
    prereqTech: 'advanced_medicine',
    description: 'Advanced medical facility. Enables births.',
  },
  drone_bay: {
    id: 'drone_bay', name: 'Drone Bay', tier: 3,
    cost: [{ resource: 'aluminium', amount: 80 }, { resource: 'electronics', amount: 50 }, { resource: 'battery_cells', amount: 20 }],
    buildTimeTicks: h(24), workers: { min: 1, max: 3 },
    energyCostPerTick: 0.05, production: [], consumption: [],
    prereqTech: 'robotics',
    description: 'Deploy scout drones for terrain mapping.',
  },
  vehicle_hangar: {
    id: 'vehicle_hangar', name: 'Vehicle Hangar', tier: 3,
    cost: [{ resource: 'steel', amount: 150 }, { resource: 'aluminium', amount: 60 }, { resource: 'electronics', amount: 40 }],
    buildTimeTicks: h(36), workers: { min: 2, max: 5 },
    energyCostPerTick: 0.05, production: [], consumption: [],
    prereqTech: 'vehicles',
    description: 'Houses ground vehicles for exploration.',
  },
  bio_dome: {
    id: 'bio_dome', name: 'Bio-Dome', tier: 3,
    cost: [{ resource: 'glass', amount: 120 }, { resource: 'steel', amount: 80 }, { resource: 'plastic', amount: 40 }, { resource: 'fertilizer', amount: 30 }],
    buildTimeTicks: h(36), workers: { min: 3, max: 5 },
    energyCostPerTick: 0.08,
    production: [{ resource: 'food', perTick: 25 / 720 }, { resource: 'oxygen', perTick: 5 / 30 }],
    consumption: [{ resource: 'water', perTick: 8 / 30 }],
    prereqTech: 'advanced_agriculture',
    description: 'Large-scale food and oxygen production.',
  },
  observatory: {
    id: 'observatory', name: 'Observatory', tier: 3,
    cost: [{ resource: 'steel', amount: 70 }, { resource: 'glass', amount: 50 }, { resource: 'electronics', amount: 40 }, { resource: 'optical_fiber', amount: 20 }],
    buildTimeTicks: h(24), workers: { min: 1, max: 3 },
    energyCostPerTick: 0.04, production: [], consumption: [],
    prereqTech: 'astronomy',
    description: 'Scans the sky for signals and threats.',
  },
  defense_turret: {
    id: 'defense_turret', name: 'Defense Turret', tier: 3,
    cost: [{ resource: 'steel', amount: 60 }, { resource: 'electronics', amount: 30 }, { resource: 'wiring', amount: 15 }],
    buildTimeTicks: h(12), workers: { min: 1, max: 2 },
    energyCostPerTick: 0.03, production: [], consumption: [],
    prereqTech: 'defense_systems',
    description: 'Automated colony defense.',
  },
  fab_plant: {
    id: 'fab_plant', name: 'Fabrication Plant', tier: 3,
    cost: [{ resource: 'steel', amount: 150 }, { resource: 'electronics', amount: 80 }, { resource: 'alloy_plates', amount: 40 }],
    buildTimeTicks: h(40), workers: { min: 3, max: 6 },
    energyCostPerTick: 0.1, production: [], consumption: [],
    prereqTech: 'advanced_manufacturing',
    description: 'Produces advanced components for endgame.',
  },
  bunker: {
    id: 'bunker', name: 'Underground Bunker', tier: 3,
    cost: [{ resource: 'concrete', amount: 200 }, { resource: 'steel', amount: 100 }, { resource: 'insulation', amount: 50 }],
    buildTimeTicks: h(48), workers: { min: 3, max: 6 },
    energyCostPerTick: 0.02, production: [], consumption: [],
    prereqTech: 'deep_construction',
    description: 'Protects crew from extreme events.',
  },
  spaceport: {
    id: 'spaceport', name: 'Spaceport (Basic)', tier: 3,
    cost: [{ resource: 'steel', amount: 300 }, { resource: 'concrete', amount: 150 }, { resource: 'titanium', amount: 100 }, { resource: 'electronics', amount: 50 }],
    buildTimeTicks: h(72), workers: { min: 4, max: 8 },
    energyCostPerTick: 0.1, production: [], consumption: [],
    prereqTech: 'aerospace',
    description: 'Landing pad for the rescue ship.',
  },

  // ── Tier 4 ──────────────────────────────────────────────────────────────
  radio_repaired: {
    id: 'radio_repaired', name: 'Radio Transmitter (Repaired)', tier: 4,
    cost: [{ resource: 'electronics', amount: 100 }, { resource: 'rare_earth', amount: 50 }, { resource: 'optical_fiber', amount: 30 }, { resource: 'alien_crystal', amount: 20 }, { resource: 'gold', amount: 10 }],
    buildTimeTicks: h(36), workers: { min: 2, max: 4 },
    energyCostPerTick: 0.2, production: [], consumption: [],
    prereqTech: 'advanced_communications',
    description: 'Send the rescue distress signal.',
  },
  rescue_beacon: {
    id: 'rescue_beacon', name: 'Rescue Beacon', tier: 4,
    cost: [{ resource: 'electronics', amount: 200 }, { resource: 'rare_earth', amount: 100 }, { resource: 'rocket_fuel', amount: 50 }, { resource: 'helium3', amount: 30 }],
    buildTimeTicks: h(48), workers: { min: 3, max: 6 },
    energyCostPerTick: 0.5, production: [], consumption: [],
    prereqTech: 'beacon_technology',
    description: 'Broadcasts a continuous rescue signal.',
  },
  fusion_reactor: {
    id: 'fusion_reactor', name: 'Fusion Reactor', tier: 4,
    cost: [{ resource: 'titanium', amount: 300 }, { resource: 'helium3', amount: 100 }, { resource: 'electronics', amount: 80 }, { resource: 'alloy_plates', amount: 50 }],
    buildTimeTicks: h(72), workers: { min: 4, max: 8 },
    energyCostPerTick: 0,
    production: [{ resource: 'energy', perTick: 5000 / 30 }],
    consumption: [{ resource: 'helium3', perTick: 1 / 2160 }],
    prereqTech: 'fusion_energy',
    description: 'Nearly unlimited clean energy.',
  },
  terraform_hub: {
    id: 'terraform_hub', name: 'Terraforming Hub', tier: 4,
    cost: [{ resource: 'steel', amount: 100 }, { resource: 'titanium', amount: 100 }, { resource: 'electronics', amount: 100 }, { resource: 'alloy_plates', amount: 100 }, { resource: 'rare_earth', amount: 100 }],
    buildTimeTicks: h(96), workers: { min: 5, max: 10 },
    energyCostPerTick: 1, production: [], consumption: [],
    prereqTech: 'planetary_science',
    description: 'Begin terraforming the planet.',
  },
  monument: {
    id: 'monument', name: 'Victory Monument', tier: 4,
    cost: [
      { resource: 'iron_ore', amount: 50 }, { resource: 'copper', amount: 50 }, { resource: 'aluminium', amount: 50 },
      { resource: 'titanium', amount: 50 }, { resource: 'gold', amount: 50 },
    ],
    buildTimeTicks: h(24), workers: { min: 0, max: 50 },
    energyCostPerTick: 0, production: [], consumption: [],
    description: 'Celebrate the colony\'s survival.',
  },
};
