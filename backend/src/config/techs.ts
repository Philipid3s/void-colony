export type TechId =
  | 'basic_infrastructure' | 'water_systems' | 'advanced_water_recycling'
  | 'energy_systems' | 'nuclear_energy' | 'fusion_energy' | 'advanced_energy_storage'
  | 'deep_construction' | 'planetary_science'
  | 'mining_technology' | 'metallurgy' | 'advanced_alloys' | 'deep_drilling' | 'alien_studies'
  | 'agriculture' | 'advanced_agriculture' | 'genetic_modification' | 'sustainability' | 'closed_loop_ecology'
  | 'chemistry' | 'medicine' | 'advanced_medicine' | 'manufacturing' | 'advanced_manufacturing' | 'explosives'
  | 'electronics' | 'communications' | 'advanced_communications' | 'robotics' | 'ai_systems' | 'defense_systems'
  | 'vehicles' | 'exploration' | 'advanced_scouting' | 'aerospace' | 'beacon_technology'
  | 'astronomy' | 'signal_analysis' | 'star_mapping';

export interface TechDef {
  id: TechId;
  name: string;
  cost: number; // Research Points
  prerequisites: TechId[];
  resourceCost?: { resource: string; amount: number }[];
  unlocks: string[]; // building IDs or descriptions
  description: string;
}

export const TECHS: Record<TechId, TechDef> = {
  basic_infrastructure: {
    id: 'basic_infrastructure', name: 'Basic Infrastructure', cost: 50,
    prerequisites: [], unlocks: ['research_lab', 'infirmary', 'dormitory', 'rec_room'],
    description: 'Foundation of colony development.',
  },
  water_systems: {
    id: 'water_systems', name: 'Water Systems', cost: 80,
    prerequisites: ['basic_infrastructure'], unlocks: ['water_purifier'],
    description: 'Advanced water extraction and purification.',
  },
  advanced_water_recycling: {
    id: 'advanced_water_recycling', name: 'Advanced Water Recycling', cost: 150,
    prerequisites: ['water_systems'], unlocks: [],
    description: 'Recycle 90% of used water. Reduces consumption.',
  },
  energy_systems: {
    id: 'energy_systems', name: 'Energy Systems', cost: 80,
    prerequisites: ['basic_infrastructure'], unlocks: ['geothermal'],
    description: 'Advanced power generation technology.',
  },
  nuclear_energy: {
    id: 'nuclear_energy', name: 'Nuclear Energy', cost: 200,
    prerequisites: ['energy_systems'], unlocks: ['nuclear_reactor'],
    description: 'Harness nuclear fission for power.',
  },
  fusion_energy: {
    id: 'fusion_energy', name: 'Fusion Energy', cost: 500,
    prerequisites: ['nuclear_energy'], unlocks: ['fusion_reactor'],
    description: 'Clean, near-unlimited fusion power.',
  },
  advanced_energy_storage: {
    id: 'advanced_energy_storage', name: 'Advanced Energy Storage', cost: 150,
    prerequisites: ['energy_systems'], unlocks: [],
    description: 'Double battery storage capacity.',
  },
  deep_construction: {
    id: 'deep_construction', name: 'Deep Construction', cost: 120,
    prerequisites: ['basic_infrastructure'], unlocks: ['bunker'],
    description: 'Build underground structures.',
  },
  planetary_science: {
    id: 'planetary_science', name: 'Planetary Science', cost: 300,
    prerequisites: ['deep_construction'], unlocks: ['terraform_hub'],
    description: 'Understand and modify the planet.',
  },
  mining_technology: {
    id: 'mining_technology', name: 'Mining Technology', cost: 60,
    prerequisites: [], unlocks: ['mine_advanced'],
    description: 'Improved mining equipment and techniques.',
  },
  metallurgy: {
    id: 'metallurgy', name: 'Metallurgy', cost: 100,
    prerequisites: ['mining_technology'], unlocks: ['smelter'],
    description: 'Smelt and alloy raw metals.',
  },
  advanced_alloys: {
    id: 'advanced_alloys', name: 'Advanced Alloys', cost: 200,
    prerequisites: ['metallurgy'], unlocks: [],
    description: 'Produce high-strength alloy plates.',
  },
  deep_drilling: {
    id: 'deep_drilling', name: 'Deep Drilling', cost: 150,
    prerequisites: ['mining_technology'], unlocks: [],
    description: 'Drill deep for rare resources.',
  },
  alien_studies: {
    id: 'alien_studies', name: 'Alien Studies', cost: 250,
    prerequisites: ['deep_drilling'], resourceCost: [{ resource: 'alien_crystal', amount: 1 }],
    unlocks: [],
    description: 'Study alien technology and artefacts.',
  },
  agriculture: {
    id: 'agriculture', name: 'Agriculture', cost: 50,
    prerequisites: [], unlocks: ['mushroom_farm', 'seaweed_farm'],
    description: 'Diverse food production techniques.',
  },
  advanced_agriculture: {
    id: 'advanced_agriculture', name: 'Advanced Agriculture', cost: 120,
    prerequisites: ['agriculture'], unlocks: ['bio_dome'],
    description: 'High-yield farming methods.',
  },
  genetic_modification: {
    id: 'genetic_modification', name: 'Genetic Modification', cost: 200,
    prerequisites: ['advanced_agriculture'], unlocks: [],
    description: 'Engineer crops for maximum yield.',
  },
  sustainability: {
    id: 'sustainability', name: 'Sustainability', cost: 80,
    prerequisites: ['agriculture'], unlocks: ['recycling_center'],
    description: 'Closed-loop resource management.',
  },
  closed_loop_ecology: {
    id: 'closed_loop_ecology', name: 'Closed-Loop Ecology', cost: 250,
    prerequisites: ['sustainability'], unlocks: [],
    description: 'Self-sustaining ecological systems.',
  },
  chemistry: {
    id: 'chemistry', name: 'Chemistry', cost: 70,
    prerequisites: [], unlocks: ['chem_lab'],
    description: 'Chemical processing and synthesis.',
  },
  medicine: {
    id: 'medicine', name: 'Medicine', cost: 100,
    prerequisites: ['chemistry'], unlocks: [],
    description: 'Develop medical compounds.',
  },
  advanced_medicine: {
    id: 'advanced_medicine', name: 'Advanced Medicine', cost: 200,
    prerequisites: ['medicine'], unlocks: ['hospital'],
    description: 'Surgery and complex treatments.',
  },
  manufacturing: {
    id: 'manufacturing', name: 'Manufacturing', cost: 100,
    prerequisites: ['chemistry'], unlocks: ['workshop_adv'],
    description: 'Factory-scale production methods.',
  },
  advanced_manufacturing: {
    id: 'advanced_manufacturing', name: 'Advanced Manufacturing', cost: 200,
    prerequisites: ['manufacturing'], unlocks: ['fab_plant'],
    description: 'Precision fabrication systems.',
  },
  explosives: {
    id: 'explosives', name: 'Explosives', cost: 80,
    prerequisites: ['chemistry'], unlocks: [],
    description: 'Mining and defensive explosives.',
  },
  electronics: {
    id: 'electronics', name: 'Electronics', cost: 60,
    prerequisites: [], unlocks: [],
    description: 'Electronic component manufacturing.',
  },
  communications: {
    id: 'communications', name: 'Communications', cost: 100,
    prerequisites: ['electronics'], unlocks: [],
    description: 'Long-range communication systems.',
  },
  advanced_communications: {
    id: 'advanced_communications', name: 'Advanced Communications', cost: 250,
    prerequisites: ['communications'], unlocks: ['radio_repaired'],
    description: 'Interstellar communication capability.',
  },
  robotics: {
    id: 'robotics', name: 'Robotics', cost: 150,
    prerequisites: ['electronics'], unlocks: ['drone_bay'],
    description: 'Automated robotic systems.',
  },
  ai_systems: {
    id: 'ai_systems', name: 'AI Systems', cost: 300,
    prerequisites: ['robotics'], unlocks: [],
    description: 'Artificial intelligence for automation.',
  },
  defense_systems: {
    id: 'defense_systems', name: 'Defense Systems', cost: 120,
    prerequisites: ['electronics'], unlocks: ['defense_turret'],
    description: 'Automated colony defense.',
  },
  vehicles: {
    id: 'vehicles', name: 'Vehicles', cost: 100,
    prerequisites: [], unlocks: ['vehicle_hangar'],
    description: 'Ground vehicle construction and operation.',
  },
  exploration: {
    id: 'exploration', name: 'Exploration', cost: 80,
    prerequisites: ['vehicles'], unlocks: [],
    description: 'Extended range exploration techniques.',
  },
  advanced_scouting: {
    id: 'advanced_scouting', name: 'Advanced Scouting', cost: 150,
    prerequisites: ['exploration'], unlocks: [],
    description: 'Long-range terrain mapping.',
  },
  aerospace: {
    id: 'aerospace', name: 'Aerospace', cost: 200,
    prerequisites: ['vehicles'], unlocks: ['spaceport'],
    description: 'Spacecraft and orbital technology.',
  },
  beacon_technology: {
    id: 'beacon_technology', name: 'Beacon Technology', cost: 350,
    prerequisites: ['aerospace'], unlocks: ['rescue_beacon'],
    description: 'Broadcast rescue signals across space.',
  },
  astronomy: {
    id: 'astronomy', name: 'Astronomy', cost: 80,
    prerequisites: [], unlocks: ['observatory'],
    description: 'Celestial observation and analysis.',
  },
  signal_analysis: {
    id: 'signal_analysis', name: 'Signal Analysis', cost: 150,
    prerequisites: ['astronomy'], unlocks: [],
    description: 'Decode and analyse alien signals.',
  },
  star_mapping: {
    id: 'star_mapping', name: 'Star Mapping', cost: 200,
    prerequisites: ['astronomy'], unlocks: [],
    description: 'Map the star system for navigation.',
  },
};
