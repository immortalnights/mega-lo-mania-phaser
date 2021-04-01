import Phaser from 'phaser'
import Header from './header'
import Clock from '../clock'
import Task from '../task'
import Button from '../button'
import { UnitTypes, DefenderUnitTypes, UserEvents } from '../defines'

export class CategorizedTechnologies extends Phaser.GameObjects.Container
{
  constructor(scene, x, y, config)
  {
    super(scene, x, y)

    this.technologyPredicate = config.filter

    // Categories
    this.add(this.scene.add.image(0, 45, 'mlm_icons', 'category_repair'))
    this.add(this.scene.add.image(24, 45, 'mlm_icons', 'category_defence'))
    this.add(this.scene.add.image(50, 45, 'mlm_icons', 'category_offence'))

    // Technologies
    const onClickTechnology = button => {
      this.emit('technology:selected', button.name)
    }

    this.technologies = new Phaser.GameObjects.Group(this.scene)
    this.technologies.add(new Button(scene, 0, 62, '', onClickTechnology))
    this.technologies.add(new Button(scene, 0, 78, '', onClickTechnology))
    this.technologies.add(new Button(scene, 0, 94, '', onClickTechnology))
    this.technologies.add(new Button(scene, 0, 110, '', onClickTechnology))
    this.technologies.add(new Button(scene, 24, 62, '', onClickTechnology))
    this.technologies.add(new Button(scene, 24, 78, '', onClickTechnology))
    this.technologies.add(new Button(scene, 24, 94, '', onClickTechnology))
    this.technologies.add(new Button(scene, 24, 110, '', onClickTechnology))
    this.technologies.add(new Button(scene, 50, 62, '', onClickTechnology))
    this.technologies.add(new Button(scene, 50, 78, '', onClickTechnology))
    this.technologies.add(new Button(scene, 50, 94, '', onClickTechnology))
    this.technologies.add(new Button(scene, 50, 110, '', onClickTechnology))
    this.add(this.technologies.getChildren())

    // Hide all technology icons
    this.technologies.setVisible(false)
  }

  display(sector)
  {
    this.technologies.setVisible(false)

    let repair = 0
    let defence = 0
    let offence = 0
    for (const [ key, val ] of Object.entries(sector.technologies))
    {
      if (this.technologyPredicate(sector, val))
      {
        let icon
        if (val.category === 'repair')
        {
          icon = this.technologies.getChildren()[repair]
          repair++
        }
        else if (val.category === 'defence')
        {
          icon = this.technologies.getChildren()[4 + defence]
          defence++
        }
        else if (val.category === 'offence')
        {
          icon = this.technologies.getChildren()[8 + offence]
          offence++
        }
  
        if (icon)
        {
          icon.name = key
          icon.setFrame(key)
          icon.setVisible(true)
        }
      }
    }
  }
}

export default class Research extends Phaser.GameObjects.Container
{
  constructor(scene, x, y, config)
  {
    super(scene, x, y)

    this.taskName = config.task

    this.add(new Header(this.scene, 26, 0, config.header, () => {
      this.parentContainer.emit('sectorcontrol:change_view', 'root')
    }))

    this.activeTask = new Phaser.GameObjects.Group(this.scene)

    this.activeTaskIcon = new Phaser.GameObjects.Image(this.scene, 0, 18, 'mlm_icons', '')
    this.activeTask.add(this.activeTaskIcon)

    this.activeTask.add(new Phaser.GameObjects.Image(this.scene, 12, 18, 'mlm_icons', 'multiply_icon'))

    this.activeTaskPopulation = new Task(this.scene, 26, 23, 'population_epoch_1', this.taskName)
    this.activeTaskPopulation.setData('population', undefined)
    this.add(this.activeTaskPopulation)

    this.activeTask.add(new Phaser.GameObjects.Image(this.scene, 38, 18, 'mlm_icons', 'equal_icon'))

    this.activeTaskClock = new Clock(this.scene, 50, 19, Infinity)
    // If `addToScene` is true, the clock `preUpdate` will be called
    this.activeTask.add(this.activeTaskClock, false)
    this.add(this.activeTask.getChildren())

    // Hide active task related images
    this.activeTask.setVisible(false)

    this.technologies = new CategorizedTechnologies(this.scene, 0, 0, {
      iconStyle: undefined,
      filter: config.technologyFilter
    })
    this.technologies.on('technology:selected', technology => {
      this.emit('technology:selected', technology)
    })
    this.add(this.technologies)
  }

  display(sector)
  {
    this.setVisible(true)

    const task = sector[this.taskName]

    if (task)
    {
      // Set researching icon
      this.activeTaskIcon.setFrame(task.name)

      this.activeTaskPopulation.setData('population', task.allocated)

      // Set researching time
      this.activeTaskClock.setDuration(task.remainingDuration)

      // Display
      this.activeTask.setVisible(true)
    }
    else
    {
      this.activeTaskPopulation.setData('population', undefined)
      this.activeTask.setVisible(false)
    }

    this.technologies.display(sector)
  }
}
