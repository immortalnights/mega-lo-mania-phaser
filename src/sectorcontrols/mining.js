import Phaser from 'phaser'
import Header from './header'
import Task from '../task'


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

    let resourceY = 18
    sector.resources.forEach(resource => {
      let displayed = false

      switch (resource.type)
      {
        case 'mine':
        {
          if (sector.buildings.mine !== false)
          {
            this.displayResource(resourceY, resource)
            displayed = true
          }
          break
        }
        case 'pit':
        {
          if (sector.epoch > 2)
          {
            this.displayResource(resourceY, resource)
            displayed = true
          }
          break;
        }
        case 'surface':
        {
          this.displayResource(resourceY, resource)
          displayed = true
          break;
        }
        default:
        {
          console.assert(false, `Unhandled resource type ${resource.type} for ${resource.id}`)
          break
        }
      }

      if (displayed)
      {
        resourceY = resourceY + 26
      }
    })
  }

  displayResource(y, resource)
  {
    if (resource.depleted)
    {
      this.add(new Task(this.scene, 22, y, `resource_${resource.id}`))
    }
    else if (resource.type === 'surface')
    {
        // Surface resources are gathers passively and miners cannot be allocated
        this.add(new Phaser.GameObjects.Image(this.scene, -2, y, 'mlm_icons', 'mine_hand_icon'))
        this.add(new Phaser.GameObjects.Image(this.scene, 10, y - 1, 'mlm_icons', 'equal_icon'))
        this.add(new Task(this.scene, 22, y, `resource_${resource.id}`))
    }
    else
    {
      const icon = resource.type === 'pit' ? 'pit_resource_icon' : 'mined_resource_icon'

      this.add(new Phaser.GameObjects.Image(this.scene, -28, y, 'mlm_icons', `resource_${resource.id}`))
      this.add(new Phaser.GameObjects.Image(this.scene, -16, y - 1, 'mlm_icons', 'multiply_icon'))
      this.add(new Task(this.scene, -2, y, 'mlm_icons', 'mine')) // resource.id
      this.add(new Phaser.GameObjects.Image(this.scene, 10, y - 1, 'mlm_icons', 'equal_icon'))
      this.add(new Task(this.scene, 22, y, icon))
    }
  }
}