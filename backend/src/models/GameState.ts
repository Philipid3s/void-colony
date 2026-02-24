import { ResourceId } from '../config/resources';
import { BuildingId } from '../config/buildings';
import { TechId } from '../config/techs';

export type Difficulty = 'easy' | 'normal' | 'hard' | 'nightmare';
export type GameStatus = 'playing' | 'won' | 'lost';
export type RationLevel = 50 | 75 | 100 | 125;

export type Specialization =
  | 'engineer' | 'miner' | 'scientist' | 'farmer' | 'doctor'
  | 'pilot' | 'security' | 'cook' | 'technician' | 'leader';

export type CrewStatus =
  | 'healthy' | 'tired' | 'exhausted' | 'hungry' | 'starving'
  | 'dehydrated' | 'sick' | 'injured' | 'depressed' | 'inspired'
  | 'radiation_sickness';

export type TaskId =
  | 'task_mine_basic' | 'task_mine_adv' | 'task_drill' | 'task_farm'
  | 'task_insects' | 'task_algae' | 'task_water' | 'task_smelt'
  | 'task_manufacture' | 'task_chem' | 'task_repair' | 'task_maintain'
  | 'task_clean' | 'task_recycle' | 'task_research' | 'task_medical'
  | 'task_analyze' | 'task_train' | 'task_scout' | 'task_excavate'
  | 'task_drone' | 'task_patrol' | 'task_cook' | 'task_guard'
  | 'task_lead' | 'task_build' | 'task_diplomacy' | 'task_entertain'
  | 'task_rest';

export interface CrewMember {
  id: string;
  name: string;
  specialization: Specialization;
  secondarySkill1: Specialization | null;
  secondarySkill2: Specialization | null;
  health: number;   // 0-100
  morale: number;   // 0-100
  energy: number;   // 0-100 (fatigue)
  hunger: number;   // 0-100 (satiation)
  thirst: number;   // 0-100 (hydration)
  status: CrewStatus;
  assignedTask: TaskId | null;
  assignedBuildingId: string | null;
  isAlive: boolean;
}

export interface BuildingInstance {
  id: string;         // uuid
  type: BuildingId;
  status: 'constructing' | 'operational' | 'damaged' | 'destroyed';
  constructionProgress: number; // 0-100
  condition: number;   // 0-100
  powered: boolean;
  level: number;
  miningResource?: ResourceId; // for mines
}

export interface ResearchEntry {
  techId: TechId;
  status: 'locked' | 'available' | 'researching' | 'completed';
  progress: number; // 0-100
}

export interface QuestObjective {
  id: string;
  description: string;
  completed: boolean;
  progress?: number;
  target?: number;
}

export interface QuestEntry {
  questId: string;
  title: string;
  description: string;
  status: 'locked' | 'available' | 'active' | 'completed' | 'failed';
  objectives: QuestObjective[];
  chapter: number;
}

export interface EventLogEntry {
  id: string;
  tick: number;
  message: string;
  type: 'info' | 'warning' | 'danger' | 'success' | 'event';
  resolved: boolean;
  eventId?: string;
}

export interface ActiveEvent {
  id: string;
  eventType: string;
  startTick: number;
  endTick: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  choices?: { id: string; label: string; effect: string }[];
  resolved: boolean;
}

export interface CraftingJob {
  id: string;
  recipeId: string;
  buildingId: string;
  startTick: number;
  endTick: number;
  completed: boolean;
}

export interface MapTile {
  x: number;
  y: number;
  terrain: 'plains' | 'mountain' | 'crater' | 'desert' | 'ruins' | 'cave' | 'ice' | 'forest';
  explored: boolean;
  resourceDeposit: ResourceId | null;
  structure: string | null;
}

export interface GameState {
  id: number;
  tick: number;
  difficulty: Difficulty;
  status: GameStatus;
  createdAt: number;
  updatedAt: number;

  // Resources: resourceId → quantity
  resources: Record<string, number>;
  resourceProduction: Record<string, number>;  // per tick
  resourceConsumption: Record<string, number>; // per tick

  crew: CrewMember[];
  buildings: BuildingInstance[];
  research: ResearchEntry[];
  quests: QuestEntry[];
  eventLog: EventLogEntry[];
  activeEvents: ActiveEvent[];
  craftingJobs: CraftingJob[];
  map: MapTile[][];

  rationLevel: RationLevel;
  storageCapacity: number;
  globalMorale: number;
  isDay: boolean; // day/night cycle
  researchPoints: number;
  activeResearchId: TechId | null;
  shipScavengeCount: number; // how many times the ship has been scavenged (max 4)
}
