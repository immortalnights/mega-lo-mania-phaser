import Phaser, { Game } from 'phaser'
import { Teams, GameEvents, BuildingTypes, unitSet } from './defines.js'
import Islands from './assets/islands.json'
import { getKeyForSector } from './utilities'

const getDefaultDefendersForBuilding = (type) => {
  let defenderCount = 0

  switch (type)
  {
    case BuildingTypes.CASTLE:
    {
      defenderCount = 4
      break
    }
    case BuildingTypes.MINE:
    {
      defenderCount = 2
      break
    }
    case BuildingTypes.FACTORY:
    {
      defenderCount = 3
      break
    }
    case BuildingTypes.LABORATORY:
    {
      defenderCount = 1
      break
    }
  }

  return Array(defenderCount)
}

class Sector
{
  constructor(scene, index, key, startEpoch)
  {
    this.scene = scene
    this.id = index,
    this.key = key
    this.epoch = startEpoch
    this.startPopulation = 0
    this.availablePopulation = 0
    this.spawnedPopulation = 0
    this.deployedPopulation = 0
    this.resources = []
    this.buildings = {
      castle: false,
      mine: false,
      factory: false,
      laboratory: false,
    }
    this.technologies = {
      tech1: false,
      tech2: false,
      tech3: false,
      tech4: false,
      tech5: false,
      tech6: false,
      tech7: false,
      tech8: false,
      tech9: false,
      tech10: false,
      tech11: false,
      tech12: false
    }
    this.research = null
    this.construction = null
    this.production = null
    this.armies = []
    this.nuked = false
  }

  beginResearch(technology)
  {
    const tech = this.technologies[technology]
    if (tech)
    {
      this.research = {
        researches: 0,
        name: technology,
        started: 0,
        duration: tech.duration,
      }

      this.scene.events.emit(GameEvents.RESEARCH_CHANGED, this)
    }
  }
}

export default class Store extends Phaser.Events.EventEmitter
{
  constructor(scene)
  {
    super()

    this.scene = scene

    this.players = []
    this.sectors = {}
  }

  setIsland(name)
  {
    const island = Islands.find(i => i.name === name)
    console.assert(island != null, `Island '${name}' is invalid`)
    this.island = { ...island }

    this.sectors = {}
    this.island.map.forEach((value, index) => {
      if (value)
      {
        this.addEpock(index, getKeyForSector(index, island.map), 1)
      }
    })
  }

  addSector(index, key, startEpoch)
  {
    this.sectors[index] = new Sector(this.scene, index, key, startEpoch)
    return this.sectors[index]
  }

  setPlayers(teams)
  {
    teams.forEach(team => {
      this.players.push({
        team,
        allies: []
      })
    })
  }

  allocatePopulation(sector, task, population = 1)
  {
    const sec = this.sectors[sector]
    sec.tasks[task] += population
    this.scene.events.emit(GameEvents.POPULATION_ALLOCATION_CHANGED, task, sec.tasks[task])
  }

  deallocatePopulation(sector, task, population = 1)
  {
    const sec = this.sectors[sector]
    sec.tasks[task] -= population
    this.scene.events.emit(GameEvents.POPULATION_ALLOCATION_CHANGED, task, sec.tasks[task])
  }

  /**
   * 
   * @param {*} sector 
   * @param {*} destination 
   * @returns {boolean} True if the two sectors are connected
   */
  hasPath(sector, destination)
  {
    return true
  }

  isAllied(team, other=null)
  {
    const p = this.players.find(p => p.team === team)
    return other ? p.allies.includes(other) : p.allies.length > 0
  }

  updateTeams(localPlayer)
  {
    const teams = []
    let localPlayerAllied = false

    const isIncluded = t => {
      return -1 !== teams.findIndex(group => {
        return group.includes(t)
      })
    }

    this.players.forEach(p => {
      if (isIncluded(p.team))
      {
        // Skip
      }
      else if (p.allies.length === 0)
      {
        if (teams.includes(p.team) === false)
        {
          teams.push(p.team)
        }
      }
      else
      {
        if (p.team === localPlayer)
        {
          localPlayerAllied = true
        }

        teams.push([p.team].concat(p.allies))
      }
    })

    this.scene.events.emit(GameEvents.TEAMS_CHANGED, teams, localPlayerAllied)
  }

  makeAlliance(a, b)
  {
    const player = this.players.find(p => p.team === a)
    player.allies.push(b)

    const otherPlayer = this.players.find(p => p.team === b)
    otherPlayer.allies.push(a)

    // Update team shields
    this.updateTeams(a)
  }

  breakAlliances(a)
  {
    const player = this.players.find(p => p.team === a)

    // update all allies
    player.allies.forEach(name => {
      const ally = this.players.find(p => p.team === name)
      const index = ally.allies.findIndex(i => i === player.team)
      ally.allies.splice(index, 1)
    })

    player.allies.splice(0, player.allies.length)

    // Update team shields
    this.updateTeams(a)
  }

  buildBuilding(sector, type, team)
  {
    const sec = this.sectors[sector]
    console.assert(sec.buildings[type] === false, `Attempted to build another ${type} in sector ${sector}`)
    sec.buildings[type] = {
      team,
      defenders: getDefaultDefendersForBuilding(type)
    }

    this.scene.events.emit(GameEvents.SECTOR_ADD_BUILDING, sector, type, team)
  }

  destroyBuilding(sector, type)
  {
    const sec = this.sectors[sector]
    console.assert(sec.buildings[type] !== false, `Attempted to destroy missing ${type} in sector ${sector}`)

    sec.buildings[type] = false

    this.scene.events.emit(GameEvents.SECTOR_REMOVE_BUILDING, sector, type)
  }

  hasDefender(sector, building, position)
  {
    const sec = this.sectors[sector]
    const b = sec.buildings[building]
    return !!b.defenders[position]
  }

  addDefender(sector, building, position, type)
  {
    console.log("add defender", sector, building, position, type)
    const sec = this.sectors[sector]
    const b = sec.buildings[building]

    b.defenders[position] = type
    this.scene.events.emit(GameEvents.BUILDING_ADD_DEFENDER, sector, building, position, type)
  }

  removeDefender(sector, building, position)
  {
    console.log("remove defender", sector, building, position)

    const sec = this.sectors[sector]
    const b = sec.buildings[building]
    b.defenders[position] = undefined

    this.scene.events.emit(GameEvents.BUILDING_REMOVE_DEFENDER, sector, building, position)
  }

  hasArmy(sectorIndex, team)
  {
    const sector = this.sectors[sectorIndex]
    return !!sector.armies.find(a => a.team === team)
  }

  /**
   * Deploy an army from a Castle to a Sector
   * @param {Integer} sectorIndex Source sector owned by the player
   * @param {Object} units Army units and quantity
   * @param {Integer} destination Destination sector (optional)
   */
  deployArmy(sectorIndex, units, destinationIndex=undefined)
  {
    //
    const sector = this.sectors[sectorIndex]
    const castle = sector.buildings['castle']

    if (destinationIndex == null) { destinationIndex = sectorIndex }
    const destination = this.sectors[destinationIndex]

    if (castle == null)
    {
      console.warn(`Cannot deploy army from sector ${sectorIndex}, not owned by player`)
    }
    else if (this.hasPath(sectorIndex, destinationIndex) === false)
    {
      console.warn(`Cannot deploy army from sector ${sectorIndex} to ${destinationIndex}, no path`)
    }
    else
    {
      const ownerTeam = castle.team
      let isNew = false
      let army = destination.armies.find(a => a.team === ownerTeam)

      if (army == null)
      {
        army = { team: ownerTeam, ...unitSet }
        destination.armies.push(army)
        isNew = true
      }

      this.combineArmies(army, units)

      if (sectorIndex === destinationIndex)
      {
        this.scene.events.emit(GameEvents.SECTOR_ADD_ARMY, sectorIndex, ownerTeam, army)
      }
      else
      {
        this.moveArmy(sectorIndex, destinationIndex)
      }
    }
  }

  /**
   * Move an army from one Sector to another
   */
  moveArmy(sectorIndex, destinationIndex, team)
  {
    const source = this.sectors[sectorIndex]
    const destination = this.sectors[destinationIndex]

    if (source === destination)
    {
      // Nothing to do.
    }
    else if (this.hasPath(sectorIndex, destinationIndex) === false)
    {
      console.warn(`Cannot deploy army from sector ${sectorIndex} to ${destinationIndex}, no path`)
    }
    else
    {
      let armyIndex = source.armies.findIndex(a => a.team === team)

      if (armyIndex == -1)
      {
        console.warn(`No army for ${team} on sector ${sectorIndex}`)
      }
      else
      {
        // Remove army from the source Sector
        const sourceArmy = source.armies.splice(armyIndex, 1)[0]
        let destinationArmy = destination.armies.find(a => a.team === team)

        // Create destination army, if required
        if (destinationArmy == null)
        {
          destinationArmy = { team: team, ...unitSet }
          destination.armies.push(destinationArmy)
        }

        // Merge armies
        this.combineArmies(destinationArmy, sourceArmy)

        this.scene.events.emit(GameEvents.SECTOR_REMOVE_ARMY, sectorIndex, team, sourceArmy)
        this.scene.events.emit(GameEvents.SECTOR_ADD_ARMY, destinationIndex, team, destinationArmy)
      }
    }
  }

  /**
   * Move an army into own Castle
   */
  retireArmy(sector)
  {

  }

  /**
   * Adds others to 'destination'
   * @param {Object} destination
   * @param {*} others
   * @returns destination, with others merged in
   */
  combineArmies(destination, ...others)
  {
    const ignoredKeys = ['team']

    others.forEach(b => {
      for (const [key, value] of Object.entries(b))
      {
        if (ignoredKeys.includes(key) === false)
        {
          destination[key] += value
        }
      }
    })

    return destination
  }
}