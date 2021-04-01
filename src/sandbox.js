import Phaser from 'phaser'
import Store from './store'
import { Root } from './sectorcontrols/'
import Research from './sectorcontrols/research'
import ResearchController from './components/researchcontroller'
import { GameEvents, Teams, UserEvents } from "./defines"
import SectorControls from './sectorcontrols'

class SectorControl extends Phaser.GameObjects.Container
{
  constructor(scene, x, y)
  {
    super(scene, x, y)

    this.activeSector = undefined

    this.root = new Root(scene, -50, -50)
    this.add(this.root)
    this.researchView = new Research(scene, -150, -50)
    this.add(this.researchView)

    this.scene.events.on(GameEvents.RESEARCH_CHANGED, sector => {
      if (this.activeSector === sector.id)
      {
        this.researchView.display(sector)
      }
    })
  }

  setSector(sector)
  {
    this.activeSector = sector.id
    this.root.display(sector)
    this.researchView.display(sector)
  }
}


export default class Sandbox extends Phaser.Scene
{
  constructor(config)
  {
    super({
      ...config,
      key: 'sandbox',
      physics: {
        default: 'arcade',
        arcade: {
          debug: false
        }
      },
    })

    window.SANDBOX_SCENE = this
  }

  preload()
  {
  }

  create()
  {
    const { width, height } = this.sys.game.canvas

    this.activeSector = undefined

    this.store = new Store(this)
    this.store.addSector(0, '', 1)
    this.store.addSector(1, '', 1)
    this.store.addSector(2, '', 1)

    Object.assign(this, ResearchController)
    this.setupResearch(this)

    this.store.sectors[1].setup(1, null)
    this.store.sectors[2].setup(3, null)

    // Claims
    this.store.sectors[1].claim(Teams.RED, 100)
    this.store.sectors[2].claim(Teams.BLUE, 10)

    const sectorControl = new SectorControl(this, width / 2, height / 2)
    this.add.existing(sectorControl)

    const sectorSelectors = []

    sectorSelectors.push(this.add.text(10, 5, "One"))
    sectorSelectors.push(this.add.text(50, 5, "Two"))
    sectorSelectors.push(this.add.text(100, 5, "Three"))

    const changeSector = index => {
      sectorSelectors.forEach(text => text.setColor('#555'))
      sectorSelectors[index].setColor('#FFF')
      this.activeSector = index
      sectorControl.setSector(this.store.sectors[this.activeSector])
    }

    // Set the current sector
    changeSector(0)

    sectorSelectors.forEach((text, index) => {
      text.setInteractive()
      text.on('pointerdown', changeSector.bind(this, index))
    })

    this.events.on(UserEvents.ALLOCATE_POPULATION, (...args) => {
      this.store.allocatePopulation(this.activeSector, ...args)
    })
    this.events.on(UserEvents.DEALLOCATE_POPULATION, (...args) => {
      this.store.deallocatePopulation(this.activeSector, ...args)
    })

    this.events.on(GameEvents.RESEARCH_COMPLETED, sector => {
      // TODO Check the sector owner is the current player team
      console.log(`Research of ${sector.research.name} completed in sector ${sector.id}`)
    })
  }

  update(time, delta)
  {
    this.store.tick(time, delta)
  }
}