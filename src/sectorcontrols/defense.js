import Phaser from 'phaser'
import Header from './header'


export default class Defence extends Phaser.GameObjects.Container
{
  constructor(scene, x, y)
  {
    super(scene, x, y)

    this.name = 'defence'

    this.add(new Header(this.scene, 0, 0, 'defence_header', () => {
      this.parentContainer.emit('sectorcontrol:change_view', 'root')
    }))
  }

  display()
  {
    this.setVisible(true)
  }
}
