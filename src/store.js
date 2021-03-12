import Phaser from 'phaser'
import { Teams, GameEvents, BuildingTypes } from './defines.js'
import Islands from './assets/islands.json'

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

    this.scene.events.emit(GameEvents.BUILDING_REMOVE_DEFENDER, sector, building, position)
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