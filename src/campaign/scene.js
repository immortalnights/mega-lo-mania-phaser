import Phaser from 'phaser'
import MiniMap from '../components/minimap'
import ValueControl from '../components/valuecontrol'


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

    this.playerPortrait = undefined
    this.opponentPortraits = new Phaser.GameObjects.Container(this, 0, 0)

    this.islandNameText = this.add.text(36, 100, "Wonka").setOrigin(0.5, 0.5)
    const ofTheText = this.add.text(36, 112, "of the", { fontSize: 12 }).setOrigin(0.5, 0.5)
    this.islandNameText = this.add.text(36, 124, `8th Epoch`).setOrigin(0.5, 0.5)

    this.optionsText = this.add.text(36, 160, "Options").setOrigin(0.5, 0.5)
    this.playText = this.add.text(36, 180, "Play Island").setOrigin(0.5, 0.5)

    this.population = new ValueControl(this, 36, 200, `population_epoch_${1}`, 100)

    this.debugText = this.add.text(0, height - 12, '', { fontSize: 10 })
  }

  update(time, delta)
  {
    const pointer = this.input.activePointer
    this.debugText.setText(`${pointer.x.toFixed(1)}, ${pointer.y.toFixed(1)}`)
  }
}