import Phaser from 'phaser'
import { UserEvents } from '../defines'
import Header from './header'
import ConsumableValueControl from './consumablevaluecontrol'


export default class Repair extends Phaser.GameObjects.Container
{
  constructor(scene, x, y)
  {
    super(scene, x, y)

    this.name = 'repair'

    this.add(new Header(this.scene, 0, 0, 'repair_header', () => {
      this.parentContainer.emit('sectorcontrol:change_view', 'root')
    }))

    this.shields = []
    let shield = null

    shield = new ConsumableValueControl(this.scene, -25, 20, 'rock', undefined)
    this.shields.push(shield)

    shield = new ConsumableValueControl(this.scene, 0, 20, 'rock', undefined)
    this.shields.push(shield)

    shield = new ConsumableValueControl(this.scene, 25, 20, 'rock', undefined)
    this.shields.push(shield)

    shield = new ConsumableValueControl(this.scene, 0, 50, 'rock', undefined)
    this.shields.push(shield)

    this.shields.forEach(item => {
      this.add(item)
      item.setVisible(false)
      item.setToggle(true)

      item.on(UserEvents.VALUE_TOGGLE_UP, () => {
        this.scene.events.emit(UserEvents.ENABLE_REPAIR_MODE, amount, item.getData('technology'))
      })
    })
  }

  display(sector)
  {
    this.setVisible(true)

    let repairIndex = 0
    for (const [ key, technology ] of Object.entries(sector.technologies))
    {
      if (technology.category === 'repair' && technology.researched === true)
      {
        const icon = this.shields[repairIndex]

        icon.setData('technology', technology.id)

        icon.setIcon(technology.id)
        icon.setValueFromTechnology(sector, technology)
        icon.setVisible(true)

        repairIndex++
      }
    }

    for (let index = repairIndex; index < 4; index++)
    {
      this.shields[index].setVisible(false)
    }
  }
}
