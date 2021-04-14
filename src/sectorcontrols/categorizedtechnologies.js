import Phaser from 'phaser'
import Button from '../button'

export default class CategorizedTechnologies extends Phaser.GameObjects.Container
{
  constructor(scene, x, y, config)
  {
    super(scene, x, y)

    this.technologyPredicate = config.filter

    // Categories
    this.add(this.scene.add.image(-25, 0, 'mlm_icons', 'category_repair'))
    this.add(this.scene.add.image(0, 0, 'mlm_icons', 'category_defence'))
    this.add(this.scene.add.image(25, 0, 'mlm_icons', 'category_offense'))

    // Technologies
    const onClickTechnology = button => {
      this.emit('technology:selected', button.name)
    }

    this.technologies = new Phaser.GameObjects.Group(this.scene)
    this.technologies.add(new Button(scene, -25, 18, '', onClickTechnology))
    this.technologies.add(new Button(scene, -25, 34, '', onClickTechnology))
    this.technologies.add(new Button(scene, -25, 50, '', onClickTechnology))
    this.technologies.add(new Button(scene, -25, 66, '', onClickTechnology))
    this.technologies.add(new Button(scene, 0, 18, '', onClickTechnology))
    this.technologies.add(new Button(scene, 0, 34, '', onClickTechnology))
    this.technologies.add(new Button(scene, 0, 50, '', onClickTechnology))
    this.technologies.add(new Button(scene, 0, 66, '', onClickTechnology))
    this.technologies.add(new Button(scene, 25, 18, '', onClickTechnology))
    this.technologies.add(new Button(scene, 25, 34, '', onClickTechnology))
    this.technologies.add(new Button(scene, 25, 50, '', onClickTechnology))
    this.technologies.add(new Button(scene, 25, 66, '', onClickTechnology))
    this.add(this.technologies.getChildren())

    // Hide all technology icons
    this.technologies.setVisible(false)
  }

  display(sector)
  {
    this.technologies.setVisible(false)

    let repair = 0
    let defence = 0
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
        else if (val.category === 'defence')
        {
          icon = this.technologies.getChildren()[4 + defence]
          defence++
        }
        else if (val.category === 'offense')
        {
          icon = this.technologies.getChildren()[8 + offense]
          offense++
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