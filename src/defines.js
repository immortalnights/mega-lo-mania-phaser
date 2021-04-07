
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
  PIKE: 'pike',
  // BOW_AND_ARROW: 'bowandarrow',
  // CATAPULT: 'catapult',
  // CANNON: 'cannon',
  // BIPLANE: 'biplane',
  JET: 'jet',
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
  // BOW: 'bow',
  // OIL: 'oil',
  // CROSSBOW: 'crossbow',
  RIFLE: 'rifle',
  // MACHINE_GUN: 'machinegun',
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
  VALUE_CLICKED: 'value_clicked',
  VALUE_RELEASED: 'value_released',
  VALUE_CHANGE: 'value_change',
  VALUE_LINK_DOWN: 'value_link_down',
  VALUE_LINK_UP: 'value_link_up',

  SECTOR_MAP_SELECT: 'user:map:sector:select',
  SECTOR_SELECT: 'user:sector:select',
  BUILDING_SELECT: 'user:sector:building:select',
  BUILDING_SELECT_DEFENDER_POSITION: 'user:sector:building:defender_position:select',
  REQUEST_ALLIANCE: 'user:request:alliance',
  BREAK_ALLIANCES: 'user:break:alliances',
  ALLOCATE_POPULATION: 'user:allocate_population',
  DEALLOCATE_POPULATION: 'user:deallocate_population',
  SELECT_RESEARCH: 'user:select_research',
  SELECT_PRODUCTION: 'user:select_production',
}

// Game Sector events
export const GameEvents = {
  SECTOR_VIEW: 'game:view:sector',
  ACTIVATE_SECTOR: 'game:activate:sector',
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
  BUILDING_ADD_DEFENDER: 'game:building:add_defender',
  BUILDING_REMOVE_DEFENDER: 'game:building:remove_defender',
  TEAMS_CHANGED: 'game:teams:changed',
  RESOURCES_CHANGED: 'game:resources:changed',
  RESOURCE_DEPLETED: 'game:resources:depleted',
  RESEARCH_CHANGED: 'game:research:changed',
  RESEARCH_COMPLETED: 'game:research:completed',
  PRODUCTION_CHANGED: 'game:production:changed',
  PRODUCTION_COMPLETED: 'game:production:completed',
  PRODUCTION_RUN_COMPLETED: 'game:production_run:completed',
  POPULATION_ALLOCATION_CHANGED: 'game:population:allocation_changed',
}