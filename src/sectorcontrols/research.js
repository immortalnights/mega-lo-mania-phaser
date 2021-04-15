import Phaser from 'phaser'
import Header from './header'
import Clock from '../clock'
import Task from '../task'
import CategorizedTechnologies from './categorizedtechnologies'
import ValueControl from './valuecontrol'
import { UserEvents } from '../defines'




export default class Research extends Phaser.GameObjects.Container
{
  constructor(scene, x, y, config)
  {
    super(scene, x, y)

    this.add(new Header(this.scene, 0, 0, config.header, () => {
      this.parentContainer.emit('sectorcontrol:change_view', 'root')
    }))

    this.inactiveLabel = new Phaser.GameObjects.Text(this.scene, 0, 23, '-')

    this.activeTask = new Phaser.GameObjects.Group(this.scene)

    this.activeTaskIcon = new Phaser.GameObjects.Image(this.scene, -25, 18, 'mlm_icons', '')
    this.activeTask.add(this.activeTaskIcon)

    this.activeTask.add(new Phaser.GameObjects.Image(this.scene, -13, 18, 'mlm_icons', 'multiply_icon'))

    this.activeTaskPopulation = new ValueControl(this.scene, 0, 20, 'population_epoch_1')
    this.activeTaskPopulation.on(UserEvents.VALUE_CHANGE, value => {
      this.scene.events.emit(UserEvents.CHANGE_RESEARCHERS, value)
    })
    this.activeTaskPopulation.setData('population', undefined)
    this.add(this.activeTaskPopulation)

    this.activeTask.add(new Phaser.GameObjects.Image(this.scene, 11, 18, 'mlm_icons', 'equal_icon'))

    this.activeTaskClock = new Clock(this.scene, 25, 19, Infinity)
    // If `addToScene` is true, the clock `preUpdate` will be called
    this.activeTask.add(this.activeTaskClock, false)

    this.add(this.activeTask.getChildren())

    // Hide active task related images
    this.activeTask.setVisible(false)

    this.technologies = new CategorizedTechnologies(this.scene, 0, 45, {
      iconStyle: undefined,
      filter: (sector, technology) => {
        return (technology.researched === false && sector.hasResourcesFor(technology))
      }
    })
    this.technologies.on('technology:selected', technology => {
      this.emit('technology:selected', technology)
    })
    this.add(this.technologies)
  }

  display(sector)
  {
    this.setVisible(true)

    const task = sector['research']

    if (task)
    {
      // Set researching icon
      this.activeTaskIcon.setFrame(task.name)

      this.activeTaskPopulation.setValue(task.allocated)

      // Set researching time
      this.activeTaskClock.setDuration(task.remainingDuration)

      // Display
      this.activeTask.setVisible(true)
    }
    else
    {
      this.activeTaskPopulation.setValue(undefined)
      this.activeTask.setVisible(false)
    }

    this.technologies.display(sector)
  }
}
