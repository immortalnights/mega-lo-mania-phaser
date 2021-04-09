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
      this.header
    }
    else if (sector.epoch > 2)
    {
      // dig_header
      this.header
    }
    else
    {
      // gather_header
      this.header
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
        row.center.setVisible(true).setIcon('').setValue(resource.allocated)
        row.equal.setVisible(true)
        row.right.setVisible(true).setIcon(icon).setValue(resource.owned)
      }
    })
  }

  displayResource(y, resource, i)
  {
    const row = this.rows_basic[i]
    if (resource.depleted)
    {
      row.left.setVisible(false)
      row.multiply.setVisible(false)
      row.center.setVisible(false)
      row.equal.setVisible(false)
      row.right.setIcon(`resource_${resource.id}`).setValue(resource.owned)
    }
    else if (resource.type === 'surface')
    {
        
    }
    else
    {
      const icon = resource.type === 'pit' ? 'pit_resource_icon' : 'mined_resource_icon'

      
    }

    // if (resource.depleted)
    // {
    //   this.add(new ValueControl(this.scene, 22, y, `resource_${resource.id}`, resource.mined))
    // }
    // else if (resource.type === 'surface')
    // {
    //     // Surface resources are gathers passively and miners cannot be allocated
    //     this.rows.add(new Phaser.GameObjects.Image(this.scene, -2, y, 'mlm_icons', 'mine_hand_icon'))
    //     this.rows.add(new Phaser.GameObjects.Image(this.scene, 10, y - 1, 'mlm_icons', 'equal_icon'))
    //     this.rows.add(new Task(this.scene, 22, y, `resource_${resource.id}`))
    // }
    // else
    // {
    //   const icon = resource.type === 'pit' ? 'pit_resource_icon' : 'mined_resource_icon'

    //   this.rows.add(new Phaser.GameObjects.Image(this.scene, -28, y, 'mlm_icons', `resource_${resource.id}`))
    //   this.rows.add(new Phaser.GameObjects.Image(this.scene, -16, y - 1, 'mlm_icons', 'multiply_icon'))
    //   this.rows.add(new Task(this.scene, -2, y, 'mlm_icons', 'mine')) // resource.id
    //   this.rows.add(new Phaser.GameObjects.Image(this.scene, 10, y - 1, 'mlm_icons', 'equal_icon'))
    //   this.rows.add(new Task(this.scene, 22, y, icon))
    // }
  }
}