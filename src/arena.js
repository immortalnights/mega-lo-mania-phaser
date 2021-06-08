import Phaser from 'phaser'
import Unit, { FlyingUnit, NuclearMissile } from './island/unit'
import ValueControl from './components/valuecontrol'
import { Teams, UserEvents } from './defines'
import GroundUnit from './island/unit'

// Render no more then this amount of sprites
const ARMY_SPRITE_LIMIT = 250

class Army extends Phaser.Physics.Arcade.Group
{
  constructor(scene, zone, team)
  {
    super(scene.physics.world, scene, undefined, {})

    if (zone == null)
    {
      zone = new Phaser.GameObjects.Zone(scene, 50, 50, 75, 75)
    }

    this.zone = zone
    this.team = team

    this.data = new Phaser.Data.DataManager(this)
  }

  size()
  {
    let unitCount = 0
    this.data.each((obj, key, val) => {
      unitCount += val
    })
    return unitCount
  }

  destroy()
  {
    this.data.destroy()
    this.zone.destroy()
  }

  /**
   * 
   * @param {Object} units
   * @returns {Object} units that have not been deployed (merged)
   */
  deply(units)
  {
    const remaining = {}
    for (const [key, val] of Object.entries(units))
    {
      if (val)
      {
        if (this.data.has(key) === false)
        {
          this.data.set(key, 0)
        }

        console.log(`Add ${val} ${key}`)
        const res = Phaser.Math.Clamp(this.data.get(key) + val, 0, 999)
        this.data.set(key, res)
      }
    }

    if (this.active)
    {
      this.updateRenderedUnits()
    }

    return remaining
  }

  /**
   * 
   * @param {Army} otherArmy 
   */
  merge(otherArmy)
  {
    const units = otherArmy.toJSON()
    const remaining = this.deply(units)
    // remove all units from the other army
    otherArmy.clear()
    // redply remanining units to the other army
    otherArmy.deply(remaining)
  }

  clear()
  {
    // remove all data (reset does not trigger events)
    this.data.each((obj, key, val, ...rest) => {
      this.data.set(key, 0)
    })

    // remove all sprites
    super.clear(true, true)
  }

  toJSON()
  {
    return this.data.getAll()
  }

  updateRenderedUnits()
  {
    // Count
    const total = this.size()
    console.debug(`${this.name} ${total}`)

    // Calculate percentage of each unit type
    const units = this.data.getAll()
    console.log("Units", units)

    const percentages = {}
    for (const [key, val] of Object.entries(units))
    {
      percentages[key] = (val / total)
    }
    console.log("Percentages", percentages)

    // actual unit counts
    const unitCount = ARMY_SPRITE_LIMIT
    const sprites = {}
    for (const [key, val] of Object.entries(units))
    {
      const amount = Math.min(val, Math.floor(unitCount * percentages[key]))
      sprites[key] = amount
    }
    console.log("Sprites", sprites)
    console.log("Sprite Count", unitCount - unitCount)

    const currentSprites = {}
    this.getChildren().forEach(child => {
      const type = child.type
      if (currentSprites[type] == null)
      {
        currentSprites[type] = 0
      }

      currentSprites[type] += 1
    })
    console.log("Current Sprites", currentSprites)

    for (const [key, val] of Object.entries(sprites))
    {
      const diff = val - (currentSprites[key] || 0)

      console.debug(`Need ${diff} ${key}`)
      if (diff > 0)
      {
        // add some sprites
        for (let i = 0; i < diff; i++)
        {
          const pos = this.zone.getRandomPoint()
          const u = this.add(this.spawn(key, this.team, true), true)
        }
      }
      else if (diff < 0)
      {
        // kill some sprites
      }
    }
  }

  /**
   * 
   * @param {String} type 
   * @param {String} team 
   * @param {Boolean} spawn true if the unit should play the spawn animation
   */
  spawn(type, team, spawn=false)
  {
    let unit = undefined

    switch (type)
    {
      case 'stone':
      case 'rock':
      case 'sling':
      case 'pike':
      case 'longbow':
      case 'catapult':
      case 'cannon':
      {
        // Spawn at a random location within the movement zone
        const pos = this.zone.getRandomPoint()
        unit = new GroundUnit(this.scene, pos.x, pos.y, {
          type,
          team,
          spawn
        })

        if (this.zone instanceof Phaser.Geom.Rectangle)
        {
          unit.once(Phaser.GameObjects.Events.ADDED_TO_SCENE, (obj) => {
            obj.setCollideWorldBounds(true)
            obj.body.setBoundsRectangle(this.zone)
          })
        }
        break
      }
      case 'biplane':
      case 'jet':
      case 'flyingsaucer':
      {
        // Spawn at a random location off screen
        const pos = { x: 0, y: 0 }
        unit = new FlyingUnit(this.scene, pos.x, pos.y, {
          type,
          team
        })
        const line = Phaser.Geom.Line.Clone(this.scene.flyingUnitSpawn.geom)
        line.x = this.scene.flyingUnitSpawn.x
        line.y = this.scene.flyingUnitSpawn.y
        Phaser.Actions.RandomLine([ unit ], line)
        unit.x += line.x
        unit.y += line.y
        console.log(unit.x, unit.y)
        break
      }
      case 'nuke':
      {
        // Spawn at the sector castle location
        const canvas = this.scene.sys.game.canvas
        const pos = { x: canvas.width / 2, y: canvas.height / 2 }
        unit = new NuclearMissile(this.scene, pos.x, pos.y, {
          type,
          team
        })
        break
      }
      default:
      {
        console.error(`Unhandled unit type '${type}'`)
        break
      }
    }

    return unit
  }
}


export default class Arena extends Phaser.Scene
{
  constructor(config)
  {
    super({
      ...config,
      key: 'arena',
      physics: {
        default: 'arcade',
        arcade: {
          debug: false
        }
      },
    })
  }

  init(options)
  {
    console.log("Arena.init", options)
  }

  preload()
  {
    console.log("Arena.preload")
  }

  create()
  {
    console.log("Arena.create")
    const { width, height } = this.sys.game.canvas

    this.cameras.main.setBackgroundColor('#444444')

    this.armyInHand = new Army(this)
    this.armyInHand.setActive(false)
    this.armyInHand.name = 'ArmyInHand'
    
    this.armies = {}
    
    const yOffset = height - 40
    
    const radius = 120
    const area = this.add.rectangle(width / 2, radius + 20, radius * 2, radius * 2)
    area.setStrokeStyle(1, 0xddddff, 1)

    this.flyingUnitSpawn = this.add.line(width + 25, height + 25, 0, 100, 100, 0, 0xddddff, 1)

    // This isn't nice, but it works...
    const zone = Phaser.Geom.Rectangle.Clone(area.geom)
    zone.x = area.x - 10
    zone.y = area.y - 10
    zone.x -= radius
    zone.y -= radius

    // Create icons
    const technologies = this.game.cache.json.get('technologies')

    const offenseTechnologies = technologies.filter(technology => technology.category === 'offense')
    const xOffset = (width / 2) - ((offenseTechnologies.length * 34) / 2)
    console.log(offenseTechnologies.length, xOffset)

    const technologyButtons = []
    offenseTechnologies.forEach((technology, index) => {
      const vc = this.add.existing(new ValueControl(this, xOffset + (index * 34), yOffset, technology.blueprintIcon, 0))
      vc.name = technology.id
      vc.on(UserEvents.VALUE_CHANGE, inc => {
        this.armyInHand.deply({ [technology.id]: inc })
      })

      technologyButtons.push(vc)
    })

    this.armyInHand.on(Phaser.Data.Events.CHANGE_DATA, (obj, name, val, prev  ) => {
      console.log(obj.name, name, val, prev)

      const vc = technologyButtons.find(vc => vc.name === name)
      vc.setValue(val)
    })
    this.armyInHand.on(Phaser.Data.Events.REMOVE_DATA, (obj, name, val, prev  ) => {
      console.log(obj.name, name, val, prev)

      const vc = technologyButtons.find(vc => vc.name === name)
      vc.setValue(val)
    })

    const COLORS = {
      [Teams.RED]: '#ff0000',
      [Teams.YELLOW]: '#ffff00',
      [Teams.GREEN]: '#00ff00',
      [Teams.BLUE]: '#0000ff',
    }

    const textXOffset = (width / 2) - 125
    Object.values(Teams).forEach((team, index) => {
      // Create deployed army
      this.armies[team] = new Army(this, zone, team)
      this.armies[team].name = `${team}Army`

      const color = COLORS[team]

      const deplyButton = this.add.text(textXOffset + (index * 75), yOffset + 30, "Deploy", { color: color })
      deplyButton.setOrigin(0.5, 1)
      deplyButton.setInteractive()
      deplyButton.on(Phaser.Input.Events.POINTER_DOWN, () => {
        this.deplyInHandArmy(team)
      })
    })

    // console.log(deplyButton.x, deplyButton.y)
  }

  deplyInHandArmy(team)
  {
    this.armies[team].merge(this.armyInHand)
  }

  onTechnologyClicked(technology)
  {
    console.log(technology)
  }
}