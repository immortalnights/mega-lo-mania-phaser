import Phaser from 'phaser'
import Header from './header'
import Clock from '../clock'
import Task from '../task'
import Button from '../button'
import { BuildingTypes, GameEvents } from '../defines'


// merge with Sector (data)!
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

export default class SectorControls extends Phaser.GameObjects.Container
{
  constructor(scene, x, y)
  {
    super(scene, x, y)

    // this.add.existing(new Clock(this, 50, 200, 4))
    // this.add.existing(new Button(scene, 20, 120, 'blueprint_icon', ''))
    // this.add.existing(new Button(scene, 40, 120, 'repair_icon', ''))
    // this.add.existing(new Button(scene, 60, 120, 'defence_icon', ''))
    // this.add.existing(new Button(scene, 80, 120, 'offense_icon', ''))
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

    const offense = new Offense(this.scene, 0, 0)
    this.add(offense)

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
      offense,
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

  displayOffense()
  {
    this.hideAll()
    this.offense.setVisible(true)
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