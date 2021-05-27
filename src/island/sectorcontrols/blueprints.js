import Phaser from 'phaser'
import CategorizedTechnologies from './categorizedtechnologies'
import Header from './header'
import ValueControl from '../../components/valuecontrol'
import { UserEvents } from '../../defines'


class TechnologyRecipe extends Phaser.GameObjects.Container
{
  constructor(scene, x, y)
  {
    super(scene, x, y)

    this.technologyIcon = new Phaser.GameObjects.Image(this.scene, -25, 0, 'mlm_icons', '')
    this.add(this.technologyIcon)

    const equalIcon = new Phaser.GameObjects.Image(this.scene, -14, 0, 'mlm_icons', 'equal_icon')
    this.add(equalIcon)

    this.resourceIcons = []
    this.resourceIcons.push(new ValueControl(this.scene, 0, 4, '', null))
    this.resourceIcons.push(new ValueControl(this.scene, 0, 29, '', null))
    this.resourceIcons.push(new ValueControl(this.scene, 0, 54, '', null))
    this.resourceIcons.forEach(icon => this.add(icon))

    this.perfectIcon = new Phaser.GameObjects.Image(this.scene, 25, 0, 'mlm_icons', 'perfect_recipe')
    this.add(this.perfectIcon)
  }

  displayTechnology(technology)
  {
    if (technology.recipe)
    {
      this.technologyIcon.setFrame(technology.id)
      this.perfectIcon.setVisible(technology.recipe.perfect)

      let index = 0;
      for (const [ key, val ] of Object.entries(technology.recipe.resources))
      {
        const icon = this.resourceIcons[index]

        icon.setIcon(`resource_${key}`)
        icon.setValue(val)
        icon.setVisible(true)

        index++
      }

      for (; index < this.resourceIcons.length; index++)
      {
        this.resourceIcons[index].setVisible(false)
      }
    }
  }
}


export default class Blueprints extends Phaser.GameObjects.Container
{
  constructor(scene, x, y)
  {
    super(scene, x, y)

    this.name = 'blueprints'
    this.state = 'inventory'

    this.add(new Header(this.scene, 0, 0, 'blueprint_header', () => {
      if (this.state === 'inventory')
      {
        this.scene.events.emit(UserEvents.SECTOR_CONTROLS_VIEW_CHANGE, 'root')
      }
      else
      {
        this.displayTechnologyInventory()
      }
    }))

    this.technologies = new CategorizedTechnologies(this.scene, 0, 18, {
      iconClass: 'blueprintIcon',
      filter: (sector, technology) => {
        return (technology.researched === true)
      }
    })
    this.technologies.on('technology:selected', (id, technology) => {
      this.displayTechnologyRecipe(id, technology)
    })
    this.add(this.technologies)

    this.recipe = new TechnologyRecipe(this.scene, 0, 18)
    this.recipe.setVisible(false)
    this.add(this.recipe)
  }

  displayTechnologyInventory()
  {
    this.technologies.setVisible(true)
    this.recipe.setVisible(false)
    this.state = 'inventory'
  }
  
  displayTechnologyRecipe(id, technology)
  {
    this.technologies.setVisible(false)
    this.recipe.displayTechnology(technology)
    this.recipe.setVisible(true)
    this.state = 'recipe'
  }

  display(sector)
  {
    this.setVisible(true)

    this.technologies.display(sector)
  }
}