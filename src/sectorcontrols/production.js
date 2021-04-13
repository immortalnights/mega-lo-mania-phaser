import Phaser from 'phaser'
import Header from './header'
import Clock from '../clock'
import Task from '../task'
import CategorizedTechnologies from './categorizedtechnologies'


export default class Production extends Phaser.GameObjects.Container
{
  constructor(scene, x, y, config)
  {
    super(scene, x, y)

    this.add(new Header(this.scene, 26, 0, 'production_header', () => {
      this.parentContainer.emit('sectorcontrol:change_view', 'root')
    }))

    this.inactiveLabel = new Phaser.GameObjects.Text(this.scene, 26, 23, '-')

    this.activeTask = new Phaser.GameObjects.Group(this.scene)

    this.activeTaskIcon = new Phaser.GameObjects.Image(this.scene, 0, 18, 'mlm_icons', '')
    this.activeTask.add(this.activeTaskIcon)

    this.activeTask.add(new Phaser.GameObjects.Image(this.scene, 12, 18, 'mlm_icons', 'multiply_icon'))

    this.activeTaskPopulation = new Task(this.scene, 26, 23, 'population_epoch_1', 'production')
    this.activeTaskPopulation.setData('population', undefined)
    this.add(this.activeTaskPopulation)

    this.activeTask.add(new Phaser.GameObjects.Image(this.scene, 38, 18, 'mlm_icons', 'equal_icon'))

    this.activeTaskClock = new Clock(this.scene, 50, 19, Infinity)
    // If `addToScene` is true, the clock `preUpdate` will be called
    this.activeTask.add(this.activeTaskClock, false)

    this.activeTask.add(new Phaser.GameObjects.Image(this.scene, 12, 43, 'mlm_icons', 'multiply_icon'))
    this.activeTaskRuns = new Task(this.scene, 26, 48, 'factory_box_icon', 'production_runs')
    this.activeTaskRuns.setData('population', 1)
    this.activeTask.add(this.activeTaskRuns)

    this.activeTask.add(new Phaser.GameObjects.Image(this.scene, 38, 43, 'mlm_icons', 'equal_icon'))

    this.activeTaskRunsClock = new Clock(this.scene, 50, 44, Infinity)
    this.activeTask.add(this.activeTaskRunsClock, false)

    this.add(this.activeTask.getChildren())

    // Hide active task related images
    this.activeTask.setVisible(false)

    this.technologies = new CategorizedTechnologies(this.scene, 0, 25, {
      iconStyle: undefined,
      filter: (sector, technology) => {
        return (technology.researched === true && technology.produced === true && sector.hasResourcesFor(technology))
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

    const task = sector['production']

    if (task)
    {
      // Set researching icon
      this.activeTaskIcon.setFrame(task.name)

      this.activeTaskPopulation.setData('population', task.allocated)
      this.activeTaskRuns.setData('population', task.runs)

      // Set researching time
      this.activeTaskClock.setDuration(task.remainingDuration)
      this.activeTaskRunsClock.setData('population', task.runsDuration)

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
