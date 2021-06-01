import Phaser from 'phaser'
import Header from './header'
import ValueControl from '../../components/valuecontrol'
import { UserEvents } from '../../defines'
import Clock from '../../components/clock'


export default class Construction extends Phaser.GameObjects.Container
{
  constructor(scene, x, y)
  {
    super(scene, x, y)

    this.name = 'construction'

    this.header = new Header(this.scene, 0, 0, 'construction_header', () => {
      this.scene.events.emit(UserEvents.SECTOR_CONTROLS_VIEW_CHANGE, 'root')
    })

    this.add(this.header)

    const buildings = [ 'mine', 'factory', 'laboratory' ]
    this.buildings = buildings.map((name, index) => {
      const yOffset = 18 + (26 * index)

      const left = new Phaser.GameObjects.Image(this.scene, -29, 0, 'mlm_icons', `construct_${name}`)
      const multiply = new Phaser.GameObjects.Image(this.scene, -15, 0 - 1, 'mlm_icons', 'multiply_icon')
      const center = new ValueControl(this.scene, -2, 0 + 2, 'mlm_icons', 0)
      const equal = new Phaser.GameObjects.Image(this.scene, 10, 0 - 1, 'mlm_icons', 'equal_icon')
      const right = new Clock(this.scene, 24, 0)

      center.on(UserEvents.VALUE_CHANGE, inc => {
        this.scene.events.emit(UserEvents.CHANGE_BUILDERS, inc, center.name)
      })

      const row = new Phaser.GameObjects.Container(this.scene, 0, yOffset, [
        left,
        multiply,
        center,
        equal,
        right
      ])
      row.name = name

      // Make referencing parts of the row easier
      row.populationControl = center
      row.clock = right

      this.add(row)
      return row
    });
  }

  refresh(sector)
  {
    this.display(sector)
  }

  display(sector)
  {
    this.setVisible(true)

    this.buildings.forEach(row => row.setVisible(false))

    sector.construction.forEach((construction, index) => {
      const yOffset = 18 + (26 * index)
      const row = this.buildings.find(item => item.name === construction.id)
      if (row)
      {
        row.setVisible(true)

        row.populationControl.setIcon(`population_epoch_${sector.epoch}`).setValue(construction.allocated)
        row.clock.setValue(construction.remainingDuration)
      }
    })
  }
}