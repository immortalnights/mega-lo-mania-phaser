import Phaser from 'phaser'
import Header from './header'
import Clock from '../clock'
import Task from '../task'
import Button from '../button'
import { BuildingTypes, GameEvents } from '../defines'

class SectorManager
{
  constructor(sector)
  {
    this.sector = sector
  }

  get epoch()
  {
    return this.sector.epoch
  }

  hasBuilding(type)
  {
    return this.sector.buildings[type] !== false
  }

  hasResearchedTechnology()
  {
    return Object.values(this.sector.technologies).some(t => t !== false)
  }

  hasRepairAvailable()
  {
    return false
  }

  hasDefenceAvailable()
  {
    return false
  }

  hasResearchAvailable()
  {
    return Object.values(this.sector.technologies).some(t => t === false)
  }

  hasProductionAvailable()
  {
    return false
  }
}

export class Root extends Phaser.GameObjects.Container
{
  constructor(scene, x, y)
  {
    super(scene, x, y)

    this.name = 'root'

    this.blueprintNav = new Button(this.scene, 10, 0, 'blueprint_icon', () => {
      this.parentContainer.emit('sectorcontrol:change_view', 'blueprints')
    })
    // this.blueprintNav.setVisible(false)

    this.repairNav = new Button(this.scene, 31, 0, 'repair_icon', () => {
      this.parentContainer.emit('sectorcontrol:change_view', 'repair')
    })
    // this.repairNav.setVisible(false)

    this.defenceNav = new Button(this.scene, 51, 0, 'defence_icon', () => {
      this.parentContainer.emit('sectorcontrol:change_view', 'defence')
    })
    // this.defenceNav.setVisible(false)

    this.offenceNav = new Button(this.scene, 72, 0, 'offence_icon', () => {
      this.parentContainer.emit('sectorcontrol:change_view', 'offence')
    })

    this.researchNavTask = new Task(this.scene, 10, 30, 'research_icon', 'research', () => {
      this.parentContainer.emit('sectorcontrol:change_view', 'research')
    })
    this.researchArrow = new Phaser.GameObjects.Image(this.scene, 25, 28, 'mlm_icons', 'arrow_left')

    this.population = new Task(this.scene, 40, 30, 'population_epoch_1', 'population')
    this.population.setDepth(1)

    this.factoryNavTask = new Task(this.scene, 72, 30, 'factory_icon', 'production')
    this.factoryArrow = new Phaser.GameObjects.Image(this.scene, 54, 28, 'mlm_icons', 'arrow_right')
    // this.factoryNavTask.setVisible(false)

    this.miningNav = new Button(this.scene, 50, 60, 'mine_spade_icon', () => {
      this.parentContainer.emit('sectorcontrol:change_view', 'mining')
    })
    // this.miningNav.setVisible(false)

    this.add([
      this.blueprintNav,
      this.repairNav,
      this.defenceNav,
      this.offenceNav,
      this.researchNavTask,
      this.researchArrow,
      this.population,
      this.factoryNavTask,
      this.factoryArrow,
      this.miningNav,
    ])
  }

  display()
  {
    this.setVisible(true)
  }
}

export class Blueprints extends Phaser.GameObjects.Container
{
  constructor(scene, x, y)
  {
    super(scene, x, y)

    this.name = 'blueprints'

    this.add(new Header(this.scene, 0, 0, 'blueprint_header', () => {
      this.parentContainer.emit('sectorcontrol:change_view', 'root')
    }))
  }

  display()
  {
    this.setVisible(true)
  }
}

export class Repair extends Phaser.GameObjects.Container
{
  constructor(scene, x, y)
  {
    super(scene, x, y)

    this.name = 'repair'

    this.add(new Header(this.scene, 0, 0, 'repair_header', () => {
      this.parentContainer.emit('sectorcontrol:change_view', 'root')
    }))
  }

  display()
  {
    this.setVisible(true)
  }
}

export class Defence extends Phaser.GameObjects.Container
{
  constructor(scene, x, y)
  {
    super(scene, x, y)

    this.name = 'defence'

    this.add(new Header(this.scene, 0, 0, 'defence_header', () => {
      this.parentContainer.emit('sectorcontrol:change_view', 'root')
    }))
  }

  display()
  {
    this.setVisible(true)
  }
}

export class Offence extends Phaser.GameObjects.Container
{
  constructor(scene, x, y)
  {
    super(scene, x, y)

    this.name = 'offence'

    this.add(new Header(this.scene, 0, 0, 'offence_header', () => {
      this.parentContainer.emit('sectorcontrol:change_view', 'root')
    }))
  }

  display()
  {
    this.setVisible(true)
  }
}

export class Production extends Phaser.GameObjects.Container
{
  constructor(scene, x, y)
  {
    super(scene, x, y)

    this.add(new Header(this.scene, 0, 0, 'production_header', () => {
      this.parentContainer.emit('sectorcontrol:change_view', 'root')
    }))
  }

  display()
  {
    this.setVisible(true)
  }
}

export class Mining extends Phaser.GameObjects.Container
{
  constructor(scene, x, y)
  {
    super(scene, x, y)

    this.name = 'mining'

    this.add(new Header(this.scene, 0, 0, 'mining_header', () => {
      this.parentContainer.emit('sectorcontrol:change_view', 'root')
    }))
  }

  display()
  {
    this.setVisible(true)
  }
}

export default class SectorControls extends Phaser.GameObjects.Container
{
  constructor(scene, x, y)
  {
    super(scene, x, y)

    this.islandName = new Phaser.GameObjects.Text(scene, 0, 0, 'Rumbaba', {
      fontFamily: 'Lucida Console',
      fontSize: 12,
    })
    this.islandName.setOrigin(0, 1)
    this.sectorDate = new Phaser.GameObjects.Text(scene, 55, 0, '1850', {
      fontFamily: 'Lucida Console',
      fontSize: 12,
    })
    this.sectorDate.setOrigin(0, 1)
    this.sectorDateNotation = new Phaser.GameObjects.Text(scene, 95, 0, 'AD', {
      fontFamily: 'Lucida Console',
      fontSize: 8,
    })
    this.sectorDateNotation.setOrigin(1, 1)

    this.add([ this.islandName, this.sectorDate, this.sectorDateNotation ])

    // this.add.existing(new Clock(this, 50, 200, 4))
    // this.add.existing(new Button(scene, 20, 120, 'blueprint_icon', ''))
    // this.add.existing(new Button(scene, 40, 120, 'repair_icon', ''))
    // this.add.existing(new Button(scene, 60, 120, 'defence_icon', ''))
    // this.add.existing(new Button(scene, 80, 120, 'offence_icon', ''))
    // this.add.existing(new Task(scene, 20, 150, 'research_icon', 'research'))
    // this.add.existing(new Task(scene, 50, 150, 'population_epoch_1', 'population'))
    // this.add.existing(new Task(scene, 80, 150, 'factory_icon', 'production'))
    // this.add.existing(new Task(scene, 50, 180, 'mine_spade_icon', 'mine'))

    this.scene.events.on(GameEvents.ACTIVATE_SECTOR, this.onSectorSelected, this)
    // Alliance state change - ability to claim sector changes
    // this.scene.events.on(GameEvents.ACTIVATE_SECTOR, this.onSectorSelected, this)
    // Army entered or left - ability to claim sector
    // this.scene.events.on(GameEvents.ACTIVATE_SECTOR, this.onSectorSelected, this)
    // Castle destroyed
    // this.scene.events.on(GameEvents.ACTIVATE_SECTOR, this.onSectorSelected, this)
  }

  onSectorSelected(sector)
  {
    const hasOwnArmy = armies => {
      return -1 !== armies.findIndex(army => {
        return /*army.team === localPlayer.team*/
      })
    }

    sector = new SectorManager(sector)
    this.on('sectorcontrol:change_view', this.onChangeView)

    const root = new Root(this.scene, 0, 20)
    this.add(root)

    const blueprints = new Blueprints(this.scene, 0, 0)
    this.add(blueprints)

    const repair = new Repair(this.scene, 0, 0)
    this.add(repair)

    const defence = new Defence(this.scene, 0, 0)
    this.add(defence)

    const offence = new Offence(this.scene, 0, 0)
    this.add(offence)

    const research = new Research(this.scene, 0, 0)
    this.add(research)

    const production = new Production(this.scene, 0, 0)
    this.add(production)

    const mining = new Mining(this.scene, 0, 0)
    this.add(mining)

    this.views = new Phaser.GameObjects.Group(this.scene, [
      root,
      blueprints,
      repair,
      defence,
      offence,
      research,
      production,
      mining,
    ])

    this.views.setVisible(false)

    const castle = sector.hasBuilding(BuildingTypes.CASTLE)
    if (castle /* && castle.team === localPlayer.team*/)
    {
      this.onChangeView('root')
    }
    else if (sector.armies.length > 0 && hasOwnArmy(sector.armies) /* && localPlayer.isNotInAlliance*/)
    {
      console.log("claim!")
    }
    else
    {
      // Nothing displayed.
      console.log("Nothing")
    }
  }

  onChangeView(name, ...rest)
  {
    this.views.setVisible(false)

    const view = this.views.getChildren().find(view => view.name === name)
    if (view == null)
    {
      console.warn(`Unknown view name ${name}`)
    }
    else
    {
      view.display(...rest)
    }

    // switch (name)
    // {
    //   case 'root':
    //   {
    //     this.displayRoot(...rest)
    //     break
    //   }
    //   case 'blueprints':
    //   {
    //     this.displayBlueprints(...rest)
    //     break
    //   }
    //   case 'repair':
    //   {
    //     this.displayRepair(...rest)
    //     break
    //   }
    //   case 'defence':
    //   {
    //     this.displayDefence(...rest)
    //     break
    //   }
    //   case 'offence':
    //   {
    //     this.displayOffence(...rest)
    //     break
    //   }
    //   case 'research':
    //   {
    //     this.displayResearch(...rest)
    //     break
    //   }
    //   case 'production':
    //   {
    //     this.displayProduction(...rest)
    //     break
    //   }
    //   case 'mining':
    //   {
    //     this.displayMining(...rest)
    //     break
    //   }
    //   default:
    //   {
    //     console.warn(`Unknown view name ${name}`)
    //     break
    //   }
    // }
  }

  displayRoot(sector)
  {
    this.root.setVisible(true)

    // blueprintNav.setVisible(sector.hasResearchedTechnology())
    // repairNav.setVisible(sector.hasRepairAvailable())
    // defenceNav.setVisible(sector.hasDefenceAvailable())
    // researchNavTask.setVisible(sector.hasResearchAvailable())
    // factoryNavTask.setVisible(sector.hasProductionAvailable())
  }

  displayBlueprints()
  {
    this.hideAll()
    this.blueprints.setVisible(true)
  }

  displayRepair()
  {
    this.hideAll()
    this.repair.setVisible(true)
  }

  displayDefence()
  {
    this.hideAll()
    this.defence.setVisible(true)
  }

  displayOffence()
  {
    this.hideAll()
    this.offence.setVisible(true)
  }

  displayResearch()
  {
    this.hideAll()
    this.research.setVisible(true)
  }

  displayProduction()
  {
    this.hideAll()
    this.production.setVisible(true)
  }

  displayMining()
  {
    this.hideAll()
    this.mining.setVisible(true)
  }
}