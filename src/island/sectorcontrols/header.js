import Phaser from 'phaser'


export default class Header extends Phaser.GameObjects.Image
{
  constructor(scene, x, y, frame, onClick)
  {
    super(scene, x, y, 'mlm_icons', frame)

    this.setInteractive()
    this.on('pointerdown', onClick)
  }
}