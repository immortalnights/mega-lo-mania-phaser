import Phaser, { GameObjects } from 'phaser'
import Building from './building'
import { GameEvents, UserEvents } from './defines'
import sectorConfig from './assets/sectorconfig.json'
import Unit from './unit'


const featurePositions = {
  'f02': { x: 0, y: 81 }, // bottom
  'f00': { x: 95, y: 6 }, // right center
  'f01': { x: -89, y: 13 }, // left center
  'f03': { x: 5, y: 71 }, // bottom center
  'f05': { x: 102, y: 72 }, // right bottom
  'f06': { x: 99, y: 73 }, // bottom right
  'f07': { x: -87, y: -62 }, // top left soft corner
  'f08': { x: -86, y: -61 }, // left top
  'f09': { x: -87, y: -62 }, // top left
  'f10': { x: -93, y: 74 }, // bottom left
  'f11': { x: 81, y: -66 }, // top right soft corner
  'f12': { x: -93, y: 73 }, // bottom left soft corner
  'f13': { x: 99, y: 73 }, // bottom right soft corner
  'f14': { x: 81, y: -68 }, // top right
  'f15': { x: 82, y: -66 }, // right top
  'f16': { x: -1, y: -80 }, // top center
  'f17': { x: -105, y: 72 }, // left bottom
}


const tints = {
  "grass": 0x228822,
  "snow": 0xFFFFFF,
  "ash": 0xAAAAAA,
  "mud": 0xAA4400,
}


class Units extends Phaser.Physics.Arcade.Group
{
  constructor(scene, zone)
  {
    super(scene.physics.world, scene)

    this.data = new Phaser.Data.DataManager(this)
    this.zone = zone
  }

  setZone(zone)
  {
    this.zone = zone
  }

  spawnUnits()
  {
    const units = this.data.get('units')
    const team = this.data.get('team')

    
  }

  combine(army, spawn = true)
  {
    const { team, ...units } = army
    const newUnits = []

    for (const [key, value] of Object.entries(units))
    {
      for (let i = 0; i < value; i++)
      {
        const position = this.zone.getRandomPoint()
        const unit = new Unit(this.scene, position.x, position.y, {
          team,
          type: key,
          spawn
        })
        newUnits.push(unit)
        this.add(unit, true)

        unit.setCollideWorldBounds(true)
        unit.body.setBoundsRectangle(this.zone)
      }
    }

    // Phaser.Actions.RandomRectangle(newUnits, this.zone)
  }

  removeSome(army, died = false)
  {
    const { team, ...units } = army

    const toDestroy = this.getChildren().filter(u => u.getData('team') === team)

    toDestroy.forEach(u => u.destroy())
  }
}


export default class Sector extends Phaser.GameObjects.Container
{
  constructor(scene, x, y, options)
  {
    super(scene, x, y)

    this.setData('epoch', options.epoch)

    Object.defineProperties(this, {
      index: {
        get()
        {
          return this.getData('index')
        }
      },
    })

    // Slab image
    const land = new Phaser.GameObjects.Image(scene, 0, 0, 'mlm_slab')
    land.setTint(tints[options.style])
    land.setInteractive()
    land.on('pointerdown', (pointer, localX, localY, event) => {
      this.scene.events.emit(UserEvents.SECTOR_SELECT, pointer)
    })
    this.add(land)

    // this.unitZone = new Phaser.GameObjects.Rectangle(this.scene, 0, 0, 5, 5, 0, 0)
    // this.unitZone.setStrokeStyle(1, 0xAA2222, 1)
    // this.add(this.unitZone)

    this.features = new Phaser.GameObjects.Group(scene)
    this.buildings = new Phaser.GameObjects.Group(scene)
    this.units = new Units(scene, this.getBounds())

    // Add all feature images
    Object.keys(featurePositions).forEach(key => {
      const position = featurePositions[key]

      if (position.x || position.y)
      {
        const image = new Phaser.GameObjects.Image(scene, position.x, position.y, 'mlm_features', key)
        image.setData({ key })
        this.add(image)
        this.features.add(image)
        // console.debug(key, position.x, position.y)
      }
    })
    // Hide all features
    this.features.setVisible(false)

    // Handle view sector event
    scene.events.on(GameEvents.SECTOR_VIEW, this.onSectorSelected, this)
    scene.events.on(GameEvents.SECTOR_ADD_BUILDING, this.onAddBuilding, this)
    scene.events.on(GameEvents.SECTOR_REMOVE_BUILDING, this.onRemoveBuilding, this)
    scene.events.on(GameEvents.SECTOR_ADD_ARMY, this.onAddArmy, this)
    scene.events.on(GameEvents.SECTOR_REMOVE_ARMY, this.onRemoveArmy, this)
    scene.events.on(GameEvents.BUILDING_ADD_DEFENDER, this.onAddDefender, this)
    scene.events.on(GameEvents.BUILDING_REMOVE_DEFENDER, this.onRemoveDefender, this)
  }

  // Update features based on sector key
  renderFeatures(keys)
  {
    // Hide all the features
    this.features.setVisible(false)

    keys.forEach(k => {
      const feature = this.features.getChildren().find(f => {
        return f.getData('key') === 'f' + k
      })

      feature.setVisible(true)
    })
  }

  getBuilding(type)
  {
    return this.buildings.getChildren().find(building => {
      return building.getData('type') === type
    })
  }

  buildBuilding(type, team, defenders)
  {
    const position = this.getData('positions')[type]

    const b = new Building(this.scene, position.x, position.y, {
      type,
      team,
      epoch: this.getData('epoch')
    })

    if (defenders)
    {
      defenders.forEach((defender, index) => {
        if (defender)
        {
          b.addDefender(index, defender, false)
        }
      })
    }

    this.add(b)
    this.buildings.add(b)

    return b
  }

  /**
   * @param {integer} index Sector index
   * @param {string} key Sector key for features and building positions
   * @param {Object} buildings Building on sector
   * @param {Object} armies Armies on sector
   */
  onSectorSelected(index, key, buildings, armies)
  {
    this.setData('index', index)
    const config = sectorConfig['s' + key]
    // Remember where the buildings are positions for this sector
    this.setData({ positions: config.buildings })

    // temp
    if (config.unitZone == null)
    {
      config.unitZone = { "x": 0, "y": 0, "w": 50, "h": 50 }
    }

    if (this.unitZone)
    {
      this.unitZone.destroy()
    }

    this.unitZone = new Phaser.Geom.Rectangle(this.x + config.unitZone.x, this.y + config.unitZone.y, config.unitZone.w, config.unitZone.h)

    this.renderFeatures(config.features)

    // Destroy all buildings
    this.buildings.clear(true, true)

    for (const [type, value] of Object.entries(buildings))
    {
      if (value)
      {
        this.buildBuilding(type, value.team, value.defenders)
      }
    }

    // Destroy all units
    this.units.clear(true, true)
    this.units.setZone(this.unitZone)
    armies.forEach(army => this.units.combine(army, false))
  }

  onAddBuilding(sector, type, team, defenders)
  {
    if (this.index === sector)
    {
      this.buildBuilding(type, team, defenders)
    }
  }

  onRemoveBuilding(sector, type)
  {
    if (this.index === sector)
    {
      const b = this.getBuilding(type)
      if (b)
      {
        b.destroy()
      }
    }
  }

  onAdvanceTechnologyLevel()
  {

  }

  onAddDefender(sector, building, position, type)
  {
    if (this.index === sector)
    {
      const b = this.getBuilding(building)
      if (b)
      {
        b.addDefender(position, type)
      }
    }
  }

  onRemoveDefender(sector, building, position)
  {
    if (this.index === sector)
    {
      const b = this.getBuilding(building)
      if (b)
      {
        b.removeDefender(position)
      }
    }
  }

  onAddArmy(sector, team, units)
  {
    if (this.index === sector)
    {
      this.units.combine(units)
    }
  }

  onRemoveArmy(sector, team, units)
  {
    if (this.index === sector)
    {
      this.units.removeSome(units)
    }
  }
}