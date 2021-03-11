
export const DefaultKeys = {
  up: 'up',
  down: 'down',
  left: 'left',
  right: 'right',
  space: 'space',
  one: 'one',
  two: 'two',
  three: 'three',
}

export const Teams = {
  RED: 'red',
  GREEN: 'green',
  BLUE: 'blue',
  YELLOW: 'yellow',
}

export const UnitTypes = {
  // UNARMED: 'unarmed',
  STONE: 'stone',
  // SLING: 'sling',
  // PIKE: 'pike',
  // BOW_AND_ARROW: 'bowandarrow',
  // CATAPULT: 'catapult',
  // CANNON: 'cannon',
  // BIPLANE: 'biplane',
  // JET: 'jet',
  // NUKE: 'nuke',
  // FLYING_SAUCER: 'flyingsaucer',
}

export const DefenderUnitTypes = {
  STICK: 'stick',
  // SPEAR: 'spear',
  // ARCHER: 'archer',
  // OIL: 'oil',
  // CROSSBOW: 'crossbow',
  // RIFLE: 'rifle',
  // MACHINE_GUN: 'machine_gun',
  // ROCKET_LAUNCHER: 'rocketlauncher',
  // ANTI_NUKE: 'antinuke',
  // LASER: 'laser',
}

export const BuildingTypes = {
  CASTLE: 'castle',
  MINE: 'mine',
  FACTORY: 'factory',
  LABORATORY: 'laboratory',
}

export const UserEvents = {
  SECTOR_SELECT: 'user:sector:select',
  BUILDING_PLACE_DEFENDER: 'user:building:place_defender',
  BUILDING_REMOVE_DEFENDER: 'user:building:remove_defender',
}

// Game Sector events
export const GameEvents = {
  SECTOR_VIEW: 'game:view:sector',
  SECTOR_ALERT: 'game:sector:alert',
  SECTOR_ADD_BUILDING: 'game:sector:add_building',
  SECTOR_REMOVE_BUILDING: 'game:sector:remove_building',
  SECTOR_ADD_ARMY: 'game:sector:add_army',
  SECTOR_REMOVE_ARMY: 'game:sector:remove_army',
  SECTOR_START_CLAIM: 'game:sector:start_claim',
  SECTOR_STOP_CLAIM: 'game:sector:stop_claim',
  SECTOR_NUKE: 'game:sector:nuke',
}