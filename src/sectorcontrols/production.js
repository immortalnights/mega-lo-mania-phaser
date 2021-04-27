import Phaser from 'phaser'
import Header from './header'
import Clock from '../clock'
import ValueControl from './valuecontrol'
import CategorizedTechnologies from './categorizedtechnologies'


export default class Production extends Phaser.GameObjects.Container
{
  constructor(scene, x, y, config)
  {
    super(scene, x, y)

    this.add(new Header(this.scene, 0, 0, 'production_header', () => {
      this.parentContainer.emit('sectorcontrol:change_view', 'root')
    }))

    this.inactiveLabel = new Phaser.GameObjects.Text(this.scene, 26, 23, '-')

    this.activeTask = new Phaser.GameObjects.Group(this.scene)

    this.activeTaskIcon = new Phaser.GameObjects.Image(this.scene, -25, 18, 'mlm_icons', '')
    this.activeTask.add(this.activeTaskIcon)

    this.activeTask.add(new Phaser.GameObjects.Image(this.scene, -13, 18, 'mlm_icons', 'multiply_icon'))

    this.activeTaskPopulation = new ValueControl(this.scene, 0, 20, 'population_epoch_1', 'production')
    this.activeTaskPopulation.setData('population', undefined)
    this.add(this.activeTaskPopulation)

    this.activeTask.add(new Phaser.GameObjects.Image(this.scene, 11, 18, 'mlm_icons', 'equal_icon'))

    this.activeTaskClock = new Clock(this.scene, 25, 19, Infinity)
    // If `addToScene` is true, the clock `preUpdate` will be called
    this.activeTask.add(this.activeTaskClock, false)

    this.activeTask.add(new Phaser.GameObjects.Image(this.scene, -13, 43, 'mlm_icons', 'multiply_icon'))
    this.activeTaskRuns = new ValueControl(this.scene, 0, 47, 'factory_box_icon', 'production_runs')
    this.activeTaskRuns.setData('population', 1)
    this.activeTask.add(this.activeTaskRuns)

    this.activeTask.add(new Phaser.GameObjects.Image(this.scene, 11, 43, 'mlm_icons', 'equal_icon'))

    this.activeTaskRunsClock = new Clock(this.scene, 25, 45, Infinity)
    this.activeTask.add(this.activeTaskRunsClock, false)

    this.add(this.activeTask.getChildren())

    // Hide active task related images
    this.activeTask.setVisible(false)

    this.technologies = new CategorizedTechnologies(this.scene, 0, 70, {
      iconClass: 'productionIcon',
      filter: (sector, technology) => {
        return (technology.researched === true && technology.requiresProduction === true && sector.hasResourcesFor(technology))
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
      this.activeTaskIcon.setFrame(task.icon)

      this.activeTaskPopulation.setIcon(`population_epoch_${sector.epoch}`)
      this.activeTaskPopulation.setValue(task.allocated)
      this.activeTaskRuns.setValue(task.runs)

      // Set researching time
      this.activeTaskClock.setDuration(task.remainingDuration)
      this.activeTaskRunsClock.setDuration(task.runsDuration)

      // Display
      this.activeTask.setVisible(true)
    }
    else
    {
      this.activeTaskPopulation.setIcon(`population_epoch_${sector.epoch}`)
      this.activeTaskPopulation.setValue(undefined)
      this.activeTask.setVisible(false)
    }

    this.technologies.display(sector)
  }
}
