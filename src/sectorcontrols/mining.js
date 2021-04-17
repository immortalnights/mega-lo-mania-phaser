import Phaser from 'phaser'
import Header from './header'
import Task from '../task'
import ValueControl from './valuecontrol'


export default class Mining extends Phaser.GameObjects.Container
{
  constructor(scene, x, y)
  {
    super(scene, x, y)

    this.name = 'mining'

    this.header = new Header(this.scene, 0, 0, 'gather_header', () => {
      this.parentContainer.emit('sectorcontrol:change_view', 'root')
    })

    this.add(this.header)

    const createRow = yOffset => {
      const left = new Phaser.GameObjects.Image(this.scene, -28, yOffset, 'mlm_icons', ``)
      const multiply = new Phaser.GameObjects.Image(this.scene, -16, yOffset - 1, 'mlm_icons', 'multiply_icon')
      const center = new ValueControl(this.scene, -2, yOffset, 'mlm_icons', '')
      const equal = new Phaser.GameObjects.Image(this.scene, 10, yOffset - 1, 'mlm_icons', 'equal_icon')
      const right = new ValueControl(this.scene, 22, yOffset, '')

      return {
        left,
        multiply,
        center,
        equal,
        right
      }
    }

    this.rows = []
    for (let index = 0; index < 4; index++)
    {
      const row = createRow(18 + (26 * index))

      const gameObjects = Object.values(row)
      // Hide all the row items
      gameObjects.forEach(o => o.setVisible(false))
      // Add to this container
      this.add(gameObjects)
      this.rows.push(row)
    }
  }

  display(sector)
  {
    this.setVisible(true)

    if (sector.buildings.mine !== false)
    {
      // mine_header
      this.header.setFrame('advanced_mine_header')
    }
    else if (sector.epoch >= 2)
    {
      // dig_header
      this.header.setFrame('mine_header')
    }
    else
    {
      // gather_header
    }

    // Assumes the resources are ordered by when they become available
    sector.resources.forEach((resource, index) => {
      const row = this.rows[index]

      if (resource.locked === true)
      {
        // Skip, already hidden
        // Object.values(this.rows_basic[index]).forEach(i => i.setVisible(false))
      }
      else if (resource.depleted)
      {
        row.left.setVisible(false)
        row.multiply.setVisible(false)
        row.center.setVisible(false)
        row.equal.setVisible(false)
        row.right.setVisible(true).setIcon(`resource_${resource.id}`).setValue(resource.owned)
      }
      else if (resource.type === 'surface')
      {
        row.left.setVisible(false)
        row.multiply.setVisible(false)
        row.center.setVisible(true).setIcon('mine_hand_icon').setValue(null)
        row.equal.setVisible(true)
        row.right.setVisible(true).setIcon(`resource_${resource.id}`).setValue(resource.owned)
      }
      else
      {
        const icon = resource.type === 'pit' ? 'pit_resource_icon' : 'mined_resource_icon'
        row.left.setVisible(true).setFrame(`resource_${resource.id}`)
        row.multiply.setVisible(true)
        row.center.setVisible(true).setIcon(`population_epoch_${sector.epoch}`).setValue(resource.allocated)
        row.equal.setVisible(true)
        row.right.setVisible(true).setIcon(icon).setValue(resource.owned)
      }
    })
  }
}