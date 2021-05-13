import Phaser from 'phaser'
import ordinal from 'ordinal'
import MiniMap from '../components/minimap'
import Portrait from '../components/portrait'
import ValueControl from '../components/valuecontrol'
import Word from '../components/word'
import { BuildingTypes, UserEvents } from '../defines'
import { allocateOrDeallocate } from '../utilities'
// import islands from '../data/isands.json'

const SceneStates = {
  PLAYER_SELECT_ISLAND: 'player_select_island',
  PLAYER_SELECT_SECTOR_AND_POP: 'player_select_sector_and_pop',
  AI_SECTOR_SELECTION: 'ai_sector_selection',
  ISLAND_START_COUNTDOWN: 'island_start_countdown'
}

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

  init(options)
  {
    console.log("init")

    const team = this.game.registry.get('team')
    const level = this.game.registry.get('level')

    this.data.set({
      team,
      level,
      island: undefined,
      available: this.game.registry.get('population'),
      allocated: 0,
    })

    this.state = SceneStates.PLAYER_SELECT_ISLAND
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
    const remainingIslands = islands.filter(i => {
      return completedIslands.includes(i) === false
    })

    this.data.set({ remainingIslands })

    // Assign opponents to each island so that they remain static if the player changes the selected island
    const opponents = ['red', 'green', 'blue', 'yellow'].filter(t => t !== playerTeam)
    islands.forEach(island => {
      island.opponents = []

      const available = [ ...opponents ]
      for (let count = 1; count < island.players; count++)
      {
        const index = Phaser.Math.RND.between(0, available.length - 1)
        island.opponents.push(available[index])
        available.splice(index, 1)
      }
    })

    this.add.image(width / 2, height / 2, 'sunrise')

    const islandPositions = [
      { x: 200, y: 155 },
      { x: 250, y: 200 },
      { x: 325, y: 150 }
    ]
    const xOffset = 105
    const yOffset = [ 140, 150, 166, 205, 215, 250 ]

    this.selectedIsland = undefined

    this.map = new MiniMap(this, 110, 90)
    this.add.existing(this.map)

    this.playerPortrait = new Portrait(this, 165, 80, playerTeam)
    this.add.existing(this.playerPortrait)

    this.opponentPortraits = new OpponentPortraitContainer(this, 360, 80)
    this.add.existing(this.opponentPortraits)

    this.islandNameWord = new Word(this, xOffset, yOffset[0], "noname")
    this.add.existing(this.islandNameWord)
    this.add.existing(new Word(this, xOffset, yOffset[1], "of the"))
    this.epochWord = new Word(this, xOffset, yOffset[2], `x EPOCH`)
    this.add.existing(this.epochWord)

    this.defaultControls = this.add.group()

    // const optionsWord = new Word(this, xOffset, yOffset[3], `OPTIONS`)
    // optionsWord.setInteractive()
    // this.add.existing(optionsWord)
    // this.defaultControls.add(optionsWord)

    const playIslandWord = new Word(this, xOffset, yOffset[4], `PLAY ISLAND`)
    playIslandWord.setInteractive()
    playIslandWord.on('pointerdown', this.onPlayIsland, this)
    this.add.existing(playIslandWord)
    this.defaultControls.add(playIslandWord)

    this.beginPlayControls = this.add.group()
    this.beginPlayControls.add(this.add.image(100, yOffset[3] - 20, 'mlm_icons', 'arrow_up'))
    this.allocatedPopulation = this.add.existing(new ValueControl(this, 100, yOffset[3], 'castle_icon', 0))
    this.allocatedPopulation.on(UserEvents.VALUE_CHANGE, this.onChangeAllocatedPopulation, this)
    this.beginPlayControls.add(this.allocatedPopulation)
    this.beginPlayControls.add(this.add.image(100, yOffset[3] + 22, 'mlm_icons', 'arrow_up'))
    this.beginPlayControls.setVisible(false)

    this.population = new ValueControl(this, 100, yOffset[5], ``, 100)

    // Data-binding
    this.events.on(Phaser.Data.Events.CHANGE_DATA_KEY + 'available', (obj, val, prev) => {
      this.population.setValue(val)
    })
    this.events.on(Phaser.Data.Events.CHANGE_DATA_KEY + 'allocated', (obj, val, prev) => {
      this.allocatedPopulation.setValue(val)
    })

    this.islands = this.add.group()
    islands.forEach((island, index) => {
      const pos = islandPositions[index]
      const image = this.add.image(pos.x, pos.y, 'mlm_islands', island.name)
      this.islands.add(image)

      if (completedIslands.includes(island.name))
      {
        const flag = this.add.image(pos.x, pos.y, 'mlm_icons', `flag_${playerTeam}`)
        this.islands.add(flag)
      }
      else
      {
        // Only interactive if not complete
        image.setInteractive()
        image.on(Phaser.Input.Events.POINTER_DOWN, () => {
          this.onSelectIsland(island)
        })
      }
    })

    this.onSelectIsland(islands[0])

    // Bind to events
    this.events.on(UserEvents.SECTOR_MAP_SELECT, this.onSelectSector, this)

    this.debugText = this.add.text(0, height - 12, '', { fontSize: 10 })
  }

  canChangeIsland()
  {
    return [ SceneStates.PLAYER_SELECT_ISLAND, SceneStates.PLAYER_SELECT_SECTOR_AND_POP ].includes(this.state)
  }

  onSelectIsland(island)
  {
    if (this.canChangeIsland() === false)
    {
      console.warn(`Cannot cancel island at this point`)
    }
    else
    {
      this.onCancelPlayIsland()
  
      this.selectedIsland = island
  
      this.map.setIsland(island.style, island.map)
  
      this.opponentPortraits.removeAll()
      island.opponents.forEach(t => {
        this.opponentPortraits.addPortrait(t)
      })
  
      this.islandNameWord.setWord(island.name)
      this.epochWord.setWord(`${ordinal(island.epoch)} EPOCH`)
      this.population.setIcon(`population_epoch_${island.epoch}`)
    }
  }

  onPlayIsland()
  {
    this.state = SceneStates.PLAYER_SELECT_SECTOR_AND_POP
    this.defaultControls.setVisible(false)
    this.beginPlayControls.setVisible(true)
  }

  onChangeAllocatedPopulation(val)
  {
    // Semi-colon is required, else it doesn't destructuring the return array correctly
    let [ available, allocated, remainingIslands ] = this.data.get([ 'available', 'allocated', 'remainingIslands' ]);

    // ValueControl.getAvailable(val, availablePopulation allocatedPopulation)
    [ available, allocated ] = allocateOrDeallocate(available, allocated, val, remainingIslands.length - 1)

    this.data.set({ available, allocated })

    // this.allocatedPopulation.setValue(allocated)
    // this.population.setValue(available)
  }

  onSelectSector(pointer, index)
  {
    const [ allocated, team ] = this.data.get([ 'allocated', 'team' ])

    if (allocated > 0)
    {
      console.log(`Selected sector ${index}`)
      // Save the real allocated value, this is used to "enable" the cheat whereby
      // the player can deallocate the population before starting the sector.
      // "realAllocated" is used to determine the start population and "available"
      // determines how many is in the pool. Thus, "allocated" and "available" can be changed after the
      // sector is selected.
      this.data.set('realAllocated', allocated)
      this.map.onAddBuilding(index, BuildingTypes.CASTLE, team)
      this.state = SceneStates.AI_SECTOR_SELECTION
      this.time.delayedCall(1000, this.onPlaceAICallback, [], this)
    }
    else
    {
      console.warn(`Must have allocated population before selecting a sector`)
    }
  }

  onPlaceAICallback()
  {
    // If there are AI players without a sector, find an empty at random sector and place an AI there
    // If there are still AI players without a sector, wait a few seconds and run this function again
    // Else, start the island play count down (2s?) before switching to the game scene.
    // this.time.delayedCall(1000, this.onPlaceAICallback, [], this)
  }

  onCancelPlayIsland()
  {
    let [ available, allocated ] = this.data.get([ 'available', 'allocated' ])

    available = available + allocated
    allocated = 0

    this.data.set({ available, allocated })

    this.defaultControls.setVisible(true)
    this.beginPlayControls.setVisible(false)
  }

  update(time, delta)
  {
    const pointer = this.input.activePointer
    this.debugText.setText(`${pointer.x.toFixed(1)}, ${pointer.y.toFixed(1)}`)
  }
}