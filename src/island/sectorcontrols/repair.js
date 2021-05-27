import Phaser from 'phaser'
import { UserEvents } from '../../defines'
import Header from './header'
import ConsumableValueControl from '../../components/consumablevaluecontrol'


export default class Repair extends Phaser.GameObjects.Container
{
  constructor(scene, x, y)
  {
    super(scene, x, y)

    this.name = 'repair'

    this.add(new Header(this.scene, 0, 0, 'repair_header', () => {
      this.scene.events.emit(UserEvents.SECTOR_CONTROLS_VIEW_CHANGE, 'root')
    }))

    this.shields = []
    let shield = null

    shield = new ConsumableValueControl(this.scene, -25, 20, 'rock', undefined)
    this.shields.push(shield)

    shield = new ConsumableValueControl(this.scene, 0, 20, 'rock', undefined)
    this.shields.push(shield)

    shield = new ConsumableValueControl(this.scene, 25, 20, 'rock', undefined)
    this.shields.push(shield)

    shield = new ConsumableValueControl(this.scene, 0, 45, 'rock', undefined)
    this.shields.push(shield)

    this.shields.forEach(item => {
      this.add(item)
      item.setVisible(false)
      item.setToggle(true)

      item.on(UserEvents.VALUE_TOGGLE_UP, () => {
        this.scene.events.emit(UserEvents.ENABLE_REPAIR_MODE, amount, item.getData('technology'))
      })
    })

    let yOffset = 0
    this.buildings = {};
    [ 'castle', 'laboratory', 'mine', 'factory' ].forEach((building, index) => {
      yOffset = 64 + (16 * index)
      const icon = new Phaser.GameObjects.Image(this.scene, -30, yOffset, 'mlm_icons', `${building}_icon`)
      const health = new Phaser.GameObjects.Image(this.scene, -20, 0, 'mlm_icons', 'building_health_00')
      health.setOrigin(0, 0.5)

      this.buildings[building] = {
        icon,
        health,

        setVisible(b)
        {
          this.icon.setVisible(b)
          this.health.setVisible(b)
          return this
        },

        setY(y)
        {
          this.icon.y = y
          this.health.y = y
          return this
        },

        setValue(val)
        {
          const pc = 100 - val
          const frameIndex = Math.floor((pc * 2) / 10)
          health.setFrame(`building_health_${frameIndex.toFixed(0).padStart(2, '0')}`)
          return this
        }
      }
    })

    Object.values(this.buildings).forEach(item => {
      this.add(item.icon)
      this.add(item.health)
    })
  }

  display(sector)
  {
    this.setVisible(true)

    let repairIndex = 0
    for (let [ techKey, technology ] of Object.entries(sector.technologies))
    {
      if (technology.category === 'repair' && technology.researched === true)
      {
        const icon = this.shields[repairIndex]

        icon.setData('technology', technology.id)

        icon.setIcon(technology['blueprintIcon'])
        icon.setValueFromTechnology(sector, technology)
        icon.setVisible(true)

        repairIndex++
      }
    }

    for (let index = repairIndex; index < 4; index++)
    {
      this.shields[index].setVisible(false)
    }

    let yOffset = 0
    Object.keys(sector.buildings).forEach((key, index) => {
      const building = sector.buildings[key]

      if (building !== false)
      {
        yOffset = 64 + (16 * index)
        this.buildings[key].setVisible(true).setY(yOffset).setValue(100)
      }
      else
      {
        this.buildings[key].setVisible(false)
      }
    })
  }
}
