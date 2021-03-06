import Phaser from 'phaser'
import Store from './island/data/store'
import Root from './island/sectorcontrols/root'
import Blueprints from './island/sectorcontrols/blueprints'
import Repair from './island/sectorcontrols/repair'
import Defense from './island/sectorcontrols/defense'
import Offense from './island/sectorcontrols/offense'
import Research from './island/sectorcontrols/research'
import Production from './island/sectorcontrols/production'
import Mining from './island/sectorcontrols/mining'
import Construction from './island/sectorcontrols/construction'
import { GameEvents, Teams, UserEvents } from "./defines"


class SectorControl extends Phaser.GameObjects.Container
{
  constructor(scene, x, y)
  {
    super(scene, x, y)

    this.activeSector = undefined

    const sceneZoom = this.scene.game.config.zoom
    this.setSize(165 / sceneZoom, 185 / sceneZoom)

    this.root = new Root(scene, 0, -100)
    this.add(this.root)

    this.blueprintView = new Blueprints(scene, -120, 40)
    this.add(this.blueprintView)

    this.researchView = new Research(scene, -120, -120, {
      header: 'research_header',
    })
    this.researchView.on('technology:selected', technology => {
      this.scene.events.emit(UserEvents.SELECT_RESEARCH, technology)
    })
    this.add(this.researchView)

    this.repairView = new Repair(scene, 120, -120)
    this.add(this.repairView)

    this.defenseView = new Defense(scene, 120, -40)
    // this.add(this.defenseView)

    this.offenseView = new Offense(scene, 120, -40)
    this.add(this.offenseView)

    this.productionView = new Production(scene, 120, 30)
    this.productionView.on('technology:selected', technology => {
      this.scene.events.emit(UserEvents.SELECT_PRODUCTION, technology)
    })
    this.add(this.productionView)

    this.miningView = new Mining(scene, 0, 30)
    this.add(this.miningView)

    this.constructionView = new Construction(scene, 120, 30)
    // this.add(this.constructionView)


    // Game events
    this.scene.events.on(GameEvents.RESOURCES_CHANGED, sector => {
      if (this.activeSector === sector.id)
      {
        // TODO - only need to update the active controls
        this.root.display(sector)
        this.blueprintView.display(sector)
        this.miningView.display(sector)
        this.researchView.display(sector)
        this.repairView.display(sector)
        this.offenseView.display(sector)
        this.productionView.display(sector)
      }
    })

    this.scene.events.on(GameEvents.POPULATION_CHANGED, sector => {
      if (this.activeSector === sector.id)
      {
        this.root.display(sector)
        this.repairView.display(sector)
        this.defenseView.display(sector)
        this.offenseView.display(sector)
        this.researchView.display(sector)
        this.productionView.display(sector)
        this.miningView.display(sector)
        this.constructionView.display(sector)
      }
    })

    this.scene.events.on(GameEvents.ARMY_CHANGED, sector => {
      if (this.activeSector === sector.id)
      {
        this.root.display(sector)
        this.repairView.display(sector)
        this.offenseView.display(sector)
      }
    })

    this.scene.events.on(GameEvents.RESEARCH_CHANGED, sector => {
      if (this.activeSector === sector.id)
      {
        this.root.display(sector)
        this.researchView.display(sector)

        // only required in this Sandbox sector control view
        this.blueprintView.display(sector)
        this.repairView.display(sector)
        this.defenseView.display(sector)
        this.offenseView.display(sector)
        this.productionView.display(sector)
        this.miningView.display(sector)
        this.constructionView.display(sector)
      }
    })

    this.scene.events.on(GameEvents.PRODUCTION_CHANGED, sector => {
      if (this.activeSector === sector.id)
      {
        this.root.display(sector)
        this.productionView.display(sector)

        // Sandbox must update all affected views
        this.offenseView.display(sector)
      }
    })

    // 
    const displayAlignmentHelper = false
    if (displayAlignmentHelper)
    {
      // console.log("parent", this.parentContainer.width, this.parentContainer.height)
      console.log("cont", this.width, this.height)

      const box = new Phaser.GameObjects.Rectangle(this.scene, 0, 0, this.width, this.height)
      box.setStrokeStyle(1, 0xFF00FF, 0.2)
      this.add(box)

      this.setInteractive()
      const boxDebugText = this.scene.add.text(0, 280, '')
      this.on(Phaser.Input.Events.POINTER_MOVE, (pointer, localX, localY, event) => {
        localX = localX - (this.width / 2)
        localY = localY - (this.height / 2)
        boxDebugText.setText(`${localX}, ${localY}`)
      })

      this.add(new Phaser.GameObjects.Line(this.scene, 0, 0, 0, 0, this.width, this.height, 0xFF00FF, 0.2))
      this.add(new Phaser.GameObjects.Line(this.scene, 0, 0, this.width, 0, 0, this.height, 0xFF00FF, 0.2))
    }
  }

  setSector(sector)
  {
    this.activeSector = sector.id
    this.root.display(sector)
    this.blueprintView.display(sector)
    this.repairView.display(sector)
    this.defenseView.display(sector)
    this.offenseView.display(sector)
    this.researchView.display(sector)
    this.productionView.display(sector)
    this.miningView.display(sector)
    this.constructionView.display(sector)
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
    this.load.image('template', './template.png')
  }

  create()
  {
    const { width, height } = this.sys.game.canvas

    this.activeSector = undefined

    // this.add.image(width / 2, height / 2, 'template').setScale(0.5, 0.5).setAlpha(0.25)

    this.store = new Store(this, {})
    this.store.addSector(0, '', 1)
    this.store.addSector(1, '', 1)
    this.store.addSector(2, '', 1)

    this.store.sectors[0].setup(4, ["rock", "slate", "solarium", "herbirite"])
    this.store.sectors[1].setup(7, ["parasite", "aquarium", "onion", "tedium"])
    this.store.sectors[2].setup(1, ["rock", "slate"])

    // Claims
    this.store.sectors[0].claim(Teams.GREEN, 90)
    this.store.sectors[1].claim(Teams.RED, 20)
    this.store.sectors[2].claim(Teams.BLUE, 40)

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

    this.events.on(UserEvents.SELECT_RESEARCH, technology => {
      this.store.sectors[this.activeSector].beginResearch(technology)
    });
    this.events.on(UserEvents.SELECT_PRODUCTION, technology => {
      this.store.sectors[this.activeSector].beginProduction(technology)
    });

    this.events.on(UserEvents.CHANGE_MINERS, (...args) => {
      this.store.changeMiners(this.activeSector, ...args)
    })
    this.events.on(UserEvents.CHANGE_RESEARCHERS, (...args) => {
      this.store.changeResearchers(this.activeSector, ...args)
    })
    this.events.on(UserEvents.CHANGE_BUILDERS, (...args) => {
      this.store.changeBuilders(this.activeSector, ...args)
    })
    this.events.on(UserEvents.CHANGE_MANUFACTURERS, (...args) => {
      this.store.changeManufacturers(this.activeSector, ...args)
    })
    this.events.on(UserEvents.CHANGE_PRODUCTION_RUNS, (...args) => {
      this.store.changeProductionRuns(this.activeSector, ...args)
    })

    this.events.on(UserEvents.ADD_TO_ARMY, (...args) => {
      this.store.addToArmy(this.activeSector, ...args)
    })
    this.events.on(UserEvents.DISCARD_ARMY_IN_HAND, (...args) => {
      this.store.discardPendingArmy(this.activeSector, ...args)
    })

    // Alerts
    this.events.on(GameEvents.ADVANCED_TECH_LEVEL, sector => {
      console.log(`Sector ${sector.id} has advanced a technology level ${sector.epoch}`)
    })
    this.events.on(GameEvents.RESOURCE_DEPLETED, (sector, resource) => {
      // TODO Check the sector owner is the current player team
      console.log(`Resource ${resource.name} has depleted in sector ${sector.id}`)
    })
    this.events.on(GameEvents.RESEARCH_COMPLETED, sector => {
      // TODO Check the sector owner is the current player team
      console.log(`Research of ${sector.research.name} completed in sector ${sector.id}`)
    })
    this.events.on(GameEvents.BUILDING_CONSTRUCTED, (sector, building) => {
      // TODO Check the sector owner is the current player team
      console.log(`Construction of ${building} completed in sector ${sector.id}`)
    })
    this.events.on(GameEvents.PRODUCTION_COMPLETED, sector => {
      // TODO Check the sector owner is the current player team
      console.log(`Production of ${sector.production.name} completed in sector ${sector.id}`)
    })
    this.events.on(GameEvents.PRODUCTION_RUN_COMPLETED, sector => {
      // TODO Check the sector owner is the current player team
      console.log(`Production run of ${sector.production.name} completed in sector ${sector.id}`)
    })

    this.debugText = this.add.text(0, height - 40, '')
  }

  update(time, delta)
  {
    const pointer = this.input.activePointer
    this.debugText.setText(`${pointer.x.toFixed(1)}, ${pointer.y.toFixed(1)}`)

    this.store.tick(time, delta)
  }
}