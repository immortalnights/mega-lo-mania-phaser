
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

// Cloned for new armies
export const unitSet = {}

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
  VALUE_RESET: 'value_reset',
  VALUE_MIX: 'value_min',
  VALUE_MAX: 'value_max',
  VALUE_LINK_DOWN: 'value_link_down',
  VALUE_LINK_UP: 'value_link_up',
  VALUE_TOGGLE_DOWN: 'value_toggle_down',
  VALUE_TOGGLE_UP: 'value_toggle_up',

  SECTOR_CONTROLS_VIEW_CHANGE: 'user:sector_controls:view_change',

  SECTOR_MAP_SELECT: 'user:map:sector:select',
  SECTOR_SELECT: 'user:sector:select',
  BUILDING_SELECT: 'user:sector:building:select',
  BUILDING_SELECT_DEFENDER_POSITION: 'user:sector:building:defender_position:select',
  REQUEST_ALLIANCE: 'user:request:alliance',
  BREAK_ALLIANCES: 'user:break:alliances',
  CHANGE_MINERS: 'user:change_miners',
  CHANGE_RESEARCHERS: 'user:change_researchers',
  CHANGE_BUILDERS: 'user:change_builders',
  CHANGE_MANUFACTURERS: 'user:change_manufacturers',
  CHANGE_PRODUCTION_RUNS: 'user:change_production_runs',
  ALLOCATE_POPULATION: 'user:allocate_population',
  DEALLOCATE_POPULATION: 'user:deallocate_population',
  SELECT_RESEARCH: 'user:select_research',
  SELECT_PRODUCTION: 'user:select_production',

  ADD_TO_ARMY: 'user:offense:add_army',
  DISCARD_ARMY_IN_HAND: 'user:offense:discard_army',
}

// Game Sector events
export const GameEvents = {
  SECTOR_VIEW: 'game:view:sector',
  ACTIVATE_SECTOR: 'game:activate:sector',
  SECTOR_ALERT: 'game:sector:alert',
  BUILDING_CONSTRUCTED: 'game:building_constructed',
  SECTOR_ADD_BUILDING: 'game:sector:add_building',
  SECTOR_REMOVE_BUILDING: 'game:sector:remove_building',
  SECTOR_ADD_ARMY: 'game:sector:add_army',
  SECTOR_REMOVE_ARMY: 'game:sector:remove_army',
  SECTOR_ACTIVATE_ARMY: 'game:sector:activate_army',
  SECTOR_DEACTIVATE_ARMY: 'game:sector:deactivate_army',
  SECTOR_START_CLAIM: 'game:sector:start_claim',
  SECTOR_STOP_CLAIM: 'game:sector:stop_claim',
  SECTOR_NUKED: 'game:sector:nuke',
  ADVANCED_TECH_LEVEL: 'game:sector:advanced_tech_level',
  BUILDING_ADD_DEFENDER: 'game:building:add_defender',
  BUILDING_REMOVE_DEFENDER: 'game:building:remove_defender',
  TEAMS_CHANGED: 'game:teams:changed',
  POPULATION_CHANGED: 'game:sector:population:changed',
  RESOURCES_CHANGED: 'game:resources:changed',
  RESOURCE_DEPLETED: 'game:resources:depleted',
  RESEARCH_CHANGED: 'game:research:changed',
  RESEARCH_COMPLETED: 'game:research:completed',
  PRODUCTION_CHANGED: 'game:production:changed',
  PRODUCTION_COMPLETED: 'game:production:completed',
  PRODUCTION_RUN_COMPLETED: 'game:production_run:completed',
  POPULATION_ALLOCATION_CHANGED: 'game:population:allocation_changed',
  ARMY_CHANGED: 'game:offensive:army_changed',
  ENABLE_REPAIR_MODE: 'game:repair:enable_repair',
  ENABLE_DEFENDER_PLACEMENT_MODE: 'game:defensive:enable_placement',
}