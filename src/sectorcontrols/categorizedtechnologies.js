import Phaser from 'phaser'
import Button from '../button'

export default class CategorizedTechnologies extends Phaser.GameObjects.Container
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