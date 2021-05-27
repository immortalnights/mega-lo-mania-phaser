import Phaser from 'phaser'


export default class Header extends Phaser.GameObjects.Image
{
  constructor(scene, x, y, frame, onClick)
  {
    super(scene, x, y, 'mlm_icons', frame)

    this.setInteractive()
    this.on(Phaser.Input.Events.POINTER_DOWN, onClick)
    this.on(Phaser.Input.Events.POINTER_OVER, () => {
      // this.setTint(0xff0000)
    })
    this.on(Phaser.Input.Events.POINTER_OUT, () => {
      // this.setTint(0xffffff)
    })
  }
}