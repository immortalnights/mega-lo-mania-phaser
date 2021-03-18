
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
  YELLOW: 'yellow',
  GREEN: 'green',
  BLUE: 'blue',
}

export const UnitTypes = {
  STONE: 'stone',
  ROCK: 'rock',
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

// Cloned for new armies
export const unitSet = {}
Object.keys(UnitTypes).forEach(k => {
  unitSet[k.toLowerCase()] = 0
})

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

export const PlayerStates = {
  DEFAULT: '',
  DEPLOY_ARMY: 'army:deploy',
  MOVE_ARMY: 'army:move',
}

export const UserEvents = {
  SECTOR_MAP_SELECT: 'user:map:sector:select',
  SECTOR_SELECT: 'user:sector:select',
  BUILDING_SELECT: 'user:sector:building:select',
  BUILDING_SELECT_DEFENDER_POSITION: 'user:sector:building:defender_position:select',
  REQUEST_ALLY: 'user:request:ally',
}

// Game Sector events
export const GameEvents = {
  SECTOR_VIEW: 'game:view:sector',
  SECTOR_ALERT: 'game:sector:alert',
  SECTOR_ADD_BUILDING: 'game:sector:add_building',
  SECTOR_REMOVE_BUILDING: 'game:sector:remove_building',
  SECTOR_ADD_ARMY: 'game:sector:add_army',
  SECTOR_REMOVE_ARMY: 'game:sector:remove_army',
  SECTOR_ACTIVATE_ARMY: 'game:sector:activate_army',
  SECTOR_DEACTIVATE_ARMY: 'game:sector:deactivate_army',
  SECTOR_START_CLAIM: 'game:sector:start_claim',
  SECTOR_STOP_CLAIM: 'game:sector:stop_claim',
  SECTOR_NUKED: 'game:sector:nuke',
  BUILDING_ADD_DEFENDER: 'building:add_defender',
  BUILDING_REMOVE_DEFENDER: 'building:remove_defender',
  TEAM_ALLIANCE_CHANGED: 'team:alliance_changed',
  TEAM_DEFEATED: 'team:defeated',
}