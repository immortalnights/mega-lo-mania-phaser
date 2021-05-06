import Phaser from 'phaser'

export default class Word extends Phaser.GameObjects.Container
{
  constructor(scene, x, y, word)
  {
    super(scene, x, y)

    this.setWord(word)
  }

  setWord(word)
  {
    this.removeAll(true)

    let xOffset = -(6 * (word.length / 2))
    for (let i = 0; i < word.length; i++)
    {
      if (word[i] !== " ")
      {
        const image = new Phaser.GameObjects.Image(this.scene, xOffset, 0, 'mlm_icons', word[i])
        image.setOrigin(0.5, 1)
        this.add(image)
      }

      xOffset += 6
    }
  }
}