import Phaser, { Game } from 'phaser'
import { Teams, GameEvents, BuildingTypes, unitSet } from './defines.js'
import Islands from './assets/islands.json'
import Technologies from './assets/technologies.json'
import Resources from './assets/resources.json'
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
  constructor(scene, index, key)
  {
    this.scene = scene
    this.id = index,
    this.key = key
    this.epoch = 0
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
    this.technologies = {}
    this.research = null
    this.construction = null
    this.production = null
    this.armies = []
    this.nuked = false
  }

  /**
   * Initialize the sector resources and technologies (based on the epoch)
   */
  setup(epoch, resources = [])
  {
    Technologies.forEach(technology => {
      if (technology.technologyLevel >= epoch && technology.technologyLevel < epoch + 4)
      {
        this.technologies[technology.id] = { ...technology, researched: false }
      }
    })

    Resources.forEach(res => {
      if (resources.includes(res.id))
      {
        this.resources.push({
          ...res,
          available: 0,
          mined: 0,
          depleted: false,
          miners: 0,
        })
      }
    })
  }

  /**
   * Claim this sector for the specified player
   * @param {String} team 
   * @param {Number} population 
   */
  claim(team, population)
  {
    console.assert(this.buildings.castle === false, `Sector ${this.index} is already owned!`)

    this.buildings.castle = {
      team,
      // FIXME move defenders to root of sector and have building apply them from there?
      defenders: []
    }

    this.startPopulation = population
    this.availablePopulation = population
  }

  tick(time, delta)
  {
    // Handle combat
    if (this.armies.length > 0)
    {
      
    }

    // Check if the sector is claimed
    if (this.buildings.castle === false)
    {
      // Handle castle building
      if (this.armies.length === 1)
      {

      }
    }
    else
    {
      // Apply population growth

      // Handle buildings (since the sector may not be claimed)

      // Handle mining / resources

      // Handle research
      if (this.research)
      {
        if (this.research.allocated > 0)
        {
          this.research.remainingDuration -= 1

          if (this.research.remainingDuration < 0)
          {
            // Mark the technology as completed
            this.technologies[this.research.name].researched = true

            // Sector alert (map / audio)
            this.scene.events.emit(GameEvents.RESEARCH_COMPLETED, this)

            // Deallocate the population
            this.availablePopulation = this.availablePopulation + this.research.allocated

            // Reset the current research
            this.research = false
          }

          this.scene.events.emit(GameEvents.RESEARCH_CHANGED, this)
        }
      }

      // Handle Production
      if (this.production)
      {
        if (this.production.allocated > 0)
        {
          this.production.remainingDuration -= 1

          if (this.production.remainingDuration < 0)
          {
            this.production.runs -= 1

            // Mark the technology as completed
            this.technologies[this.production.name].available += 1

            // Sector alert (map / audio) (for an individual item)
            this.scene.events.emit(GameEvents.PRODUCTION_COMPLETED, this)

            if (this.production.runs > 0)
            {
              this.production.remainingDuration = this.production.duration
            }
            else
            {
              // Sector alert (map / audio) (for the entire run)
              this.scene.events.emit(GameEvents.PRODUCTION_RUN_COMPLETED, this)
  
              // Deallocate the population
              this.availablePopulation = this.availablePopulation + this.production.allocated
  
              // Reset the current production
              this.production = false
            }
          }

          this.scene.events.emit(GameEvents.PRODUCTION_CHANGED, this)
        }
      }
    }
  }

  hasResourcesFor(technology)
  {
    return true
  }

  /**
   * 
   * @param {String} task 
   * @param {String} detail 
   * @param {Number} population 
   */
  modifyPopulation(task, detail, population)
  {
    let change = 0
    switch (task)
    {
      case 'research':
      {
        if (this.research)
        {
          if (population < 0)
          {
            change = Math.min(this.research.allocated, Math.abs(population))
            this.research.allocated = this.research.allocated - change
            this.availablePopulation = this.availablePopulation + change
          }
          else
          {
            change = Math.min(this.availablePopulation - 1, population)
            this.availablePopulation = this.availablePopulation - change
            this.research.allocated = this.research.allocated + change
          }

          this.scene.events.emit(GameEvents.RESEARCH_CHANGED, this)
        }
        break
      }
      case 'production':
      {
        if (this.production)
        {
          if (population < 0)
          {
            change = Math.min(this.production.allocated, Math.abs(population))
            this.production.allocated = this.production.allocated - change
            this.availablePopulation = this.availablePopulation + change
          }
          else
          {
            change = Math.min(this.availablePopulation - 1, population)
            this.availablePopulation = this.availablePopulation - change
            this.production.allocated = this.production.allocated + change
          }

          this.scene.events.emit(GameEvents.PRODUCTION_CHANGED, this)
        }
        break
      }
      case 'production_runs':
      {
        if (this.production)
        {
          this.production.runs = this.production.runs + population

          this.scene.events.emit(GameEvents.PRODUCTION_CHANGED, this)
        }
        break
      }
      case 'building':
      {
        const construction = this.building.find(item => item.name === detail)
        if (construction == null)
        {
          console.warn(`Failed to find construction of ${detail}`)
        }
        else
        {
          if (population < 0)
          {
            change = Math.min(construction.builders, Math.abs(population))
            construction.builders = construction.builders - change
            this.availablePopulation = this.availablePopulation + change
          }
          else
          {
            change = Math.min(this.availablePopulation, population)
            this.availablePopulation = this.availablePopulation - change
            construction.builders = construction.builders + change
          }

          this.scene.events.emit(GameEvents.CONSTRUCTION_CHANGED, this)
        }
        break
      }
      case 'mining':
      {
        const resource = this.resources.find(item => item.name === detail)
        if (resource == null)
        {
          console.warn(`Failed to find resource ${detail}`)
        }
        else
        {
          if (population < 0)
          {
            change = Math.min(resource.miners, Math.abs(population))
            resource.miners = resource.miners - change
            this.availablePopulation = this.availablePopulation + change
          }
          else
          {
            change = Math.min(this.availablePopulation, population)
            this.availablePopulation = this.availablePopulation - change
            resource.miners = resource.miners + change
          }

          this.scene.events.emit(GameEvents.MINING_CHANGED, this)
        }
        break
      }
    }
  }

  beginResearch(technology)
  {
    const tech = this.technologies[technology]
    if (tech)
    {
      this.research = {
        allocated: 0,
        name: technology,
        started: 0,
        duration: tech.researchDuration,
        remainingDuration: tech.researchDuration,
      }

      this.scene.events.emit(GameEvents.RESEARCH_CHANGED, this)
    }
  }

  beginProduction(technology)
  {
    const tech = this.technologies[technology]
    if (tech)
    {
      this.production = {
        allocated: 0,
        runs: 1,
        name: technology,
        started: 0,
        duration: tech.productionDuration,
        remainingDuration: tech.productionDuration,
      }

      this.scene.events.emit(GameEvents.PRODUCTION_CHANGED, this)
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

    this.tickTimer = 0
    this.tickCount = 0
    this.tickSpeed = 1000 // 1s Normal speed
  }

  tick(time, delta)
  {
    this.tickTimer += delta
    if (this.tickTimer > this.tickSpeed)
    {
      this.tickTimer = 0
      this.tickCount++

      Object.values(this.sectors).forEach(sector => sector.tick(time, delta))
    }
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
        this.addSector(index, getKeyForSector(index, island.map), 1)
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

  allocatePopulation(index, task, detail, population = 1)
  {
    const sector = this.sectors[index]
    sector.modifyPopulation(task, detail, population)
    this.scene.events.emit(GameEvents.POPULATION_ALLOCATION_CHANGED, sector)
  }

  deallocatePopulation(index, task, detail, population = 1)
  {
    const sector = this.sectors[index]
    sector.modifyPopulation(task, detail, -population)
    this.scene.events.emit(GameEvents.POPULATION_ALLOCATION_CHANGED, sector)
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