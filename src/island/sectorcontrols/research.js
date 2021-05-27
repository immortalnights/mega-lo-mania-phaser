import Phaser from 'phaser'
import Header from './header'
import Clock from '../../components/clock'
import ValueControl from '../../components/valuecontrol'
import CategorizedTechnologies from './categorizedtechnologies'
import { UserEvents } from '../../defines'


export default class Research extends Phaser.GameObjects.Container
{
  constructor(scene, x, y)
  {
    super(scene, x, y)

    this.name = 'research'

    this.header = new Header(this.scene, 0, 0, 'research_header', () => {
      this.scene.events.emit(UserEvents.SECTOR_CONTROLS_VIEW_CHANGE, 'root')
    })
    this.add(this.header)

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
      iconClass: 'researchIcon',
      filter: (sector, technology) => {
        return (technology.researched === false && sector.hasResourcesFor(technology) && (technology.requiresLaboratory === false || sector.buildings.laboratory !== false))
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

    if (sector.buildings.laboratory !== false)
    {
      this.header.setFrame('advanced_research_header')
    }
    else
    {
      this.header.setFrame('research_header')
    }

    const task = sector['research']

    if (task)
    {
      // Set researching icon
      this.activeTaskIcon.setFrame(task.icon)

      this.activeTaskPopulation.setIcon(`population_epoch_${sector.epoch}`)
      this.activeTaskPopulation.setValue(task.allocated)

      // Set researching time
      this.activeTaskClock.setDuration(task.remainingDuration)

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
