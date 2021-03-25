import Phaser from 'phaser'

export default class Button extends Phaser.GameObjects.Sprite
{
  constructor(scene, x, y, frame, name)
  {
    super(scene, x, y, 'mlm_icons', frame)

    this.name = name

    this.setInteractive()
    this.on('pointerdown', pointer => {
      if (pointer.buttons === 1)
      {
        this.scene.events.emit(UserEvents.LEFT_CLICK_BUTTON, name)
      }
      else if (pointer.buttons === 2)
      {
        this.scene.events.emit(UserEvents.RIGHT_CLICK_BUTTON, name)
      }
    })
  }
}