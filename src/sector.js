import Phaser from 'phaser'
import Building from './building'
import { GameEvents } from './defines'
import sectorConfig from './assets/sectorconfig.json'

// slab = 224 x 173

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

    // Slab image
    const land = new Phaser.GameObjects.Image(scene, 0, 0, 'mlm_slab')
    land.setTint(tints[options.style])
    this.add(land)

    // Features
    const features = new Phaser.GameObjects.Group(scene)
    Object.keys(featurePositions).forEach(key => {
      const position = featurePositions[key]

      if (position.x || position.y)
      {
        const image = new Phaser.GameObjects.Image(scene, position.x, position.y, 'mlm_features', key)
        image.setData({ key })
        this.add(image)
        features.add(image)
        // console.debug(key, position.x, position.y)
      }
    })
    features.setVisible(false)

    let config = null

    // Update features based on sector key
    const displaySectorByKey = () => {
      features.setVisible(false)
      const keys = config.features
      keys.forEach(k => {
        const feature = features.getChildren().find(f => {
          return f.getData('key') === 'f' + k
        })

        feature.setVisible(true)
      })
    }

    this.buildings = {
      castle: null,
      mine: null,
      factory: null,
      laboratory: null
    }

    const buildBuilding = (type, team, defenders) => {
      const position = getPosition(type)

      const b = new Building(this.scene, position.x, position.y, {
        type,
        team,
        epoch: this.getData('epoch')
      })
      this.add(b, true)

      return b
    }

    // Handle view sector event
    scene.events.on(GameEvents.SECTOR_VIEW, (index, key, buildings, armies) => {
      config = sectorConfig['s' + key]
      displaySectorByKey()

      for (const [k, v] of Object.entries(this.buildings))
      {
        if (v)
        {
          v.destroy()
          this.buildings[k] = null
        }
      }

      for (const [k, v] of Object.entries(buildings))
      {
        if (v)
        {
          this.buildings[k] = buildBuilding(k, v.team, v.defenders)
        }
      }
    })

    const getPosition = (type) => {
      return config.buildings[type]
    }

    this.scene.events.on(GameEvents.SECTOR_ADD_CASTLE, (sector, team) => {
      console.assert(this.buildings.castle === null, "Attempted to build castle on sector which already contains one")
      this.buildings.castle = buildBuilding('castle', team)
    })
    this.scene.events.on(GameEvents.SECTOR_REMOVE_CASTLE, (sector, team) => {
      console.assert(this.buildings.castle, "Attempted to destroy castle on a sector that does not have one")

      if (this.buildings.castle)
      {
        this.buildings.castle.destroy()
        this.buildings.castle = null
      }
    })
    this.scene.events.on(GameEvents.SECTOR_ADD_ARMY, (sector, team) => {
    })
    this.scene.events.on(GameEvents.SECTOR_REMOVE_ARMY, (sector, team) => {
    })
  }
}