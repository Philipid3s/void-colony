import { v4 as uuidv4 } from 'uuid';
import { GameState, CrewMember, Difficulty, Specialization, ResearchEntry, QuestEntry } from '../models/GameState';
import { STARTING_RESOURCES, STARTING_CREW_COUNT, BASE_STORAGE_CAPACITY } from '../config/balance';
import { TECHS, TechId } from '../config/techs';
import { BuildingInstance } from '../models/GameState';

const FIRST_NAMES = ['Alex','Jordan','Sam','Taylor','Morgan','Casey','Riley','Drew','Quinn','Avery',
  'Blake','Cameron','Dana','Emery','Finley','Harley','Hayden','Jamie','Jesse','Kai',
  'Lee','Logan','Mackenzie','Marley','Micah','Parker','Peyton','Reece','Remy','Rowan',
  'Sage','Sawyer','Shea','Skyler','Sloane','Spencer','Stevie','Sydney','Tatum','Terry'];

const LAST_NAMES = ['Chen','Patel','Okonkwo','Martinez','Kim','Singh','Nakamura','Dubois','Ivanova',
  'Nkosi','Al-Rashid','Kowalski','Santos','Weber','Lindqvist','Yilmaz','Osei','Petrov',
  'Gómez','Nakamura','Fischer','Nguyen','Kovacs','Rashid','Delacroix','Endo','Ferreira',
  'Hassan','Ibarra','Jansen','Klein','Lopes','Molina','Nair','Ortega','Papadopoulos','Quiroga','Russo'];

// Exactly 12 entries — one per crew member
const SPECIALIZATIONS: Specialization[] = [
  'engineer',
  'miner',
  'miner',
  'scientist',
  'farmer',
  'farmer',
  'doctor',
  'pilot',
  'security',
  'cook',
  'technician',
  'leader',
];

function randomName(): string {
  const fn = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const ln = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return `${fn} ${ln}`;
}

function generateCrew(count: number): CrewMember[] {
  const crew: CrewMember[] = [];
  for (let i = 0; i < count; i++) {
    const spec = SPECIALIZATIONS[i % SPECIALIZATIONS.length];
    crew.push({
      id: uuidv4(),
      name: randomName(),
      specialization: spec,
      secondarySkill1: null,
      secondarySkill2: null,
      health: 80 + Math.floor(Math.random() * 20),
      morale: 60 + Math.floor(Math.random() * 20),
      energy: 80 + Math.floor(Math.random() * 20),
      hunger: 70 + Math.floor(Math.random() * 20),
      thirst: 70 + Math.floor(Math.random() * 20),
      status: 'healthy',
      assignedTask: null,
      assignedBuildingId: null,
      isAlive: true,
    });
  }
  return crew;
}

function generateStartingBuildings(): BuildingInstance[] {
  const types = ['ship','quarters_basic','cooking_station','warehouse_small','repair_station','radio_broken'] as const;
  return types.map(type => ({
    id: uuidv4(),
    type,
    status: 'operational' as const,
    constructionProgress: 100,
    condition: type === 'radio_broken' ? 0 : 100,
    powered: true,
    level: 1,
  }));
}

function generateResearch(): ResearchEntry[] {
  const available: TechId[] = ['basic_infrastructure','mining_technology','agriculture','chemistry','electronics','vehicles','astronomy'];
  return (Object.keys(TECHS) as TechId[]).map(techId => ({
    techId,
    status: available.includes(techId) ? 'available' : 'locked',
    progress: 0,
  }));
}

function generateQuests(): QuestEntry[] {
  return [
    {
      questId: 'q_salvage_dawn',
      title: 'Salvage Dawn',
      description: 'The ship is wrecked, but its materials could save your colony. Strip it before the elements do.',
      status: 'active',
      chapter: 1,
      objectives: [
        { id: uuidv4(), description: 'Scavenge the crashed ship (first run)', completed: false },
        { id: uuidv4(), description: 'Completely strip the ship (all 4 salvage runs)', completed: false },
      ],
    },
    {
      questId: 'q_first_light',
      title: 'First Light',
      description: 'Assign crew to essential survival tasks.',
      status: 'locked',
      chapter: 1,
      objectives: [
        { id: uuidv4(), description: 'Assign crew to food production', completed: false },
        { id: uuidv4(), description: 'Assign crew to water collection', completed: false },
      ],
    },
    {
      questId: 'q_know_surroundings',
      title: 'Know Your Surroundings',
      description: 'Send a scouting party to explore the immediate area.',
      status: 'locked',
      chapter: 1,
      objectives: [
        { id: uuidv4(), description: 'Send a scouting party', completed: false },
      ],
    },
    {
      questId: 'q_under_the_stars',
      title: 'Under the Stars',
      description: 'Build up 3 days of food and water reserves.',
      status: 'locked',
      chapter: 1,
      objectives: [
        { id: uuidv4(), description: 'Stockpile 100 food rations', completed: false },
        { id: uuidv4(), description: 'Stockpile 100L water', completed: false },
      ],
    },
    {
      questId: 'q_breaking_ground',
      title: 'Breaking Ground',
      description: 'Build your first mine and produce 100kg of iron ore.',
      status: 'locked',
      chapter: 2,
      objectives: [
        { id: uuidv4(), description: 'Build a Basic Mine', completed: false },
        { id: uuidv4(), description: 'Accumulate 100kg iron ore', completed: false },
      ],
    },
    {
      questId: 'q_power_up',
      title: 'Power Up',
      description: 'Build an energy generation system.',
      status: 'locked',
      chapter: 2,
      objectives: [
        { id: uuidv4(), description: 'Build a Solar Array or Geothermal Plant', completed: false },
      ],
    },
    {
      questId: 'q_broken_voice',
      title: 'The Broken Voice',
      description: 'Examine the damaged radio transmitter and assess what is needed.',
      status: 'locked',
      chapter: 2,
      objectives: [
        { id: uuidv4(), description: 'Assign a Technician to inspect the radio', completed: false },
        { id: uuidv4(), description: 'Generate a damage report', completed: false },
      ],
    },
  ];
}

function generateMap(size = 20): GameState['map'] {
  const terrainTypes: GameState['map'][0][0]['terrain'][] = ['plains','plains','plains','mountain','crater','desert'];
  const map: GameState['map'] = [];
  for (let y = 0; y < size; y++) {
    const row = [];
    for (let x = 0; x < size; x++) {
      const isCenter = x === 10 && y === 10;
      row.push({
        x, y,
        terrain: isCenter ? 'plains' : terrainTypes[Math.floor(Math.random() * terrainTypes.length)],
        explored: isCenter || (Math.abs(x-10) <= 2 && Math.abs(y-10) <= 2),
        resourceDeposit: null,
        structure: isCenter ? 'colony' : null,
      });
    }
    map.push(row);
  }
  return map;
}

export function createInitialState(difficulty: Difficulty = 'normal'): GameState {
  const crewCount = STARTING_CREW_COUNT + Math.floor(Math.random() * 5) - 2;
  const resources: Record<string, number> = {};
  for (const [k, v] of Object.entries(STARTING_RESOURCES)) {
    resources[k] = v;
  }

  return {
    id: 1,
    tick: 0,
    difficulty,
    status: 'playing',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    resources,
    resourceProduction: {},
    resourceConsumption: {},
    crew: generateCrew(crewCount),
    buildings: generateStartingBuildings(),
    research: generateResearch(),
    quests: generateQuests(),
    eventLog: [{
      id: uuidv4(),
      tick: 0,
      message: 'The ship has crash-landed. Survival begins now.',
      type: 'event',
      resolved: true,
    }],
    activeEvents: [],
    craftingJobs: [],
    map: generateMap(),
    rationLevel: 100,
    storageCapacity: BASE_STORAGE_CAPACITY + 500, // +warehouse_small
    globalMorale: 70,
    isDay: true,
    researchPoints: 0,
    activeResearchId: null,
    shipScavengeCount: 0,
  };
}
