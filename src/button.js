import Phaser from 'phaser'

export default class Button extends Phaser.GameObjects.Sprite
{
  constructor(scene, x, y, frame, onClick)
  {
    super(scene, x, y, 'mlm_icons', frame)

    this.name = name

    this.setInteractive()
    this.on('pointerdown', (pointer, localX, localY, event) => {
      if (onClick)
      {
        onClick(this, pointer, localX, localY, event)
      }
    })
  }
}