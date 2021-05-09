import Phaser from 'phaser'
import ordinal from 'ordinal'
import MiniMap from '../components/minimap'
import Portrait from '../components/portrait'
import ValueControl from '../components/valuecontrol'
import Word from '../components/word'
// import islands from '../data/isands.json'

class OpponentPortraitContainer extends Phaser.GameObjects.Container
{
  constructor(scene, x, y)
  {
    super(scene, x, y)
  }

  addPortrait(team)
  {
    const xOffset = -(this.length * 50)
    this.add(new Portrait(this.scene, xOffset, 0, team))
  }
}

export default class CampaignScene extends Phaser.Scene
{
  constructor(config)
  {
    super({
      ...config,
      key: 'campaign',
    })
  }

  preload()
  {
  }

  create()
  {
    const { width, height } = this.sys.game.canvas

    const playerTeam = this.game.registry.get('team')
    const level = this.game.registry.get('level')
    const completedIslands = this.game.registry.get('completedIslands') 
    const islands = this.cache.json.get('islands').filter(i => {
      return i.epoch === level
    })

    // Assign opponents to each island so that they remain static if the player changes the selected island
    const opponents = ['red', 'green', 'blue', 'yellow'].filter(t => t !== playerTeam)
    islands.forEach(island => {
      island.opponents = []

      const available = [ ...opponents ]
      for (let count = 1; count < island.players; count++)
      {
        const index = Phaser.Math.RND.between(0, available.length)
        island.opponents.push(available[index])
        available.splice(index, 1)
      }
    })

    this.add.image(width / 2, height / 2, 'sunrise')

    const islandLocations = [
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 }
    ]
    const xOffset = 105
    const yOffset = [ 140, 150, 166, 190, 220, 250 ]

    this.selectedIsland = islands[0]

    this.map = new MiniMap(this, 110, 90, [])
    this.add.existing(this.map)

    this.playerPortrait = new Portrait(this, 165, 80, playerTeam)
    this.add.existing(this.playerPortrait)

    this.opponentPortraits = new OpponentPortraitContainer(this, 360, 80)
    this.add.existing(this.opponentPortraits)

    this.islandNameWord = new Word(this, xOffset, yOffset[0], "")
    this.add.existing(this.islandNameWord)
    const ofTheWord = this.add.existing(new Word(this, xOffset, yOffset[1], "of the"))
    this.epochWord = new Word(this, xOffset, yOffset[2], `? EPOCH`)
    this.add.existing(this.epochWord)

    // const optionsWord = new Word(this, xOffset, yOffset[3], `OPTIONS`)
    // optionsWord.setInteractive()
    // this.add.existing(optionsWord)

    const playIslandWord = new Word(this, xOffset, yOffset[4], `PLAY ISLAND`)
    playIslandWord.setInteractive()
    playIslandWord.on('pointerdown', () => {

    })
    this.add.existing(playIslandWord)

    this.population = new ValueControl(this, 100, yOffset[5], ``, 100)

    this.onSelectIsland(islands[0])

    this.debugText = this.add.text(0, height - 12, '', { fontSize: 10 })
  }

  onSelectIsland(island)
  {
    this.selectedIsland = island

    // this.map.setIsland(island)

    this.opponentPortraits.removeAll()
    island.opponents.forEach(t => {
      this.opponentPortraits.addPortrait(t)
    })

    this.islandNameWord.setWord(island.name)
    this.epochWord.setWord(`${ordinal(island.epoch)} EPOCH 1234567890`)
    this.population.setIcon(`population_epoch_${island.epoch}`)
  }

  update(time, delta)
  {
    const pointer = this.input.activePointer
    this.debugText.setText(`${pointer.x.toFixed(1)}, ${pointer.y.toFixed(1)}`)
  }
}