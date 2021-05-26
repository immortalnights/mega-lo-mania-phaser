import { GameEvents, BuildingTypes, unitSet } from '/src/defines.js'
import { getKeyForSector } from '/src/utilities'
import Sector from './sector'

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


export default class Store
{
  constructor(scene, initData)
  {
    this.state = 'setup'
    // Queues events during setup or load until the scene is ready
    this.queue = []
    this.scene = scene

    this.island = undefined
    this.players = undefined
    this.sectors = undefined

    this.tickTimer = 0
    this.tickCount = 0
    this.tickSpeed = 1000 // 1s Normal speed

    this.setup(initData)
  }

  emit(name, ...args)
  {
    if (this.state === 'setup')
    {
      this.queue.push([ name, args ])
    }
    else
    {
      this.scene.scene.emit(name, ...args)
    }
  }

  start()
  {
    console.debug(`Starting with ${this.queue.length} queued events`)
    while (this.queue.length > 0)
    {
      const item = this.queue.pop()
      this.scene.events.emit(item[0], ...item[1])
    }

    this.state = 'running'
  }

  setup(initData)
  {
    console.assert(initData, `Missing store init data`)

    this.sectors = {}
    this.players = []

    if (initData.slot)
    {
      // Load
    }
    else if (initData.setup)
    {
      const { island, players, sectors, localPlayerTeam } = initData.setup
  
      this.island = island

      this.localPlayerTeam = localPlayerTeam
      // FIXME
      this.scene.data.set('team', localPlayerTeam)

      // Initialize sectors
      island.map.forEach((value, index) => {
        if (value)
        {
          const key = getKeyForSector(index, island.map)
          const resources = island.resources[index]

          this.addSector(index, key).setup(island.epoch, resources)
        }
      })

      sectors.forEach(s => {
        this.players.push({ team: s.team, allies: [] })

        const sector = this.sectors[s.index]
        sector.claim(s.team, s.population)
      })
    }
  }

  // Allows Sandbox to create sectors
  addSector(index, key)
  {
    this.sectors[index] = new Sector(this, index, key, this.island.name)
    return this.sectors[index]
  }

  loadGame(slot)
  {
    if (slot === undefined)
    {
      slot = this.saveGameSlot
    }

    try
    {
      const data = window.localStorage.getItem(`mlm_savegame_${slot}`)
      if (data != null)
      {
        console.debug(`Loaded game data from sot ${slot}`)
        this.loadGameData(JSON.parse(data))
      }
    }
    catch (error)
    {
      console.error(`Failed to load game from slot '${slot}'`)
    }
  }

  loadGameData(data)
  {
    // this.island = data.island

    this.island = data.island.name
    this.sectors = {}
    this.players = []

    // Initialize sectors
    island.map.forEach((value, index) => {
      if (value)
      {
        const key = getKeyForSector(index, island.map)
        this.sectors[index] = new Sector(this, index, key, island.epoch)
        this.sectors[index]
      }
    })

    // Get from init data!
    this.data.set('team', Teams.RED)

    data.sectors.forEach(s => {
      this.buildBuilding(s.index, BuildingTypes.CASTLE, s.team)
    })
  }

  saveGame(slot)
  {
    try
    {
      const data = this.saveGameData()
      window.localStorage.setItem(`mlm_savegame_${slot}`, JSON.stringify(data))
      console.debug(`Saved game data to slow ${slot}`)
    }
    catch (error)
    {
      console.error(`Failed to load game from slot '${slot}'`)
    }
  }

  saveGameData()
  {
    const data = {
      island: this.island,
      players: this.players,
      sectors: this.sectors
    }
    return data
  }

  tick(time, delta)
  {
    this.tickTimer += delta
    if (this.tickTimer > this.tickSpeed)
    {
      Object.values(this.sectors).forEach(sector => sector.tick(this.tickTimer, this.tickCount))

      this.tickTimer = 0
      this.tickCount++
    }
  }

  setIsland(name)
  {
    // const island = Islands.find(i => i.name === name)
    // console.assert(island != null, `Island '${name}' is invalid`)
    // this.island = { ...island }

    // this.sectors = {}
    // this.island.map.forEach((value, index) => {
    //   if (value)
    //   {
    //     this.addSector(index, getKeyForSector(index, island.map), 1)
    //   }
    // })
  }

  // setPlayers(teams)
  // {
  //   teams.forEach(team => {
  //     this.players.push({
  //       team,
  //       allies: []
  //     })
  //   })
  // }

  changeMiners(index, value, resource)
  {
    const sector = this.sectors[index]
    sector.modifyPopulation('mining', resource, value)
    this.emit(GameEvents.POPULATION_ALLOCATION_CHANGED, sector)
  }

  changeResearchers(index, value)
  {
    const sector = this.sectors[index]
    sector.modifyPopulation('research', undefined, value)
    this.emit(GameEvents.POPULATION_ALLOCATION_CHANGED, sector)
  }

  changeBuilders(index, value, building)
  {
    const sector = this.sectors[index]
    sector.modifyPopulation('building', building, value)
    this.emit(GameEvents.POPULATION_ALLOCATION_CHANGED, sector)
  }

  changeManufacturers(index, value)
  {
    const sector = this.sectors[index]
    sector.modifyPopulation('production', undefined, value)
    this.emit(GameEvents.POPULATION_ALLOCATION_CHANGED, sector)
  }

  changeProductionRuns(index, value)
  {
    const sector = this.sectors[index]
    sector.changeProductionRuns(value)
    this.emit(GameEvents.POPULATION_ALLOCATION_CHANGED, sector)
  }

  allocatePopulation(index, task, detail, population = 1)
  {
    const sector = this.sectors[index]
    sector.modifyPopulation(task, detail, population)
    this.emit(GameEvents.POPULATION_ALLOCATION_CHANGED, sector)
  }

  deallocatePopulation(index, task, detail, population = 1)
  {
    const sector = this.sectors[index]
    sector.modifyPopulation(task, detail, -population)
    this.emit(GameEvents.POPULATION_ALLOCATION_CHANGED, sector)
  }

  addToArmy(index, quantity, type)
  {
    const sector = this.sectors[index]
    if (quantity < 0)
    {
      sector.removeUnitsFromArmy(Math.abs(quantity), type)
    }
    else
    {
      sector.addUnitsToArmy(quantity, type)
    }
  }

  discardPendingArmy(index)
  {
    const sector = this.sectors[index]
    sector.disbandPendingArmy()
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

    this.emit(GameEvents.TEAMS_CHANGED, teams, localPlayerAllied)
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

    this.emit(GameEvents.SECTOR_ADD_BUILDING, sector, type, team)
  }

  destroyBuilding(sector, type)
  {
    const sec = this.sectors[sector]
    console.assert(sec.buildings[type] !== false, `Attempted to destroy missing ${type} in sector ${sector}`)

    sec.buildings[type] = false

    this.emit(GameEvents.SECTOR_REMOVE_BUILDING, sector, type)
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
    this.emit(GameEvents.BUILDING_ADD_DEFENDER, sector, building, position, type)
  }

  removeDefender(sector, building, position)
  {
    console.log("remove defender", sector, building, position)

    const sec = this.sectors[sector]
    const b = sec.buildings[building]
    b.defenders[position] = undefined

    this.emit(GameEvents.BUILDING_REMOVE_DEFENDER, sector, building, position)
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
        this.emit(GameEvents.SECTOR_ADD_ARMY, sectorIndex, ownerTeam, army)
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

        this.emit(GameEvents.SECTOR_REMOVE_ARMY, sectorIndex, team, sourceArmy)
        this.emit(GameEvents.SECTOR_ADD_ARMY, destinationIndex, team, destinationArmy)
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