import Phaser from 'phaser'

export default class BlockText extends Phaser.GameObjects.Container
{
  constructor(scene, x, y, text)
  {
    super(scene, x, y)

    this.once(Phaser.Data.Events.SET_DATA, (obj, key, data) => {
      if (key === 'text')
      {
        this.onTextChange(obj, data, undefined)
      }
    })
    this.on(`${Phaser.Data.Events.CHANGE_DATA_KEY}text`, this.onTextChange)
    this.setData({ text })

    const setTint = (item, tint) => {
      item.setTint(tint)
    }

    this.on(Phaser.Input.Events.POINTER_OVER, () => {
      this.list.forEach(i => setTint(i, 0xFF0000))
    })
    this.on(Phaser.Input.Events.POINTER_OUT, () => {
      this.list.forEach(i => setTint(i, 0xFFFFFF))
    })
  }

  getTextLength()
  {
    return this.getData('text').length * 6
  }

  setInteractive()
  {
    this.setSize(1 + this.getTextLength(), 16)
    super.setInteractive()
  }

  setText(text)
  {
    this.setData({ text })
  }

  onTextChange(self, text, prev)
  {
    this.removeAll(true)

    let xOffset = -((-6 + this.getTextLength()) / 2)
    for (let i = 0; i < text.length; i++)
    {
      const letter = text[i]
      if (letter !== " ")
      {
        let yOffset = 0
        // Lower case are smaller
        yOffset += (letter === letter.toLowerCase()) ? 4 : 0
        // Numbers are larger
        yOffset += isNaN(Number(letter)) ? 0 : -4

        const image = new Phaser.GameObjects.Image(this.scene, xOffset, yOffset, 'mlm_icons', letter)
        this.add(image)
      }

      xOffset += 6
    }

    // const length = 1 + (this.getTextLength() / 2)
    // const gfx = new Phaser.GameObjects.Graphics(this.scene, { x: 0, y: 0 })
    // gfx.fillStyle(0xFF0000, 1)
    // // gfx.fillRect(-1, -1, 3, 3)
    // gfx.fillRect(0, 0, length, 1)
    // gfx.fillStyle(0x00FF00, 1)
    // gfx.fillRect(-length, 0, length, 1)
    // this.add(gfx)

    this.setSize(length, 16)
  }
}