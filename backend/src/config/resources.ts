export type ResourceId =
  | 'water' | 'oxygen' | 'food' | 'energy'
  | 'iron_ore' | 'copper' | 'aluminium' | 'nickel' | 'lithium'
  | 'titanium' | 'uranium' | 'silicon' | 'gold' | 'platinum'
  | 'rare_earth' | 'coal' | 'oil' | 'nat_gas' | 'sulfur'
  | 'salt' | 'sand' | 'clay' | 'ice'
  | 'steel' | 'concrete' | 'glass' | 'plastic' | 'electronics'
  | 'battery_cells' | 'fuel_cells' | 'carbon_fiber' | 'alloy_plates'
  | 'fertilizer' | 'medicine' | 'bioplastic' | 'insulation'
  | 'wiring' | 'optical_fiber' | 'rocket_fuel'
  | 'alien_crystal' | 'ancient_artifact' | 'biomass'
  | 'hydrogen' | 'nitrogen' | 'helium3';

export interface ResourceDef {
  id: ResourceId;
  name: string;
  unit: string;
  category: 'life_support' | 'metal' | 'non_metal' | 'processed' | 'special';
  critical: boolean;
}

export const RESOURCES: Record<ResourceId, ResourceDef> = {
  water:          { id: 'water',         name: 'Water',            unit: 'L',     category: 'life_support', critical: true },
  oxygen:         { id: 'oxygen',        name: 'Oxygen',           unit: 'O₂',   category: 'life_support', critical: true },
  food:           { id: 'food',          name: 'Food',             unit: 'ration',category: 'life_support', critical: true },
  energy:         { id: 'energy',        name: 'Energy',           unit: 'kWh',  category: 'life_support', critical: true },
  iron_ore:       { id: 'iron_ore',      name: 'Iron Ore',         unit: 'kg',   category: 'metal',        critical: false },
  copper:         { id: 'copper',        name: 'Copper',           unit: 'kg',   category: 'metal',        critical: false },
  aluminium:      { id: 'aluminium',     name: 'Aluminium',        unit: 'kg',   category: 'metal',        critical: false },
  nickel:         { id: 'nickel',        name: 'Nickel',           unit: 'kg',   category: 'metal',        critical: false },
  lithium:        { id: 'lithium',       name: 'Lithium',          unit: 'kg',   category: 'metal',        critical: false },
  titanium:       { id: 'titanium',      name: 'Titanium',         unit: 'kg',   category: 'metal',        critical: false },
  uranium:        { id: 'uranium',       name: 'Uranium',          unit: 'kg',   category: 'metal',        critical: false },
  silicon:        { id: 'silicon',       name: 'Silicon',          unit: 'kg',   category: 'metal',        critical: false },
  gold:           { id: 'gold',          name: 'Gold',             unit: 'g',    category: 'metal',        critical: false },
  platinum:       { id: 'platinum',      name: 'Platinum',         unit: 'g',    category: 'metal',        critical: false },
  rare_earth:     { id: 'rare_earth',    name: 'Rare Earth',       unit: 'g',    category: 'metal',        critical: false },
  coal:           { id: 'coal',          name: 'Coal',             unit: 'kg',   category: 'non_metal',    critical: false },
  oil:            { id: 'oil',           name: 'Oil',              unit: 'L',    category: 'non_metal',    critical: false },
  nat_gas:        { id: 'nat_gas',       name: 'Natural Gas',      unit: 'm³',   category: 'non_metal',    critical: false },
  sulfur:         { id: 'sulfur',        name: 'Sulfur',           unit: 'kg',   category: 'non_metal',    critical: false },
  salt:           { id: 'salt',          name: 'Salt',             unit: 'kg',   category: 'non_metal',    critical: false },
  sand:           { id: 'sand',          name: 'Sand',             unit: 'kg',   category: 'non_metal',    critical: false },
  clay:           { id: 'clay',          name: 'Clay',             unit: 'kg',   category: 'non_metal',    critical: false },
  ice:            { id: 'ice',           name: 'Ice',              unit: 'kg',   category: 'non_metal',    critical: false },
  steel:          { id: 'steel',         name: 'Steel',            unit: 'kg',   category: 'processed',    critical: false },
  concrete:       { id: 'concrete',      name: 'Concrete',         unit: 'kg',   category: 'processed',    critical: false },
  glass:          { id: 'glass',         name: 'Glass',            unit: 'unit', category: 'processed',    critical: false },
  plastic:        { id: 'plastic',       name: 'Plastic',          unit: 'kg',   category: 'processed',    critical: false },
  electronics:    { id: 'electronics',   name: 'Electronics',      unit: 'unit', category: 'processed',    critical: false },
  battery_cells:  { id: 'battery_cells', name: 'Battery Cells',    unit: 'unit', category: 'processed',    critical: false },
  fuel_cells:     { id: 'fuel_cells',    name: 'Fuel Cells',       unit: 'unit', category: 'processed',    critical: false },
  carbon_fiber:   { id: 'carbon_fiber',  name: 'Carbon Fiber',     unit: 'kg',   category: 'processed',    critical: false },
  alloy_plates:   { id: 'alloy_plates',  name: 'Alloy Plates',     unit: 'unit', category: 'processed',    critical: false },
  fertilizer:     { id: 'fertilizer',    name: 'Fertilizer',       unit: 'kg',   category: 'processed',    critical: false },
  medicine:       { id: 'medicine',      name: 'Medicine',         unit: 'unit', category: 'processed',    critical: false },
  bioplastic:     { id: 'bioplastic',    name: 'Bioplastic',       unit: 'kg',   category: 'processed',    critical: false },
  insulation:     { id: 'insulation',    name: 'Insulation',       unit: 'unit', category: 'processed',    critical: false },
  wiring:         { id: 'wiring',        name: 'Wiring',           unit: 'm',    category: 'processed',    critical: false },
  optical_fiber:  { id: 'optical_fiber', name: 'Optical Fiber',    unit: 'm',    category: 'processed',    critical: false },
  rocket_fuel:    { id: 'rocket_fuel',   name: 'Rocket Fuel',      unit: 'L',    category: 'processed',    critical: false },
  alien_crystal:  { id: 'alien_crystal', name: 'Alien Crystal',    unit: 'unit', category: 'special',      critical: false },
  ancient_artifact:{ id: 'ancient_artifact', name: 'Ancient Artifact', unit: 'unit', category: 'special', critical: false },
  biomass:        { id: 'biomass',       name: 'Biomass',          unit: 'kg',   category: 'special',      critical: false },
  hydrogen:       { id: 'hydrogen',      name: 'Hydrogen',         unit: 'L',    category: 'special',      critical: false },
  nitrogen:       { id: 'nitrogen',      name: 'Nitrogen',         unit: 'm³',   category: 'special',      critical: false },
  helium3:        { id: 'helium3',       name: 'Helium-3',         unit: 'g',    category: 'special',      critical: false },
};
