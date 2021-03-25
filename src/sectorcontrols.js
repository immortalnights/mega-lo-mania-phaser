import Phaser from 'phaser'
import Clock from './clock'
import Task from './task'
import Button from './button'
import { BuildingTypes, GameEvents } from './defines'

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

    const castle = sector.hasBuilding(BuildingTypes.CASTLE)
    if (castle /* && castle.team === localPlayer.team*/)
    {
      this.root(sector)
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

  root(sector)
  {
    const researchIcon = sector.hasBuilding(BuildingTypes.LABORATORY) ? 'advanced_research_icon' : 'research_icon'
    const populationIcon = `population_epoch_${sector.epoch}`

    const blueprintNav = new Button(this.scene, -30, -25, 'blueprint_icon', '')
    const repairNav = new Button(this.scene, -10, -25, 'repair_icon', '')
    const defenceNav = new Button(this.scene, 10, -25, 'defence_icon', '')
    const offenceNav = new Button(this.scene, 30, -25, 'offence_icon', '')
    const researchNavTask = new Task(this.scene, -30, 0, researchIcon, 'research')
    const population = new Task(this.scene, 0, 0, populationIcon, 'population')
    const factoryNavTask = new Task(this.scene, 30, 0, 'factory_icon', 'production')
    const miningNav = new Button(this.scene, 0, 30, 'mine_spade_icon', 'mine')

    this.add([ blueprintNav,
      repairNav,
      defenceNav,
      offenceNav,
      researchNavTask,
      population,
      factoryNavTask,
      miningNav ])

    // blueprintNav.setVisible(sector.hasResearchedTechnology())
    // repairNav.setVisible(sector.hasRepairAvailable())
    // defenceNav.setVisible(sector.hasDefenceAvailable())
    // researchNavTask.setVisible(sector.hasResearchAvailable())
    // factoryNavTask.setVisible(sector.hasProductionAvailable())
  }
}