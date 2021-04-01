// 

export class Mining extends Phaser.GameObjects.Container
{
  constructor(scene, x, y)
  {
    super(scene, x, y)

    this.name = 'mining'

    this.add(new Header(this.scene, 0, 0, 'mining_header', () => {
      this.parentContainer.emit('sectorcontrol:change_view', 'root')
    }))
  }

  display()
  {
    this.setVisible(true)
  }
}mining