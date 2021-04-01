import Phaser from 'phaser'
import Header from './header'
import Clock from '../clock'
import Task from '../task'
import Button from '../button'
import { UnitTypes, DefenderUnitTypes, UserEvents } from '../defines'

export default class Research extends Phaser.GameObjects.Container
{
  constructor(scene, x, y)
  {
    super(scene, x, y)

    this.name = 'research'

    this.add(new Header(this.scene, 26, 0, 'research_header', () => {
      this.parentContainer.emit('sectorcontrol:change_view', 'root')
    }))

    this.activeResearch = new Phaser.GameObjects.Group(this.scene)

    this.activeResearchIcon = new Phaser.GameObjects.Image(this.scene, 0, 18, 'mlm_icons', '')
    this.activeResearch.add(this.activeResearchIcon)

    this.activeResearch.add(new Phaser.GameObjects.Image(this.scene, 12, 18, 'mlm_icons', 'multiply_icon'))

    this.activeResearchPopulation = new Task(this.scene, 26, 23, 'population_epoch_1', 'research')
    this.activeResearchPopulation.setData('population', undefined)
    this.add(this.activeResearchPopulation)

    this.activeResearch.add(new Phaser.GameObjects.Image(this.scene, 38, 18, 'mlm_icons', 'equal_icon'))

    this.activeResearchClock = new Clock(this.scene, 50, 19, Infinity)
    // If `addToScene` is true, the clock `preUpdate` will be called
    this.activeResearch.add(this.activeResearchClock, false)
    this.add(this.activeResearch.getChildren())

    // Hide active research related images
    this.activeResearch.setVisible(false)

    // Categories
    this.add(this.scene.add.image(0, 45, 'mlm_icons', 'category_repair'))
    this.add(this.scene.add.image(24, 45, 'mlm_icons', 'category_defence'))
    this.add(this.scene.add.image(50, 45, 'mlm_icons', 'category_offence'))

    // Technologies
    const onClickTechnology = this.onClickTechnology.bind(this)

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

  onClickTechnology(button, pointer, localX, localY, event)
  {
    this.scene.events.emit(UserEvents.SELECT_RESEARCH_TECHNOLOGY, button.name)
  }

  // display({
  //   epoch: 1,
  //   researches: 0,
  //   researching: {
  //     name: 'rock',
  //     started: 0,
  //     duration: Infinity,
  //   },
  //   technologies: {
  //     rock: {
  //       wood: 0.5
  //     }
  //   }
  // })

  display(sector)
  {
    this.setVisible(true)
    this.technologies.setVisible(false)

    if (sector.research)
    {
      // Set researching icon
      this.activeResearchIcon.setFrame(sector.research.name)

      this.activeResearchPopulation.setData('population', sector.research.researches)

      // Set researching time
      this.activeResearchClock.setDuration(sector.research.remainingDuration)

      // Display
      this.activeResearch.setVisible(true)
    }
    else
    {
      this.activeResearchPopulation.setData('population', undefined)
      this.activeResearch.setVisible(false)
    }

    let repair = 0
    let defence = 0
    let offence = 0
    for (const [ key, val ] of Object.entries(sector.technologies))
    {
      if (val.researched === false && sector.hasResourcesFor(val))
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
