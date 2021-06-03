import Phaser from 'phaser'
import ValueControl from './components/valuecontrol'
import { Teams, UserEvents } from './defines'

// Render no more then this amount of sprites
const ARMY_SPRITE_LIMIT = 250

class Army extends Phaser.GameObjects.Group
{
  constructor(scene, zone)
  {
    super(scene, undefined, {})

    if (zone == null)
    {
      zone = new Phaser.GameObjects.Zone(scene, 50, 50, 75, 75)
    }

    this.zone = zone

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
      if (currentSprites[child.name] == null)
      {
        currentSprites[child.name] = 0
      }

      currentSprites[child.name] += 1
    })
    console.log("Current Sprites", currentSprites)

    for (const [key, val] of Object.entries(sprites))
    {
      const diff = val - (currentSprites[key] || 0)

      console.debug(`Need ${diff} ${key}`)
      if (diff > 0)
      {
        // add some sprites
        this.add(new Phaser.GameObjects.Sprite(this.scene, 150, 150, 'mlm_units', `${key}_down_00`), true)
      }
      else if (diff < 0)
      {
        // kill some sprites
      }
    }
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

    this.armyInHand = new Army(this)
    this.armyInHand.setActive(false)
    this.armyInHand.name = 'ArmyInHand'

    this.armies = {}
    
    const yOffset = 260
    
    const area = this.add.arc(width / 2, height / 2 - 25, 120)
    area.setStrokeStyle(1, 0xddddff, 1)
    const zone = null // area.geom()

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
      this.armies[team] = new Army(this, zone)
      this.armies[team].name = `${team}Army`

      const color = COLORS[team]

      const deplyButton = this.add.text(textXOffset + (index * 75), yOffset + 30, "Deply", { color: color })
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