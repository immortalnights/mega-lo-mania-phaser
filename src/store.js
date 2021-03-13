import Phaser from 'phaser'
import { Teams, GameEvents, BuildingTypes } from './defines.js'
import Islands from './assets/islands.json'


// Cloned for new armies
const baseArmy = {
  rock: 0,
  sling: 0,
  spear: 0,
  bowAndArrow: 0,
  catapult: 0,
  cannon: 0,
  biplane: 0,
  jet: 0,
  saucer: 0,
  trooper: 0,
}


// TODO maybe sector manager rather then specific for buildings?
class BuildingManager
{
  constructor()
  {
    this.data = {
      castle: null,
      mine: null,
      factory: null,
      laboratory: null,
    }
  }

  map()
  {
    return this.data
  }

  // get building by type
  get(building)
  {
    return this.data[building]
  }

  has(building)
  {
    return !!this.get(building)
  }

  build(building, team)
  {
    let defenderCount
    switch (building)
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

    this.data[building] = {
      team,
      defenders: Array(defenderCount)
    }
  }

  remove(building)
  {
    this.data[building] = null
  }
}

export default class Store extends Phaser.Events.EventEmitter
{
  constructor(scene)
  {
    super()

    this.scene = scene

    this.sectors = {}
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

  buildBuilding(sector, building, team)
  {
    const sec = this.sectors[sector]
    console.assert(sec.buildings.has(building) === false, `Attempted to build another ${building} in sector ${sector}`)
    sec.buildings.build(building, team)

    this.scene.events.emit(GameEvents.SECTOR_ADD_BUILDING, sector, building, team)
  }

  destroyBuilding(sector, building)
  {
    const sec = this.sectors[sector]
    console.assert(sec.buildings.has(building) === true, `Attempted to destroy missing ${building} in sector ${sector}`)

    this.scene.events.emit(GameEvents.SECTOR_REMOVE_BUILDING, sector, building)

    sec.buildings.remove(building)
  }

  hasDefender(sector, building, position)
  {
    const sec = this.sectors[sector]
    const b = sec.buildings.get(building)
    return !!b.defenders[position]
  }

  addDefender(sector, building, position, type)
  {
    console.log("add defender", sector, building, position, type)
    const sec = this.sectors[sector]
    const b = sec.buildings.get(building)

    b.defenders[position] = type
    this.scene.events.emit(GameEvents.BUILDING_ADD_DEFENDER, sector, building, position, type)
  }

  removeDefender(sector, building, position)
  {
    console.log("remove defender", sector, building, position)

    const sec = this.sectors[sector]
    const b = sec.buildings.get(building)
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
    const castle = sector.buildings.get('castle')

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
        army = { team: ownerTeam, ...baseArmy }
        destination.armies.push(army)
        isNew = true
      }

      army = this.combineArmies(units, army)

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
          destinationArmy = { team: team, ...baseArmy }
          destination.armies.push(destinationArmy)
        }

        // Merge armies
        destinationArmy = this.combineArmies(sourceArmy, destinationArmy)

        this.scene.events.emit(GameEvents.SECTOR_REMOVE_ARMY, sectorIndex, team)
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

  combineArmies(a, b)
  {
    const ignoredKeys = ['team']
    const d = { ...a }

    for (const [key, value] of Object.entries(b))
    {
      if (ignoredKeys.includes(key) === false)
      {
        d[key] += value
      }
    }

    return d
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
        this.sectors[index] = {
          buildings: new BuildingManager(),
          armies: [],
          nuked: false
        }
      }
    })
  }
}