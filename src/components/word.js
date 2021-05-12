import Phaser from 'phaser'

export default class Word extends Phaser.GameObjects.Container
{
  constructor(scene, x, y, word)
  {
    super(scene, x, y)

    this.once(Phaser.Data.Events.SET_DATA, (obj, key, data) => {
      if (key === 'word')
      {
        this.onWordChange(obj, data, undefined)
      }
    })
    this.on(`${Phaser.Data.Events.CHANGE_DATA_KEY}word`, this.onWordChange)
    this.setData({ word })

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

  getWordLength()
  {
    return this.getData('word').length * 6
  }

  setInteractive()
  {
    this.setSize(1 + this.getWordLength(), 16)
    super.setInteractive()
  }

  setWord(word)
  {
    this.setData({ word })
  }

  onWordChange(self, word, prev)
  {
    this.removeAll(true)

    let xOffset = -((-6 + this.getWordLength()) / 2)
    for (let i = 0; i < word.length; i++)
    {
      const letter = word[i]
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

    // const length = 1 + (this.getWordLength() / 2)
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