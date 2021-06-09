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

    this.cameras.main.setBackgroundColor('#222222')

    this.data.set('activeTeam', null)

    this.armyInHand = new Army(this)
    this.armyInHand.setActive(false)
    this.armyInHand.name = 'ArmyInHand'

    this.armies = {}
    const shields = []
    const counters = []

    const radius = 160
    const area = this.add.rectangle(width - radius - 40, radius + 40, radius * 2, radius * 2)
    area.setStrokeStyle(1, 0xddddff, 1)
    area.setFillStyle(0x004400, 1)
    area.setInteractive()
    area.on(Phaser.Input.Events.POINTER_DOWN, () => {
      this.deplyInHandArmy(this.data.get('activeTeam'))
    })

    this.flyingUnitSpawn = this.add.line(width + 25, height + 25, 0, 100, 100, 0, 0xddddff, 1)

    // This isn't nice, but it works...
    const zone = Phaser.Geom.Rectangle.Clone(area.geom)
    zone.x = area.x - 10
    zone.y = area.y - 10
    zone.x -= radius
    zone.y -= radius

    // Create icons
    const technologies = this.game.cache.json.get('technologies')

    const offenseTechnologies = technologies.filter(technology => technology.category === 'offense' && technology.id != 'nuke')
    const defenseTechnologies = technologies.filter(technology => technology.category === 'defense')

    const spacing = 28
    const yOffset = 40
    const xOffset = 30

    const offensiveButtons = []
    offenseTechnologies.forEach((technology, index) => {
      const x = xOffset + ((index % 2) * spacing)
      const y = yOffset + 40 + (Math.floor(index / 2) * spacing)
      const vc = this.add.existing(new ValueControl(this, x, y, technology.blueprintIcon, 0))
      vc.name = technology.id
      vc.on(UserEvents.VALUE_CHANGE, inc => {
        this.armyInHand.deply({ [technology.id]: inc })
      })

      offensiveButtons.push(vc)
    })

    const defensiveButtons = []
    defenseTechnologies.forEach((technology, index) => {
      const x = xOffset + ((index % 2) * spacing)
      const y = yOffset + 200 + (Math.floor(index / 2) * (spacing - 8))
      const sprite = this.add.sprite(x, y, 'mlm_icons', technology.blueprintIcon)
      sprite.name = technology.id
      sprite.setInteractive()
      sprite.on(Phaser.Input.Events.POINTER_DOWN, () => {
        
      })

      defensiveButtons.push(sprite)
    })

    this.armyInHand.on(Phaser.Data.Events.CHANGE_DATA, (obj, name, val, prev  ) => {
      console.log(obj.name, name, val, prev)

      const vc = offensiveButtons.find(vc => vc.name === name)
      vc.setValue(val)
    })
    this.armyInHand.on(Phaser.Data.Events.REMOVE_DATA, (obj, name, val, prev  ) => {
      console.log(obj.name, name, val, prev)

      const vc = offensiveButtons.find(vc => vc.name === name)
      vc.setValue(val)
    })

    const COLORS = {
      [Teams.RED]: '#ff0000',
      [Teams.YELLOW]: '#ffff00',
      [Teams.GREEN]: '#00ff00',
      [Teams.BLUE]: '#0000ff',
    }

    const activeTeamText = this.add.text(area.x, area.y + radius, ``).setOrigin(0.5, 0)
    const marker = this.add.image(0, 0, 'mlm_icons', 'sector_selected_icon')
    marker.setVisible(false)

    this.events.on('changedata-activeTeam', (obj, val, prev) => {
      activeTeamText.setText(`Deploy as ${val} team`)
      activeTeamText.setColor(COLORS[val])

      const shield = shields.find(item => item.name === val)
      marker.setPosition(shield.x, shield.y - 1).setVisible(true)
    })

    // const textXOffset = (width / 2) - 125
    Object.values(Teams).forEach((team, index) => {
      this.armies[team] = new Army(this, zone, team)
      this.armies[team].name = `${team}Army`

      const shield = this.add.image(xOffset / 1.5 + (index * 18), yOffset, 'mlm_icons', `team_shield_${team}`)
      shield.name = team
      shield.setInteractive()
      shield.on(Phaser.Input.Events.POINTER_DOWN, () => {
        this.data.set('activeTeam', team)
      })
      shields.push(shield)

      const armyCount = this.add.text(area.x - 95 + (index * 60), 20, '000', { color: COLORS[team] })
      armyCount.name = team
      counters.push(armyCount)
    })

    this.data.set('activeTeam', 'red')

    this.debugText = this.add.text(5, height - 16, '')
  }

  update()
  {
    const pointer = this.input.activePointer
    this.debugText.setText(`${pointer.x.toFixed(1)}, ${pointer.y.toFixed(1)}`)
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