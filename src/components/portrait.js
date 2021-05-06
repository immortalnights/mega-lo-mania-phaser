import Phaser from 'phaser'

export default class Portrait extends Phaser.GameObjects.Container
{
  constructor(scene, x, y, team)
  {
    super(scene, x, y)

    const image = new Phaser.GameObjects.Image(this.scene, 0, 0, 'mlm_icons', `${team}_portrait`)
    this.add(image)
  }
}