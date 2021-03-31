import Phaser from 'phaser'

export default class Clock extends Phaser.GameObjects.Container
{
  constructor(scene, x, y, duration = Infinity)
  {
    super(scene, x, y)

    this.icon = new Phaser.GameObjects.Sprite(scene, 0, 0, 'mlm_icons', 'clock_00')
    this.label = new Phaser.GameObjects.Text(scene, 0, 12, '0', { fontSize: 10 }).setOrigin(0.5, 0.5)
    this.infinity = new Phaser.GameObjects.Image(scene, 0, 13, 'mlm_icons', 'infinity_inactive')
    this.add([ this.icon, this.label, this.infinity ])

    this.setData({ active: false, duration })

    this.onUpdateDuration(duration)
    this.on('changedata-duration', (obj, val, prev) => {
      this.onUpdateDuration(val)
    })
  }

  setDuration(val)
  {
    if (val == null)
    {
      val = 0
    }

    this.setData('duration', val)
  }

  onUpdateDuration(duration)
  {
    if (duration !== Infinity)
    {
      const ticks = Math.max(Math.floor(duration / 12), 0)
      const frame = Math.ceil(duration % 12).toFixed(0).padStart(2, '0')
      this.icon.setFrame(`clock_${frame}`)

      this.label.setText(ticks)
      this.label.setVisible(true)
      this.infinity.setVisible(false)
    }
    else
    {
      this.icon.setFrame(`clock_12`)
      this.label.setVisible(false)
      this.infinity.setVisible(true)
    }
  }

  preUpdate(time, delta)
  {
    if (this.getData('active') === true && this.getData('duration') > 0)
    {
      this.incData('duration', -(delta / 1000))
    }
  }
}