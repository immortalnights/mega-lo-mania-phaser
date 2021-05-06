import Phaser from 'phaser'
import MiniMap from '../components/minimap'
import Portrait from '../components/portrait'
import ValueControl from '../components/valuecontrol'
import Word from '../components/word'


export default class CampaignScene extends Phaser.Scene
{
  constructor(config)
  {
    super({
      ...config,
      key: 'campaign',
    })
  }

  create()
  {
    const { width, height } = this.sys.game.canvas

    this.map = new MiniMap(this, 44, 64, {
      style: 'volcanic',
      map: [
        1, 1, 1, 1,
        1, 0, 0, 1,
        1, 0, 0, 1,
        1, 1, 1, 1
      ]
    })
    this.add.existing(this.map)

    this.playerPortrait = new Portrait(this, 100, 52, 'red')
    this.add.existing(this.playerPortrait)
    this.opponentPortraits = new Phaser.GameObjects.Container(this, 0, 0)

    this.islandNameWord = new Word(this, 40, 110, "Wonka")
    this.add.existing(this.islandNameWord)
    const ofTheWord = this.add.existing(new Word(this, 40, 120, "of the"))
    this.epochWord = new Word(this, 40, 136, `8TH EPOCH`)
    this.add.existing(this.epochWord)

    // const optionsWord = new Word(this, 40, 166, `OPTIONS`)
    // optionsWord.setInteractive()
    // this.add.existing(optionsWord)

    const playIslandWord = new Word(this, 40, 196, `PLAY ISLAND`)
    playIslandWord.setInteractive()
    this.add.existing(playIslandWord)

    this.population = new ValueControl(this, 40, 226, `population_epoch_${1}`, 100)

    this.debugText = this.add.text(0, height - 12, '', { fontSize: 10 })
  }

  update(time, delta)
  {
    const pointer = this.input.activePointer
    this.debugText.setText(`${pointer.x.toFixed(1)}, ${pointer.y.toFixed(1)}`)
  }
}