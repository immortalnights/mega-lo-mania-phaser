import Phaser from 'phaser'

export default class Clock extends Phaser.GameObjects.Sprite
{
  constructor(scene, x, y, duration)
  {
    super(scene, x, y, 'mlm_icons', 'clock_00')

    this.label = scene.add.text(x - 1, y + 12, '', { fontSize: 10 }).setOrigin(0.5, 0.5)

    this.setData({ duration })

    this.onUpdateDuration(duration)
    this.on('changedata-duration', (obj, val, prev) => {
      this.onUpdateDuration(val)
    })
  }

  onUpdateDuration(duration)
  {
    const ticks = Math.max(Math.floor(duration / 12), 0)
    const frame = Math.ceil(duration % 12).toFixed(0).padStart(2, '0')
    this.setFrame(`clock_${frame}`)

    this.label.setText(ticks)
  }

  preUpdate(time, delta)
  {
    if (this.getData('duration') > 0)
    {
      this.incData('duration', -(delta / 1000))
    }
  }
}