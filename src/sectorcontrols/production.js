

export class Production extends Phaser.GameObjects.Container
{
  constructor(scene, x, y)
  {
    super(scene, x, y)

    this.add(new Header(this.scene, 0, 0, 'production_header', () => {
      this.parentContainer.emit('sectorcontrol:change_view', 'root')
    }))
  }

  display()
  {
    this.setVisible(true)
  }
}