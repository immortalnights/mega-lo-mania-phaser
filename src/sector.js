import Phaser from 'phaser'
import Building from './building'
import { GameEvents } from './defines'
import sectorConfig from './assets/sectorconfig.json'


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
    this.add(land)

    this.features = new Phaser.GameObjects.Group(scene)
    this.buildings = new Phaser.GameObjects.Group(scene)
    this.armies = new Phaser.GameObjects.Group(scene)

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
      defenders.forEach(defender => {
        b.addDefender(defender)
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
      const b = this.buildings.getChildren().find(building => {
        return building.getData('type') === type
      })

      if (b)
      {
        b.destroy()
      }
    }
  }

  onAdvanceTechnologyLevel()
  {

  }

  onAddArmy(sector, team) 
  {
    if (this.index === sector)
    {

    }
  }

  onRemoveArmy(sector, team) 
  {
    if (this.index === sector)
    {

    }
  }
}