# 🚀 VOID COLONY — Space Outpost Management Game
## Game Design Document (GDD) — Complete Specifications

**Version:** 1.0
**Date:** February 2026
**Type:** Real-time management / survival simulation
**Platform:** Web browser (text-based UI)

---

## 1. GAME OVERVIEW

### 1.1 Concept
A text-based real-time management game where the player controls a crew of ~50 people stranded on a remote planet after their spaceship crash-lands near a small outpost. The player must manage resources, assign tasks, build structures, maintain crew morale, and ultimately find a way to signal for rescue or establish a self-sustaining colony.

### 1.2 Time System
- **1 real minute = 1 game hour**
- **24 real minutes = 1 game day**
- **~168 real minutes (2h48) = 1 game week**
- The game runs continuously while the player is connected
- When disconnected, the game continues in "idle mode" with reduced event frequency
- Day/night cycle affects energy production (solar), crew fatigue, and some resource gathering

### 1.3 Win Conditions
- **Primary:** Repair the radio transmitter and successfully contact the rescue fleet
- **Secondary:** Build a fully self-sustaining colony (all critical needs met indefinitely)
- **Secret:** Discover the planet's hidden secret through exploration

### 1.4 Lose Conditions
- All crew members die
- Morale drops to 0 (mutiny — game over)
- Critical life support failure with no backup

---

## 2. RESOURCES

### 2.1 Life Support Resources (Critical)

| Resource | ID | Unit | Description | Source |
|---|---|---|---|---|
| Water | `water` | Liters (L) | Essential for drinking, farming, and industrial use | Wells, atmospheric condensers, ice mining |
| Oxygen | `oxygen` | Units (O₂) | Breathable air for habitats | Electrolysis, algae farms, chemical extraction |
| Food | `food` | Rations | Nutritional units for crew | Farms, insect breeding, rations |
| Energy | `energy` | kWh | Powers all systems and buildings | Solar, geothermal, nuclear, wind |

### 2.2 Raw Materials — Metals

| Resource | ID | Unit | Description | Primary Use |
|---|---|---|---|---|
| Iron Ore | `iron_ore` | kg | Most common construction metal | Structures, tools, basic components |
| Copper | `copper` | kg | Conductive metal | Wiring, electronics, circuits |
| Aluminium | `aluminium` | kg | Lightweight structural metal | Advanced structures, vehicles, heat shields |
| Nickel | `nickel` | kg | Corrosion-resistant alloy metal | Alloys, batteries, plating |
| Lithium | `lithium` | kg | Battery-essential light metal | Batteries, energy storage |
| Titanium | `titanium` | kg | Ultra-strong structural metal | Advanced construction, ship repairs |
| Uranium | `uranium` | kg | Radioactive fuel | Nuclear reactor fuel |
| Silicon | `silicon` | kg | Semiconductor base | Electronics, solar panels, chips |
| Gold | `gold` | g | Rare conductive metal | Advanced electronics, circuit boards |
| Platinum | `platinum` | g | Ultra-rare catalyst metal | Advanced tech, catalysts |
| Rare Earth Elements | `rare_earth` | g | Mixed rare elements | High-tech components, magnets |

### 2.3 Raw Materials — Non-Metals

| Resource | ID | Unit | Description | Primary Use |
|---|---|---|---|---|
| Coal | `coal` | kg | Carbon-rich fossil material | Fuel (backup), carbon fiber production |
| Oil | `oil` | L | Hydrocarbon liquid | Fuel, plastics, lubricants |
| Natural Gas | `nat_gas` | m³ | Methane-rich gas | Fuel, heating, chemical feedstock |
| Sulfur | `sulfur` | kg | Chemical element | Fertilizers, chemicals, gunpowder |
| Salt | `salt` | kg | Mineral compound | Food preservation, chemical processes |
| Sand | `sand` | kg | Silicate granules | Glass production, construction |
| Clay | `clay` | kg | Fine-grained earth | Ceramics, bricks, insulation |
| Ice | `ice` | kg | Frozen water deposits | Water source, coolant |

### 2.4 Processed Materials

| Resource | ID | Unit | Ingredients | Description |
|---|---|---|---|---|
| Steel | `steel` | kg | Iron Ore + Coal + Energy | Strong alloy for construction |
| Concrete | `concrete` | kg | Sand + Clay + Water | Building material |
| Glass | `glass` | units | Sand + Energy | Windows, lab equipment, solar panels |
| Plastic | `plastic` | kg | Oil + Energy | Various components, insulation |
| Electronics | `electronics` | units | Copper + Silicon + Gold + Energy | Circuit boards, controllers |
| Battery Cells | `battery_cells` | units | Lithium + Nickel + Copper + Energy | Energy storage units |
| Fuel Cells | `fuel_cells` | units | Hydrogen (from water) + Platinum + Energy | Clean energy cells |
| Carbon Fiber | `carbon_fiber` | kg | Coal + Energy (high) | Ultra-light structural material |
| Alloy Plates | `alloy_plates` | units | Titanium + Nickel + Energy | Advanced structural plates |
| Fertilizer | `fertilizer` | kg | Sulfur + Nitrogen (from atmosphere) + Water | Crop growth booster |
| Medicine | `medicine` | units | Various plants + Water + Energy | Crew health treatment |
| Bioplastic | `bioplastic` | kg | Plant matter + Energy | Sustainable plastic alternative |
| Insulation | `insulation` | units | Clay + Plastic | Thermal protection |
| Wiring | `wiring` | m | Copper + Plastic | Electrical connections |
| Optical Fiber | `optical_fiber` | m | Glass + Rare Earth | High-speed data transmission |
| Rocket Fuel | `rocket_fuel` | L | Oil + Hydrogen + Energy (very high) | Vehicle and beacon fuel |

### 2.5 Special / Rare Resources

| Resource | ID | Unit | Description | Source |
|---|---|---|---|---|
| Alien Crystal | `alien_crystal` | units | Mysterious crystalline structure with energy properties | Deep mining, exploration |
| Ancient Artifact | `ancient_artifact` | units | Remnants of a previous civilization | Exploration, excavation |
| Biomass | `biomass` | kg | Organic waste matter | Farm waste, food waste — recycling |
| Hydrogen | `hydrogen` | L | Light gas, extracted from water | Electrolysis |
| Nitrogen | `nitrogen` | m³ | Atmospheric gas | Atmospheric extraction |
| Helium-3 | `helium3` | g | Fusion fuel isotope | Deep mining, extremely rare |

### 2.6 Resource Consumption Rules
- Each crew member consumes per game day:
  - 2L water
  - 1 food ration
  - Variable O₂ (depends on habitat quality)
- Energy is consumed continuously by active buildings
- Resources can be rationed (50%, 75%, 100%, 125%) — affecting morale and health

---

## 3. CREW SYSTEM

### 3.1 Crew Attributes

Each crew member has:

| Attribute | Range | Description |
|---|---|---|
| Name | string | Procedurally generated |
| Health | 0-100 | Physical condition (0 = dead) |
| Morale | 0-100 | Mental state and motivation |
| Energy | 0-100 | Fatigue level — depletes during work, recovers during rest |
| Hunger | 0-100 | Satiation level (0 = starving) |
| Thirst | 0-100 | Hydration level (0 = dehydrating) |

### 3.2 Crew Specializations

Each crew member has a primary specialization and can have up to 2 secondary skills. Specialization increases task efficiency by 50%. Secondary skills increase efficiency by 25%.

| Specialization | ID | Description | Bonus Tasks |
|---|---|---|---|
| Engineer | `engineer` | Construction, repairs, machinery | Building, repairing, manufacturing |
| Miner | `miner` | Resource extraction expert | Mining, drilling, excavation |
| Scientist | `scientist` | Research and analysis | Research, medical, analysis |
| Farmer | `farmer` | Agriculture and biology | Farming, food production, biology |
| Doctor | `doctor` | Medical care | Healing, surgery, disease treatment |
| Pilot | `pilot` | Vehicle operation | Scouting, transport, drone ops |
| Security | `security` | Defense and protection | Guard duty, patrol, defense |
| Cook | `cook` | Food preparation | Cooking, food processing, morale boost |
| Technician | `technician` | Electronics and systems | Electronics, communications, IT |
| Leader | `leader` | Management and coordination | Morale boost, task coordination |

### 3.3 Crew Status Effects

| Status | Trigger | Effect | Duration |
|---|---|---|---|
| Healthy | Default | Normal efficiency | — |
| Tired | Energy < 30 | -30% efficiency | Until rested |
| Exhausted | Energy < 10 | -60% efficiency, health drain | Until rested |
| Hungry | Hunger < 30 | -20% efficiency, morale drain | Until fed |
| Starving | Hunger < 10 | -50% efficiency, health drain | Until fed |
| Dehydrated | Thirst < 20 | -40% efficiency, rapid health drain | Until hydrated |
| Sick | Random event / contamination | -50% efficiency, contagion risk | Until treated |
| Injured | Accident / event | -70% efficiency, needs medical care | Until healed |
| Depressed | Morale < 20 | -40% efficiency, can spread | Therapy / events |
| Inspired | Morale > 90 | +25% efficiency | Temporary |
| Radiation Sickness | Uranium handling / event | Health drain, -60% efficiency | Long treatment |

### 3.4 Morale System

Global morale is the average of all crew members' individual morale. Morale is affected by:

**Positive influences:**
- Adequate food and water (+)
- Comfortable living quarters (+)
- Recreation facilities (+)
- Successful missions (+)
- Good leadership assignment (+)
- Celebrations / events (+)
- Progress toward rescue (+)

**Negative influences:**
- Food/water rationing (-)
- Crew death (--)
- Overcrowded living space (-)
- No progress toward goals (-)
- Accidents and injuries (-)
- Harsh working conditions (-)
- Illness outbreaks (--)

---

## 4. BUILDINGS & STRUCTURES

### 4.1 Starting Buildings (Available from Game Start)

| Building | ID | Capacity | Description |
|---|---|---|---|
| Crashed Ship | `ship` | — | Main hub. Contains basic systems, some salvageable parts |
| Living Quarters (Basic) | `quarters_basic` | 50 beds | Cramped sleeping area in the outpost |
| Cooking Station | `cooking_station` | — | Basic food preparation facility |
| Warehouse (Small) | `warehouse_small` | 500 units | Basic resource storage |
| Repair Station | `repair_station` | — | Basic tool workshop for repairs |
| Radio Transmitter (Broken) | `radio_broken` | — | Damaged beyond basic repair — requires extensive research and rare materials |

### 4.2 Tier 1 Buildings — Basic (Available Early)

| Building | ID | Cost | Build Time | Workers | Description |
|---|---|---|---|---|---|
| Water Well | `water_well` | 50 Iron, 20 Steel | 6h | 2 | Extracts underground water. Produces 20L/h |
| Atmospheric Condenser | `atmo_condenser` | 30 Aluminium, 10 Electronics | 8h | 1 | Captures moisture. Produces 5L/h |
| Solar Panel Array | `solar_array` | 40 Silicon, 20 Glass, 10 Wiring | 4h | 2 | Generates 50 kWh during daytime |
| Basic Mine | `mine_basic` | 80 Iron, 30 Steel, 20 Concrete | 12h | 4 | Extracts raw ores. 1 type at a time |
| Hydroponics Bay | `hydroponics` | 30 Glass, 20 Plastic, 10 Wiring, 50 Water | 8h | 3 | Grows food. Produces 10 rations/day |
| Insect Farm | `insect_farm` | 20 Glass, 10 Plastic, 5 Biomass | 4h | 1 | Protein source. Produces 5 rations/day |
| Algae Tank | `algae_tank` | 15 Glass, 10 Plastic, 20 Water | 3h | 1 | Produces O₂ and small food amount |
| Storage Depot | `storage_depot` | 100 Iron, 50 Concrete | 10h | 3 | +2000 units storage capacity |
| Perimeter Fence | `fence` | 60 Iron, 20 Steel | 6h | 3 | Basic colony protection |
| Comms Relay | `comms_relay` | 20 Electronics, 15 Wiring, 5 Copper | 4h | 1 | Extends scouting communication range |

### 4.3 Tier 2 Buildings — Advanced (Requires Research)

| Building | ID | Cost | Build Time | Workers | Prerequisite |
|---|---|---|---|---|---|
| Research Lab | `research_lab` | 50 Steel, 30 Electronics, 20 Glass | 16h | 2 | Tech: Basic Infrastructure |
| Infirmary | `infirmary` | 40 Steel, 20 Plastic, 15 Electronics, 10 Medicine | 12h | 1 | Tech: Basic Infrastructure |
| Geothermal Plant | `geothermal` | 100 Steel, 50 Titanium, 30 Electronics | 24h | 4 | Tech: Energy Systems |
| Advanced Mine | `mine_advanced` | 120 Steel, 40 Electronics, 20 Alloy Plates | 20h | 6 | Tech: Mining Technology |
| Mushroom Farm | `mushroom_farm` | 20 Concrete, 10 Biomass, 15 Fertilizer | 6h | 2 | Tech: Agriculture |
| Seaweed Cultivator | `seaweed_farm` | 25 Glass, 15 Plastic, 30 Water | 8h | 2 | Tech: Agriculture |
| Recycling Center | `recycling_center` | 60 Steel, 25 Electronics | 14h | 3 | Tech: Sustainability |
| Water Purification Plant | `water_purifier` | 50 Steel, 20 Electronics, 15 Plastic | 12h | 2 | Tech: Water Systems |
| Dormitory Block | `dormitory` | 80 Concrete, 40 Steel, 20 Insulation | 18h | 4 | Tech: Basic Infrastructure |
| Recreation Room | `rec_room` | 30 Steel, 15 Plastic, 10 Electronics | 8h | 2 | Tech: Basic Infrastructure |
| Smelter / Foundry | `smelter` | 80 Iron, 30 Clay, 20 Coal | 16h | 3 | Tech: Metallurgy |
| Chemical Lab | `chem_lab` | 40 Steel, 30 Glass, 20 Electronics | 14h | 2 | Tech: Chemistry |
| Workshop (Advanced) | `workshop_adv` | 60 Steel, 25 Electronics, 15 Alloy Plates | 16h | 3 | Tech: Manufacturing |

### 4.4 Tier 3 Buildings — High-Tech (Requires Advanced Research)

| Building | ID | Cost | Build Time | Workers | Prerequisite |
|---|---|---|---|---|---|
| Nuclear Reactor | `nuclear_reactor` | 200 Titanium, 100 Electronics, 50 Uranium, 30 Alloy Plates | 48h | 6 | Tech: Nuclear Energy |
| Advanced Hospital | `hospital` | 100 Steel, 60 Electronics, 30 Medicine, 20 Plastic | 30h | 3 | Tech: Advanced Medicine |
| Drone Bay | `drone_bay` | 80 Aluminium, 50 Electronics, 20 Battery Cells | 24h | 3 | Tech: Robotics |
| Vehicle Hangar | `vehicle_hangar` | 150 Steel, 60 Aluminium, 40 Electronics | 36h | 5 | Tech: Vehicles |
| Bio-Dome | `bio_dome` | 120 Glass, 80 Steel, 40 Plastic, 30 Fertilizer | 36h | 5 | Tech: Advanced Agriculture |
| Observatory | `observatory` | 70 Steel, 50 Glass, 40 Electronics, 20 Optical Fiber | 24h | 2 | Tech: Astronomy |
| Defense Turret | `defense_turret` | 60 Steel, 30 Electronics, 15 Wiring | 12h | 2 | Tech: Defense Systems |
| Fabrication Plant | `fab_plant` | 150 Steel, 80 Electronics, 40 Alloy Plates | 40h | 5 | Tech: Advanced Manufacturing |
| Underground Bunker | `bunker` | 200 Concrete, 100 Steel, 50 Insulation | 48h | 6 | Tech: Deep Construction |
| Spaceport (Basic) | `spaceport` | 300 Steel, 150 Concrete, 100 Titanium, 50 Electronics | 72h | 8 | Tech: Aerospace |

### 4.5 Tier 4 Buildings — Endgame

| Building | ID | Cost | Build Time | Workers | Prerequisite |
|---|---|---|---|---|---|
| Radio Transmitter (Repaired) | `radio_repaired` | 100 Electronics, 50 Rare Earth, 30 Optical Fiber, 20 Alien Crystal, 10 Gold | 36h | 4 | Quest: Radio Repair Chain + Tech: Advanced Communications |
| Rescue Beacon | `rescue_beacon` | 200 Electronics, 100 Rare Earth, 50 Rocket Fuel, 30 Helium-3 | 48h | 6 | Tech: Beacon Technology |
| Fusion Reactor | `fusion_reactor` | 300 Titanium, 100 Helium-3, 80 Electronics, 50 Alloy Plates | 72h | 8 | Tech: Fusion Energy |
| Terraforming Hub | `terraform_hub` | 500 various resources | 96h | 10 | Tech: Planetary Science |
| Monument | `monument` | 50 of each metal | 24h | ALL | Victory celebration building |

---

## 5. TECHNOLOGY TREE

### 5.1 Research Mechanics
- Research requires a Research Lab and assigned Scientists
- Each tech has a research cost measured in "Research Points" (RP)
- Scientists generate RP based on their skill level
- Base rate: 1 Scientist = 2 RP/h. With specialization bonus: 3 RP/h
- Some techs require specific resources to be consumed during research

### 5.2 Tech Tree Structure

```
START
  │
  ├─► Basic Infrastructure (50 RP)
  │     ├─► Water Systems (80 RP)
  │     │     └─► Advanced Water Recycling (150 RP)
  │     ├─► Energy Systems (80 RP)
  │     │     ├─► Nuclear Energy (200 RP)
  │     │     │     └─► Fusion Energy (500 RP)
  │     │     └─► Advanced Energy Storage (150 RP)
  │     └─► Deep Construction (120 RP)
  │           └─► Planetary Science (300 RP)
  │
  ├─► Mining Technology (60 RP)
  │     ├─► Metallurgy (100 RP)
  │     │     └─► Advanced Alloys (200 RP)
  │     └─► Deep Drilling (150 RP)
  │           └─► Alien Studies (250 RP + Alien Crystal)
  │
  ├─► Agriculture (50 RP)
  │     ├─► Advanced Agriculture (120 RP)
  │     │     └─► Genetic Modification (200 RP)
  │     └─► Sustainability (80 RP)
  │           └─► Closed-Loop Ecology (250 RP)
  │
  ├─► Chemistry (70 RP)
  │     ├─► Medicine (100 RP)
  │     │     └─► Advanced Medicine (200 RP)
  │     ├─► Manufacturing (100 RP)
  │     │     └─► Advanced Manufacturing (200 RP)
  │     └─► Explosives (80 RP)
  │
  ├─► Electronics (60 RP)
  │     ├─► Communications (100 RP)
  │     │     └─► Advanced Communications (250 RP)
  │     ├─► Robotics (150 RP)
  │     │     └─► AI Systems (300 RP)
  │     └─► Defense Systems (120 RP)
  │
  ├─► Vehicles (100 RP)
  │     ├─► Exploration (80 RP)
  │     │     └─► Advanced Scouting (150 RP)
  │     └─► Aerospace (200 RP)
  │           └─► Beacon Technology (350 RP)
  │
  └─► Astronomy (80 RP)
        ├─► Signal Analysis (150 RP)
        └─► Star Mapping (200 RP)
```

---

## 6. TASKS & ASSIGNMENTS

### 6.1 Task Categories

#### 🔨 Production Tasks

| Task | ID | Workers | Output | Requirements |
|---|---|---|---|---|
| Mining (Basic) | `task_mine_basic` | 1-6 | Raw ores per worker | Basic Mine |
| Mining (Advanced) | `task_mine_adv` | 1-8 | Higher yield, deeper ores | Advanced Mine |
| Drilling | `task_drill` | 2-4 | Water, oil, gas | Water Well / Drill |
| Farming | `task_farm` | 1-4 | Food rations | Any farm building |
| Insect Breeding | `task_insects` | 1-2 | Protein rations | Insect Farm |
| Algae Cultivation | `task_algae` | 1-2 | O₂ + food | Algae Tank |
| Water Collection | `task_water` | 1-3 | Water | Condenser / Well |
| Smelting | `task_smelt` | 2-4 | Processed metals | Smelter |
| Manufacturing | `task_manufacture` | 2-6 | Processed goods | Workshop / Fab Plant |
| Chemical Processing | `task_chem` | 1-3 | Medicine, fertilizer, fuel | Chemical Lab |

#### 🔧 Maintenance Tasks

| Task | ID | Workers | Effect | Requirements |
|---|---|---|---|---|
| Repair | `task_repair` | 1-4 | Fixes damaged equipment/buildings | Repair Station |
| Maintenance | `task_maintain` | 1-3 | Prevents breakdowns | Any building |
| Cleaning | `task_clean` | 1-4 | Hygiene, disease prevention | — |
| Recycling | `task_recycle` | 1-3 | Recovers materials from waste | Recycling Center |

#### 🧪 Knowledge Tasks

| Task | ID | Workers | Effect | Requirements |
|---|---|---|---|---|
| Research | `task_research` | 1-4 | Generates Research Points | Research Lab |
| Medical Care | `task_medical` | 1-3 | Heals sick/injured crew | Infirmary / Hospital |
| Analysis | `task_analyze` | 1-2 | Analyzes artifacts, samples | Research Lab |
| Training | `task_train` | 1 trainer + trainees | Improves crew skills | Rec Room / Lab |

#### 🗺️ Exploration Tasks

| Task | ID | Workers | Effect | Requirements |
|---|---|---|---|---|
| Scouting | `task_scout` | 2-4 | Discovers new areas, resources | — (Tier 1) / Vehicle (Tier 2+) |
| Excavation | `task_excavate` | 2-6 | Uncovers artifacts, deep resources | Exploration tech |
| Drone Survey | `task_drone` | 1 operator | Maps terrain, finds resources | Drone Bay |
| Patrol | `task_patrol` | 2-4 | Detects threats, secures perimeter | Fence / Defense |

#### 🏠 Colony Tasks

| Task | ID | Workers | Effect | Requirements |
|---|---|---|---|---|
| Cooking | `task_cook` | 1-3 | Converts raw food to meals (morale+) | Cooking Station |
| Guard Duty | `task_guard` | 1-4 | Security, prevents incidents | — |
| Leadership | `task_lead` | 1 | Boosts morale + efficiency in area | Leader specialization |
| Construction | `task_build` | varies | Builds new structures | Resources + workers |
| Diplomacy | `task_diplomacy` | 1-2 | Interact with discovered entities | Event-triggered |
| Entertainment | `task_entertain` | 1 | Organizes events for morale | Rec Room |

### 6.2 Task Efficiency
- Base efficiency: 1.0x
- Specialization match: 1.5x
- Secondary skill match: 1.25x
- Tired: 0.7x
- Exhausted: 0.4x
- Sick/Injured: 0.3x-0.5x
- Inspired: 1.25x
- Equipment bonus: up to 1.5x
- Multiple modifiers stack multiplicatively

---

## 7. EVENTS SYSTEM

### 7.1 Event Categories

Events are triggered randomly or by conditions. Each event has a probability weight that can be modified by game state.

#### 🌪️ Environmental Events

| Event | ID | Probability | Effect | Duration | Mitigation |
|---|---|---|---|---|---|
| Dust Storm | `evt_dust_storm` | Medium | Solar -80%, outdoor work stopped, visibility 0 | 6-24h | Bunker, sealed buildings |
| Meteor Shower | `evt_meteor` | Low | Building damage risk, rare metal deposits | 2-6h | Defense turret, bunker |
| Earthquake | `evt_quake` | Low | Building damage, mine collapse risk | Instant | Reinforced structures |
| Extreme Cold | `evt_cold` | Medium | Energy consumption +100%, crop damage | 12-48h | Insulation, heating |
| Extreme Heat | `evt_heat` | Medium | Water consumption +50%, crew fatigue | 12-48h | Cooling systems |
| Toxic Gas Vent | `evt_toxic_gas` | Low | Health damage to outdoor workers | 4-12h | Gas masks, sealed areas |
| Solar Flare | `evt_solar_flare` | Low | Electronics damage, comms disruption | 2-8h | Shielding, backups |
| Flooding | `evt_flood` | Rare | Mine flooding, storage damage | 6-12h | Drainage systems |
| Aurora Event | `evt_aurora` | Low | Morale boost, energy anomaly | 4-8h | — (positive) |

#### 🏥 Crew Events

| Event | ID | Trigger | Effect | Resolution |
|---|---|---|---|---|
| Disease Outbreak | `evt_disease` | Poor hygiene / random | Multiple crew sick, contagion | Quarantine + medical care |
| Food Poisoning | `evt_food_poison` | Low food quality | Several crew sick temporarily | Medical care, cooking upgrade |
| Workplace Accident | `evt_accident` | Mining / construction / random | 1-3 crew injured | Medical care |
| Crew Conflict | `evt_conflict` | Low morale | 2 crew members fight, morale drop | Leadership intervention |
| Mental Breakdown | `evt_breakdown` | Very low individual morale | 1 crew incapacitated | Rest + therapy |
| Romance | `evt_romance` | Random (morale > 50) | 2 crew members bond, morale boost | — (positive) |
| Birth | `evt_birth` | Romance + time | New crew member (long-term) | Hospital required |
| Death (Natural) | `evt_death_natural` | Very low health | Crew member dies | — (morale hit to all) |
| Skill Discovery | `evt_skill` | Training / random | Crew member gains new skill | — (positive) |
| Mutiny Threat | `evt_mutiny` | Global morale < 25 | Countdown to game over | Immediate morale intervention |

#### 🔍 Discovery Events

| Event | ID | Trigger | Effect | Follow-up |
|---|---|---|---|---|
| Resource Deposit | `evt_deposit` | Scouting / mining | New rich resource vein found | Establish new mine |
| Underground Cave | `evt_cave` | Deep drilling / excavation | Hidden cave system | Explore for resources/artifacts |
| Alien Ruins | `evt_ruins` | Scouting (far range) | Ancient structures discovered | Excavation quest chain |
| Strange Signal | `evt_signal` | Observatory / comms relay | Encrypted transmission detected | Signal analysis quest |
| Life Form Discovery | `evt_lifeform` | Scouting / farming | Native organism found | Study, potential food/danger |
| Crashed Probe | `evt_probe` | Scouting | Old survey probe found | Salvage electronics/data |
| Water Source | `evt_water_source` | Drilling / scouting | Underground lake or river | Major water supply |
| Geothermal Vent | `evt_geothermal_vent` | Drilling / exploration | Hot spot discovered | Build geothermal plant |
| Ancient Database | `evt_database` | Alien Ruins exploration | Data storage from prev. civilization | Research boost + lore |
| Mineral Anomaly | `evt_anomaly` | Deep mining | Unusual crystalline formation | Alien Crystal source |

#### ⚠️ Crisis Events

| Event | ID | Trigger | Effect | Resolution |
|---|---|---|---|---|
| Power Failure | `evt_power_fail` | Equipment age / damage | All powered buildings stop | Emergency repairs |
| Oxygen Leak | `evt_o2_leak` | Building damage / random | O₂ reserves drain rapidly | Seal and repair |
| Water Contamination | `evt_water_contam` | Random / industrial accident | Water supply poisoned | Purification + medical |
| Structural Collapse | `evt_collapse` | Earthquake / poor maintenance | Building destroyed | Rebuild |
| Fire | `evt_fire` | Random / industrial | Building damage, injury risk | Firefighting |
| Radiation Leak | `evt_radiation` | Nuclear reactor / mining uranium | Health damage to nearby crew | Containment + medical |
| Supply Theft | `evt_theft` | Very low morale | Resources go missing | Security investigation |
| Equipment Malfunction | `evt_malfunction` | Random / low maintenance | Building efficiency -50% | Repair |

---

## 8. QUEST SYSTEM

### 8.1 Main Quest Line — "The Way Home"

This is the primary storyline, composed of sequential quest chapters.

#### Chapter 1: Survival (Days 1-5)
```
QUEST: "First Light"
├── Objective: Assign crew to essential tasks (food, water, O₂)
├── Reward: Tutorial completion, 1 free building
└── Trigger: Game start

QUEST: "Know Your Surroundings"
├── Objective: Send a scouting party to explore immediate surroundings
├── Reward: Map of nearby area, resource deposit locations revealed
└── Trigger: After "First Light"

QUEST: "Under the Stars"
├── Objective: Produce enough food and water for 3 days of reserves
├── Reward: Morale boost, "Basic Infrastructure" tech unlocked for research
└── Trigger: Day 2
```

#### Chapter 2: Establishing the Colony (Days 5-15)
```
QUEST: "Breaking Ground"
├── Objective: Build your first mine and produce 100kg of iron ore
├── Reward: Mining Technology research unlocked
└── Trigger: After "Under the Stars"

QUEST: "Power Up"
├── Objective: Build an energy generation system (solar/geothermal)
├── Reward: Electronics research unlocked
└── Trigger: After first mine

QUEST: "The Broken Voice"
├── Objective: Examine the broken radio transmitter
├── Sub-objectives:
│   ├── Assign a Technician to inspect the radio
│   ├── Generate report of damaged components
│   └── Identify 5 required rare components
├── Reward: Radio Repair quest chain begins, Communications research unlocked
└── Trigger: Day 7 or research lab built
```

#### Chapter 3: Expansion (Days 15-30)
```
QUEST: "Research Initiative"
├── Objective: Build a Research Lab and complete 3 technology researches
├── Reward: Advanced building blueprints, 50 RP bonus
└── Trigger: After "Power Up"

QUEST: "No One Left Behind"
├── Objective: Build an infirmary and successfully treat 5 crew members
├── Reward: Medicine research unlocked, doctor efficiency +10%
└── Trigger: Research Lab built

QUEST: "Deep Below"
├── Objective: Discover an underground cave system through deep mining
├── Reward: Access to rare resources, exploration opportunities
└── Trigger: Advanced Mine built

QUEST: "Radio Component #1 — The Amplifier"
├── Objective: Manufacture a Signal Amplifier
│   ├── Requires: 20 Electronics, 10 Copper, 5 Rare Earth, 5 Gold
│   └── Must be built in Workshop (Advanced)
├── Reward: 1/5 radio components collected
└── Trigger: "The Broken Voice" complete + Workshop built
```

#### Chapter 4: Discovery (Days 30-50)
```
QUEST: "Echoes of the Past"
├── Objective: Discover and investigate alien ruins
├── Sub-objectives:
│   ├── Scout the far reaches of the map
│   ├── Discover the ruins
│   ├── Excavate the entrance
│   └── Retrieve first artifact
├── Reward: Alien Studies research, Ancient Artifact, lore entries
└── Trigger: Advanced scouting capability

QUEST: "Radio Component #2 — The Quantum Decoder"
├── Objective: Build a Quantum Signal Decoder
│   ├── Requires: 30 Electronics, 15 Optical Fiber, 10 Alien Crystal, 5 Rare Earth
│   └── Must be built in Fabrication Plant
├── Reward: 2/5 radio components collected
└── Trigger: Component #1 + Alien Studies research

QUEST: "Radio Component #3 — The Power Core"
├── Objective: Create a Stable Power Core
│   ├── Requires: 20 Battery Cells, 15 Fuel Cells, 10 Uranium, 10 Titanium
│   └── Must be built in Fabrication Plant
├── Reward: 3/5 radio components collected
└── Trigger: Nuclear Energy research

QUEST: "The Ancient Message"
├── Objective: Decode the ancient database found in the ruins
├── Sub-objectives:
│   ├── Assign 2 scientists to analysis for 48h
│   ├── Cross-reference with ship's database
│   └── Discover the planet's history
├── Reward: Major lore reveal, Planetary Science research unlocked, hints about Component #5
└── Trigger: "Echoes of the Past" + Ancient Database event
```

#### Chapter 5: The Signal (Days 50-70)
```
QUEST: "Radio Component #4 — The Antenna Array"
├── Objective: Construct a Long-Range Antenna Array
│   ├── Requires: 50 Aluminium, 30 Titanium, 20 Optical Fiber, 10 Carbon Fiber
│   └── Built as a separate structure requiring Construction + Technician team
├── Reward: 4/5 radio components collected
└── Trigger: Component #3 + Advanced Communications research

QUEST: "Radio Component #5 — The Crystal Resonator"
├── Objective: Create a Crystal Resonator from alien technology
│   ├── Requires: 25 Alien Crystal, 15 Rare Earth, 10 Gold, 5 Helium-3
│   ├── Must be built in Research Lab with Alien Studies completed
│   └── The ancient message hints at a hidden crystal cave
├── Reward: 5/5 radio components collected — can now repair radio
└── Trigger: Component #4 + "The Ancient Message" quest completed

QUEST: "Voices in the Void"
├── Objective: Repair and activate the radio transmitter
├── Sub-objectives:
│   ├── Install all 5 components
│   ├── Assign 2 Technicians for 12h repair work
│   ├── Power up the transmitter (requires 500 kWh burst)
│   └── Send the distress signal
├── Reward: Signal sent — triggers Chapter 6
└── Trigger: All 5 components collected
```

#### Chapter 6: The Wait (Days 70-90)
```
QUEST: "Signal Confirmed"
├── Objective: Receive a response to the distress signal
├── Sub-objectives:
│   ├── Keep the radio operational for 48h
│   ├── Decode the incoming response
│   └── Learn that rescue is 20 game-days away
├── Reward: Hope restored — major morale boost
└── Trigger: 48h after signal sent

QUEST: "Prepare for Departure"
├── Objective: Prepare the colony for rescue ship arrival
├── Sub-objectives:
│   ├── Build the Spaceport
│   ├── Stockpile 200 Rocket Fuel
│   ├── Ensure all crew are healthy
│   └── Build a landing beacon
├── Reward: Ready for rescue
└── Trigger: "Signal Confirmed"

QUEST: "The Final Choice" (ENDGAME)
├── Objective: Choose the colony's fate
├── Options:
│   ├── A) Everyone leaves — full evacuation, classic ending
│   ├── B) Some stay — split crew, establish permanent colony
│   └── C) Everyone stays — reject rescue, commit to colonization
├── Reward: Game ending + statistics screen
└── Trigger: Rescue ship arrives
```

### 8.2 Side Quest Chains

#### 🔬 "The Scientist's Curiosity"
```
Quest 1: "Cataloguing Flora" — Collect 10 plant samples during scouting
Quest 2: "Medicinal Properties" — Discover native plants with healing properties
Quest 3: "The Garden of Eden" — Create a botanical garden (morale++)
Quest 4: "Genetic Breakthrough" — Develop super-crop using native DNA
Reward: Food production +30% permanently
```

#### ⛏️ "The Miner's Dream"
```
Quest 1: "Deep Vein" — Discover a mega deposit through drilling
Quest 2: "The Motherlode" — Excavate a massive ore deposit
Quest 3: "Crystal Cavern" — Find a natural crystal cave
Quest 4: "Core Sample" — Reach the planet's deep crust
Reward: Permanent rare resource income, Helium-3 source
```

#### 🛡️ "Guardians of the Colony"
```
Quest 1: "Things That Go Bump" — Investigate strange sounds at night
Quest 2: "The Perimeter" — Build complete defensive ring
Quest 3: "First Contact" — Encounter native fauna (friendly or hostile)
Quest 4: "The Predator" — Deal with a large hostile creature
Reward: Security equipment blueprint, creature trophy (morale++)
```

#### 🏥 "The Doctor's Dilemma"
```
Quest 1: "Patient Zero" — Handle first major illness
Quest 2: "Pharmaceutical Pioneer" — Develop first native medicine
Quest 3: "Surgical Precision" — Perform a critical operation
Quest 4: "Pandemic Response" — Stop a colony-wide outbreak
Reward: Advanced Medicine shortcuts, doctor efficiency +20%
```

#### 🌌 "Stargazer"
```
Quest 1: "First Light" — Build the observatory
Quest 2: "Mapping the Sky" — Catalog 5 celestial objects
Quest 3: "The Binary Star" — Discover the system's binary star companion
Quest 4: "Incoming!" — Detect and prepare for a solar event
Quest 5: "The Signal" — Detect an anomalous deep-space signal
Reward: Astronomy bonuses, navigation data for endgame
```

#### 👽 "Ancient Secrets"
```
Quest 1: "Scratching the Surface" — Find first alien artifact
Quest 2: "The Translation" — Begin decoding alien language
Quest 3: "The Temple" — Discover an alien temple deep underground
Quest 4: "The Warning" — Learn why the previous civilization disappeared
Quest 5: "The Legacy" — Unlock ancient technology for the colony
Reward: Major tech shortcut, unique alien building, lore completion
```

#### 🍳 "Master Chef of the Stars"
```
Quest 1: "Beyond Rations" — Cook first meal from local ingredients
Quest 2: "Fusion Cuisine" — Combine Earth and alien ingredients
Quest 3: "The Feast" — Organize a colony celebration dinner
Quest 4: "Self-Sufficient" — Achieve 100% local food production
Reward: Permanent morale boost, food efficiency +20%
```

#### 🤖 "Rise of the Machines"
```
Quest 1: "First Drone" — Build and deploy first scout drone
Quest 2: "Automation" — Automate one production chain
Quest 3: "The AI Question" — Debate AI governance in the colony
Quest 4: "Full Automation" — Automate 50% of production
Reward: 5 "virtual workers" (drones that can fill task slots)
```

### 8.3 Repeatable / Dynamic Quests

| Quest | Trigger | Reward | Cooldown |
|---|---|---|---|
| Supply Run | Random / low resources | Resource cache found | 5 days |
| Rescue Mission | Crew member lost during scouting | Crew member saved + bonus | Event-based |
| Trade Opportunity | Late game / comms | Trade resources with passing ship | 10 days |
| Scientific Study | Research lab idle | Bonus RP for completing study | 3 days |
| Morale Event | Low morale | Organize activity for morale boost | 7 days |
| Maintenance Check | Building age | Prevent breakdown, resources saved | Per building |
| Weather Prediction | Observatory | Advance warning of storm | 2 days |

---

## 9. GAMEPLAY MECHANICS

### 9.1 Player Actions

| Action | Description | Frequency |
|---|---|---|
| Assign Crew | Assign crew members to tasks | Anytime |
| Set Rations | Adjust food/water distribution (50-125%) | Anytime |
| Build | Order construction of new buildings | When resources available |
| Research | Choose next technology to research | When lab available |
| Manage Energy | Allocate power between buildings | Anytime |
| Scout | Send exploration parties | When crew available |
| Trade | Exchange resources (late game) | When available |
| Event Response | Choose how to handle events | When events trigger |
| Dismantle | Tear down a building for partial resources | Anytime |
| Upgrade | Improve existing building efficiency | When tech allows |
| Set Priority | Prioritize which resources to produce | Anytime |
| Rest Crew | Force crew to rest (recover energy) | Anytime |

### 9.2 Rationing System

| Level | Food/Water Multiplier | Morale Effect | Health Effect |
|---|---|---|---|
| Strict (50%) | 0.5x consumption | -15 morale/day | -5 health/day |
| Reduced (75%) | 0.75x consumption | -5 morale/day | -1 health/day |
| Normal (100%) | 1.0x consumption | Neutral | Neutral |
| Generous (125%) | 1.25x consumption | +5 morale/day | +2 health/day |

### 9.3 Energy Management
- Each building has an energy cost per hour
- Energy is produced by generators (solar, geothermal, nuclear, etc.)
- If energy supply < demand, player must choose which buildings to power down
- Battery storage allows surplus energy to be saved (with capacity limit)
- Priority system: Life Support > Production > Research > Recreation

### 9.4 Day/Night Cycle Effects
- Day (12 game hours / 12 real minutes):
  - Solar energy at full capacity
  - Scouting more effective
  - Normal operations
- Night (12 game hours / 12 real minutes):
  - Solar energy at 0%
  - Scouting range reduced
  - Crew fatigue increases faster if working
  - Some events more likely (creature encounters, etc.)

### 9.5 Difficulty Settings

| Setting | Resource Rate | Event Frequency | Crew Resilience | Starting Resources |
|---|---|---|---|---|
| Easy | 1.5x | Low | High | Generous |
| Normal | 1.0x | Medium | Normal | Standard |
| Hard | 0.7x | High | Low | Minimal |
| Nightmare | 0.5x | Very High | Very Low | Barely Anything |

---

## 10. GAME ARCHITECTURE

### 10.1 Backend Server — Node.js + TypeScript

**Why Node.js + TypeScript:**
- Native async/await for tick-based game loop
- Excellent WebSocket support (real-time updates)
- TypeScript for type safety on complex game state
- Large ecosystem for needed utilities
- SQLite integration via `better-sqlite3` (synchronous, fast)

**Core Components:**

```
backend/
├── src/
│   ├── server.ts              # Express + WebSocket server
│   ├── gameLoop.ts            # Main tick engine (setInterval)
│   ├── config/
│   │   ├── resources.ts       # Resource definitions
│   │   ├── buildings.ts       # Building definitions
│   │   ├── techs.ts           # Tech tree definitions
│   │   ├── events.ts          # Event definitions
│   │   ├── quests.ts          # Quest definitions
│   │   └── balance.ts         # Game balance constants
│   ├── engine/
│   │   ├── resourceEngine.ts  # Resource production/consumption calculations
│   │   ├── crewEngine.ts      # Crew status updates
│   │   ├── buildingEngine.ts  # Construction progress
│   │   ├── researchEngine.ts  # Research point generation
│   │   ├── eventEngine.ts     # Event trigger & resolution
│   │   ├── questEngine.ts     # Quest progress tracking
│   │   └── combatEngine.ts    # Defense/creature encounters
│   ├── models/
│   │   ├── GameState.ts       # Master game state type
│   │   ├── Crew.ts            # Crew member model
│   │   ├── Building.ts        # Building instance model
│   │   ├── Resource.ts        # Resource inventory model
│   │   └── Quest.ts           # Quest state model
│   ├── api/
│   │   ├── routes.ts          # REST API routes (player actions)
│   │   └── wsHandler.ts       # WebSocket message handler
│   └── db/
│       ├── database.ts        # SQLite connection & schema
│       └── migrations/        # DB migrations
├── package.json
├── tsconfig.json
└── .env
```

**Game Loop (Tick System):**
```
Every 2 seconds (real-time):
  1. Calculate resource production from all active buildings
  2. Calculate resource consumption (crew needs + building costs)
  3. Update crew stats (energy, hunger, thirst, health, morale)
  4. Progress construction timers
  5. Progress research timers
  6. Check event triggers (random + conditional)
  7. Update quest progress
  8. Check win/lose conditions
  9. Save state to SQLite
  10. Push state update to connected clients via WebSocket
```

**Key Technical Choices:**
- **Tick interval:** 2 seconds (30 ticks per game hour, 720 ticks per game day)
- **State persistence:** SQLite with `better-sqlite3` (sync writes, no ORM overhead)
- **Communication:** WebSocket for state pushes, REST API for player actions
- **Time format:** Game ticks since start, converted to hours/days for display

### 10.2 Frontend — React + Vite + Tailwind CSS

**Why React + Vite + Tailwind:**
- Fast dev iteration with Vite HMR
- Component-based UI perfect for dashboard panels
- Tailwind for rapid styling without custom CSS
- Lightweight — no heavy graphics framework needed

**UI Layout (Text-Based Dashboard):**

```
┌─────────────────────────────────────────────────────┐
│  🚀 VOID COLONY          Day 12 | 14:30 | ⚡ 340kWh │
├──────────┬──────────────────────────────────────────┤
│ 📊 STATS │                                          │
│          │  ┌─── MAIN PANEL ──────────────────────┐ │
│ 💧 Water │  │                                     │ │
│ 🍖 Food  │  │  (Changes based on selected tab)    │ │
│ 🫁 O₂    │  │                                     │ │
│ ⚡ Energy │  │  - Crew assignments                 │ │
│ 😊 Morale│  │  - Building management              │ │
│          │  │  - Research tree                     │ │
│ 📦 STORE │  │  - Quest log                        │ │
│ Iron: 450│  │  - Event alerts                     │ │
│ Copper:80│  │  - Map / exploration                │ │
│ ...      │  │                                     │ │
│          │  └─────────────────────────────────────┘ │
│ 👥 CREW  │                                          │
│ 48 alive │  ┌─── EVENT LOG ──────────────────────┐ │
│ 2 sick   │  │ 14:28 - Mining produced 12kg iron   │ │
│ 45 active│  │ 14:15 - Dust storm warning!         │ │
│          │  │ 13:50 - Research: Mining Tech 78%   │ │
│          │  │ 13:30 - Scout team returned safely  │ │
│          │  └─────────────────────────────────────┘ │
└──────────┴──────────────────────────────────────────┘
```

**Frontend Components:**

```
frontend/
├── src/
│   ├── App.tsx                # Main layout
│   ├── hooks/
│   │   ├── useGameState.ts    # WebSocket state subscription
│   │   └── useActions.ts      # REST API action dispatchers
│   ├── components/
│   │   ├── Header.tsx         # Time, day, energy display
│   │   ├── Sidebar/
│   │   │   ├── ResourcePanel.tsx
│   │   │   ├── CrewSummary.tsx
│   │   │   └── AlertsWidget.tsx
│   │   ├── MainPanel/
│   │   │   ├── CrewManager.tsx     # Task assignments
│   │   │   ├── BuildingManager.tsx  # Construction
│   │   │   ├── ResearchTree.tsx     # Tech tree
│   │   │   ├── QuestLog.tsx         # Active quests
│   │   │   ├── MapView.tsx          # Exploration map (text)
│   │   │   └── TradePanel.tsx       # Trading (late game)
│   │   ├── EventLog.tsx        # Scrolling event feed
│   │   └── Modals/
│   │       ├── EventModal.tsx  # Event decision popup
│   │       └── CrewDetail.tsx  # Individual crew info
│   ├── types/
│   │   └── gameTypes.ts       # Shared types with backend
│   └── utils/
│       └── formatters.ts      # Display helpers
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.ts
```

### 10.3 Communication Protocol

**WebSocket Messages (Server → Client):**
```typescript
type ServerMessage =
  | { type: 'STATE_UPDATE'; payload: GameState }      // Every tick
  | { type: 'EVENT_TRIGGER'; payload: GameEvent }      // When event fires
  | { type: 'QUEST_UPDATE'; payload: QuestUpdate }     // Quest progress
  | { type: 'NOTIFICATION'; payload: Notification }    // Alerts
  | { type: 'GAME_OVER'; payload: GameOverData }       // Win/lose
```

**REST API (Client → Server):**
```
POST /api/action/assign-crew     { crewId, taskId, buildingId }
POST /api/action/build           { buildingType, location }
POST /api/action/research        { techId }
POST /api/action/set-rations     { level: 50|75|100|125 }
POST /api/action/set-energy      { buildingId, powered: boolean }
POST /api/action/scout           { crewIds[], direction }
POST /api/action/event-response  { eventId, choice }
POST /api/action/dismantle       { buildingId }
POST /api/game/new               { difficulty }
POST /api/game/save              {}
POST /api/game/load              { saveId }
GET  /api/game/state             # Full state snapshot
```

### 10.4 Database Schema (SQLite)

```sql
-- Core game state
CREATE TABLE game (
    id INTEGER PRIMARY KEY,
    tick INTEGER NOT NULL DEFAULT 0,
    difficulty TEXT NOT NULL DEFAULT 'normal',
    status TEXT NOT NULL DEFAULT 'playing',  -- playing, won, lost
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Resources inventory
CREATE TABLE resources (
    game_id INTEGER REFERENCES game(id),
    resource_id TEXT NOT NULL,
    quantity REAL NOT NULL DEFAULT 0,
    production_rate REAL NOT NULL DEFAULT 0,
    consumption_rate REAL NOT NULL DEFAULT 0,
    PRIMARY KEY (game_id, resource_id)
);

-- Crew members
CREATE TABLE crew (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id INTEGER REFERENCES game(id),
    name TEXT NOT NULL,
    specialization TEXT NOT NULL,
    secondary_skill_1 TEXT,
    secondary_skill_2 TEXT,
    health REAL NOT NULL DEFAULT 100,
    morale REAL NOT NULL DEFAULT 70,
    energy REAL NOT NULL DEFAULT 100,
    hunger REAL NOT NULL DEFAULT 100,
    thirst REAL NOT NULL DEFAULT 100,
    status TEXT NOT NULL DEFAULT 'healthy',
    assigned_task TEXT,
    assigned_building INTEGER,
    is_alive BOOLEAN NOT NULL DEFAULT TRUE
);

-- Buildings
CREATE TABLE buildings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id INTEGER REFERENCES game(id),
    building_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'operational',  -- constructing, operational, damaged, destroyed
    construction_progress REAL DEFAULT 100,       -- 0-100%
    condition REAL NOT NULL DEFAULT 100,           -- 0-100% (maintenance)
    powered BOOLEAN NOT NULL DEFAULT TRUE,
    level INTEGER NOT NULL DEFAULT 1
);

-- Research
CREATE TABLE research (
    game_id INTEGER REFERENCES game(id),
    tech_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'locked',  -- locked, available, researching, completed
    progress REAL NOT NULL DEFAULT 0,
    PRIMARY KEY (game_id, tech_id)
);

-- Quests
CREATE TABLE quests (
    game_id INTEGER REFERENCES game(id),
    quest_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'locked',  -- locked, available, active, completed, failed
    progress_data TEXT,  -- JSON for sub-objectives
    PRIMARY KEY (game_id, quest_id)
);

-- Event log
CREATE TABLE event_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id INTEGER REFERENCES game(id),
    tick INTEGER NOT NULL,
    event_type TEXT NOT NULL,
    event_data TEXT,  -- JSON
    resolved BOOLEAN DEFAULT FALSE,
    resolution TEXT
);

-- Exploration map
CREATE TABLE map_tiles (
    game_id INTEGER REFERENCES game(id),
    x INTEGER NOT NULL,
    y INTEGER NOT NULL,
    terrain TEXT NOT NULL,
    explored BOOLEAN NOT NULL DEFAULT FALSE,
    resource_deposit TEXT,
    structure TEXT,
    PRIMARY KEY (game_id, x, y)
);
```

---

## 11. GAME BALANCE GUIDELINES

### 11.1 Early Game (Days 1-10)
- Player should feel resource pressure but not immediate danger
- Focus on establishing basic production chains
- First quest chain guides the player
- 1-2 minor events to introduce the system

### 11.2 Mid Game (Days 10-40)
- Multiple production chains running simultaneously
- Research opens new possibilities
- Event frequency increases
- Side quests provide variety
- Player starts planning for radio repair

### 11.3 Late Game (Days 40-70)
- Complex resource management with many buildings
- Rare resources become the bottleneck
- Major quest decisions with consequences
- Crisis events test player's preparedness

### 11.4 Endgame (Days 70-90)
- Final push for radio repair components
- Maximum event pressure
- Ultimate choice about colony fate
- Satisfying conclusion regardless of path

### 11.5 Key Balance Numbers
- Starting crew: 48-52 (randomized)
- Starting resources: ~200 iron, ~100 food rations, ~100 water, ~50 kWh stored
- Base daily consumption (full crew): ~100 food, ~100 water, ~50 O₂
- Expected game length: ~90 game days (36 real hours over multiple sessions)

---

## 12. DEVELOPMENT PHASES

### Phase 1 — Core Engine (MVP)
- Game loop with tick system
- Resource production and consumption
- Basic crew assignment system
- 5 basic resources (water, food, O₂, energy, iron)
- 3 basic buildings (mine, farm, solar)
- Simple frontend showing stats
- WebSocket connection

### Phase 2 — Full Resource & Building System
- All resources implemented
- All Tier 1-2 buildings
- Construction system with timers
- Processed materials crafting
- Rationing system
- Energy management

### Phase 3 — Crew & Events
- Full crew attribute system
- Specializations and efficiency
- Morale system
- Event engine with random events
- Day/night cycle

### Phase 4 — Research & Tech Tree
- Research lab mechanics
- Full tech tree
- Tech prerequisites and unlocks
- Research point generation

### Phase 5 — Quests
- Main quest line (Chapters 1-6)
- Side quest chains
- Quest UI and tracking
- Win/lose conditions

### Phase 6 — Exploration & Endgame
- Map and exploration system
- Tier 3-4 buildings
- Late-game events and quests
- Multiple endings
- Save/load system

### Phase 7 — Polish
- Difficulty settings
- Balance tuning
- Idle mode (offline progress)
- Sound effects (optional text notifications)
- Achievement system
- Statistics and leaderboard

---

## 13. CLAUDE CODE DEVELOPMENT INSTRUCTIONS

When developing this game with Claude Code, follow these guidelines:

### Project Setup
```bash
mkdir void-colony
cd void-colony
mkdir backend frontend
# Backend
cd backend
npm init -y
npm install typescript express ws better-sqlite3 dotenv uuid
npm install -D @types/express @types/ws @types/better-sqlite3 ts-node nodemon
npx tsc --init
# Frontend
cd ../frontend
npm create vite@latest . -- --template react-ts
npm install
npm install -D tailwindcss @tailwindcss/vite
```

### Development Pattern
1. Start with Phase 1 — get a working game loop displaying in browser
2. Each phase should result in a playable version
3. Write game config as TypeScript objects (easy to balance later)
4. Use a single GameState object that gets serialized to SQLite
5. Test each engine module independently before integration
6. Keep frontend simple — text, tables, emojis, colors via Tailwind

### Key Conventions
- All time values in ticks (1 tick = 2 seconds real-time)
- All quantities as numbers (no string formatting in backend)
- All IDs as snake_case strings
- Frontend handles all formatting and display
- Game state is the single source of truth
- Every player action goes through REST API → validated → applied to state

---

*This document serves as the complete reference for building VOID COLONY. Each section can be implemented independently following the phase plan above. The game is designed to be engaging through its systems, events, and quests rather than graphics.*
