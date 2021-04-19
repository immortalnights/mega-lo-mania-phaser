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
        items: {
          left,
          multiply,
          center,
          equal,
          right,
        },

        // Show / Hide all the row items
        setVisible(b)
        {
          const gameObjects = Object.values(this.items)
          gameObjects.forEach(o => o.setVisible(false))
        }
      }
    }

    this.resources = []
    for (let index = 0; index < 4; index++)
    {
      const row = createRow(18 + (26 * index))

      row.setVisible(false)
      // Add to this container
      this.add(Object.values(row.items))
      this.resources.push(row)
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
      this.header.setFrame('gather_header')
    }

    Object.values(this.resources).forEach(g => g.setVisible(false))

    // Assumes the resources are ordered by when they become available
    let displayIndex = 0
    sector.resources.forEach(resource => {
      const items = this.resources[displayIndex].items

      if (resource.locked === true)
      {
        // Skip, already hidden
      }
      else if (resource.depleted)
      {
        items.left.setVisible(false)
        items.multiply.setVisible(false)
        items.center.setVisible(false)
        items.equal.setVisible(false)
        items.right.setVisible(true).setIcon(`resource_${resource.id}`).setValue(resource.owned)
      }
      else if (resource.type === 'surface')
      {
        items.left.setVisible(false)
        items.multiply.setVisible(false)
        items.center.setVisible(true).setIcon('mine_hand_icon').setValue(null)
        items.equal.setVisible(true)
        items.right.setVisible(true).setIcon(`resource_${resource.id}`).setValue(resource.owned)
      }
      else
      {
        const icon = resource.type === 'pit' ? 'pit_resource_icon' : 'mined_resource_icon'
        items.left.setVisible(true).setFrame(`resource_${resource.id}`)
        items.multiply.setVisible(true)
        items.center.setVisible(true).setIcon(`population_epoch_${sector.epoch}`).setValue(resource.allocated)
        items.equal.setVisible(true)
        items.right.setVisible(true).setIcon(icon).setValue(resource.owned)
      }

      displayIndex++
    })
  }
}