import Phaser from 'phaser'
import { GameEvents } from './defines.js'
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
    this.data[building] = {
      team,
      defenders: []
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

    // this.scene.events.emit(GameEvents.SECTOR_BUILD_BUILDING, sector, building, team)
    this.scene.events.emit(GameEvents.SECTOR_ADD_CASTLE, sector, team)
  }

  destroyBuilding(sector, building)
  {
    const sec = this.sectors[sector]
    console.assert(sec.buildings.has(building) === true, `Attempted to destroy missing ${building} in sector ${sector}`)

    // this.scene.events.emit(GameEvents.SECTOR_DESTROY_BUILDING, sector, building)
    this.scene.events.emit(GameEvents.SECTOR_REMOVE_CASTLE, sector)

    sec.buildings.remove(building)
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