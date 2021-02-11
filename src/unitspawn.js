
export default class UnitSpawn extends Phaser.GameObjects.Sprite
{
  constructor(scene, x, y)
  {
    super(scene, x, y, 'mlm_icons', 'spawn_001')

    this.once(Phaser.GameObjects.Events.ADDED_TO_SCENE, () => {
      this.play('spawn', true)
    })

    this.once('animationcomplete', () => {
      this.destroy()
    })
  }
}