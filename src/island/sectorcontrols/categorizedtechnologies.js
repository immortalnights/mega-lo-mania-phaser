import Phaser from 'phaser'
import Button from '../../components/button'


export default class CategorizedTechnologies extends Phaser.GameObjects.Container
{
  constructor(scene, x, y, config)
  {
    super(scene, x, y)

    this.technologyPredicate = config.filter
    // TODO remove
    this.iconClass = config.iconClass

    // Categories
    this.add(this.scene.add.image(-25, 0, 'mlm_icons', 'category_repair'))
    this.add(this.scene.add.image(0, 0, 'mlm_icons', 'category_defense'))
    this.add(this.scene.add.image(25, 0, 'mlm_icons', 'category_offense'))

    // Technologies
    const onClickTechnology = button => {
      this.emit('technology:selected', button.name, button.technology)
    }

    this.technologies = new Phaser.GameObjects.Group(this.scene)
    this.technologies.add(new Button(scene, -25, 17, '', onClickTechnology))
    this.technologies.add(new Button(scene, -25, 34, '', onClickTechnology))
    this.technologies.add(new Button(scene, -25, 52, '', onClickTechnology))
    this.technologies.add(new Button(scene, -25, 70, '', onClickTechnology))
    this.technologies.add(new Button(scene, 0, 17, '', onClickTechnology))
    this.technologies.add(new Button(scene, 0, 34, '', onClickTechnology))
    this.technologies.add(new Button(scene, 0, 52, '', onClickTechnology))
    this.technologies.add(new Button(scene, 0, 70, '', onClickTechnology))
    this.technologies.add(new Button(scene, 25, 17, '', onClickTechnology))
    this.technologies.add(new Button(scene, 25, 34, '', onClickTechnology))
    this.technologies.add(new Button(scene, 25, 52, '', onClickTechnology))
    this.technologies.add(new Button(scene, 25, 70, '', onClickTechnology))
    this.add(this.technologies.getChildren())

    // Hide all technology icons
    this.technologies.setVisible(false)
  }

  display(sector)
  {
    this.technologies.setVisible(false)

    let repair = 0
    let defense = 0
    let offense = 0
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
        else if (val.category === 'defense')
        {
          icon = this.technologies.getChildren()[4 + defense]
          defense++
        }
        else if (val.category === 'offense')
        {
          icon = this.technologies.getChildren()[8 + offense]
          offense++
        }
  
        if (icon)
        {
          icon.name = key
          icon.technology = val
          icon.setFrame(val[this.iconClass])
          icon.setVisible(true)
        }
      }
    }
  }
}