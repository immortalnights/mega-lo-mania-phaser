import Phaser from 'phaser'
import Store from './store'
import Research from './sectorcontrols/research'
import ResearchController from './components/researchcontroller'
import { GameEvents } from "./defines"

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

    this.activeSector = 0

    this.store = new Store(this)
    this.store.addSector(0, '', 1)
    this.store.addSector(1, '', 1)
    this.store.addSector(2, '', 1)

    Object.assign(this, ResearchController)
    this.setupResearch(this)

    this.store.sectors[1].setup(1, null)
    this.store.sectors[2].setup(2, null)

    this.add.text(10, 5, "One").setInteractive().on('pointerdown', () => {
      this.activeSector = 0
    })
    this.add.text(50, 5, "Two").setInteractive().on('pointerdown', () => {
      this.activeSector = 1
    })
    this.add.text(100, 5, "Three").setInteractive().on('pointerdown', () => {
      this.activeSector = 2
    })

    const margin = 25
    const third = (width / 3)

    const views = [
      new Research(this, margin, 50),
      new Research(this, margin + third, 50),
      new Research(this, margin + (third * 2), 50),
    ]

    
    views.forEach((view, index) => {
      this.add.existing(view)
      view.display(this.store.sectors[index])
    })

    // Normally handled by the SectorController
    this.events.on(GameEvents.RESEARCH_CHANGED, sector => {
      views[sector.id].display(sector)
    })
  }

  update(time, delta)
  {
    this.store.tick(time, delta)
  }
}