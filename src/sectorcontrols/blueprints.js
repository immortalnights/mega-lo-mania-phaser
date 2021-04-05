import Phaser from 'phaser'
import Header from './header'


export default class Blueprints extends Phaser.GameObjects.Container
{
  constructor(scene, x, y)
  {
    super(scene, x, y)

    this.name = 'blueprints'

    this.add(new Header(this.scene, 0, 0, 'blueprint_header', () => {
      this.parentContainer.emit('sectorcontrol:change_view', 'root')
    }))
  }

  display()
  {
    this.setVisible(true)
  }
}