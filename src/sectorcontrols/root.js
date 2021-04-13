import Phaser from 'phaser'
import Button from '../button'
import Task from '../task'
import SectorLabel from './sectorlabel'
import ValueControl from './valuecontrol'


export default class Root extends Phaser.GameObjects.Container
{
  constructor(scene, x, y)
  {
    super(scene, x, y)

    this.name = 'root'

    this.sectorLabel = new SectorLabel(this.scene, 0, -30)
    this.add(this.sectorLabel)

    this.blueprintNav = new Button(this.scene, -30, -22, 'blueprint_icon', () => {
      this.parentContainer.emit('sectorcontrol:change_view', 'blueprints')
    })

    this.repairNav = new Button(this.scene, -10, -22, 'repair_icon', () => {
      this.parentContainer.emit('sectorcontrol:change_view', 'repair')
    })
    this.repairArrow = new Phaser.GameObjects.Image(this.scene, -10, -10, 'mlm_icons', 'arrow_up_left')

    this.defenceNav = new Button(this.scene, 10, -22, 'defence_icon', () => {
      this.parentContainer.emit('sectorcontrol:change_view', 'defence')
    })
    this.defenceArrow = new Phaser.GameObjects.Image(this.scene, 10, -10, 'mlm_icons', 'arrow_up_right_1')

    this.offenseNav = new Button(this.scene, 32, -22, 'offense_icon', () => {
      this.parentContainer.emit('sectorcontrol:change_view', 'offense')
    })
    this.offenseArrow = new Phaser.GameObjects.Image(this.scene, 18, -10, 'mlm_icons', 'arrow_up_right_0')

    this.researchNavTask = new Task(this.scene, -30, 0, 'research_icon', 'research', () => {
      this.parentContainer.emit('sectorcontrol:change_view', 'research')
    })
    this.researchArrow = new Phaser.GameObjects.Image(this.scene, -16, 0, 'mlm_icons', 'arrow_left')

    this.population = new ValueControl(this.scene, 0, 0, 'population_epoch_1', 1)
    this.population.setDepth(1)

    this.productionNavTask = new Task(this.scene, 32, 0, 'factory_icon', 'production')
    this.productionArrow = new Phaser.GameObjects.Image(this.scene, 15, 0, 'mlm_icons', 'arrow_right')

    this.miningNav = new Button(this.scene, 0, 36, 'mine_spade_icon', () => {
      this.parentContainer.emit('sectorcontrol:change_view', 'mining')
    })
    this.miningArrow = new Phaser.GameObjects.Image(this.scene, 0, 22, 'mlm_icons', 'arrow_down')

    this.add([
      this.blueprintNav,
      this.repairNav,
      this.repairArrow,
      this.defenceNav,
      this.defenceArrow,
      this.offenseNav,
      this.offenseArrow,
      this.researchNavTask,
      this.researchArrow,
      this.population,
      this.productionNavTask,
      this.productionArrow,
      this.miningNav,
      this.miningArrow,
    ])
  }

  display(sector)
  {
    this.setVisible(true)

    this.sectorLabel.display(sector)

    this.population.setValue(sector.availablePopulation)

    let blueprintsAvailable = false
    let repairAvailable = false
    let hasResourcesForRepair = false
    let defenceAvailable = false
    let hasResourcesForDefence = false
    let researchAvailable = false
    let productionAvailable = false
    let hasResourcesForProduction = false
    let miningAvailable = false
    for (const [key, val] of Object.entries(sector.technologies))
    {
      // console.log(key, val.researched)

      if (val.researched === true)
      {
        blueprintsAvailable = true
        const hasResourcesFor = sector.hasResourcesFor(val)

        switch (val.category)
        {
          case 'repair':
          {
            repairAvailable = true
            hasResourcesForRepair |= hasResourcesFor
            break
          }
          case 'defence':
          {
            defenceAvailable = true
            hasResourcesForDefence |= hasResourcesFor
            break
          }
        }

        if (val.produced === true)
        {
          productionAvailable = true
          hasResourcesForProduction |= hasResourcesFor
        }
      }
      else if (sector.hasResourcesFor(val))
      {
        researchAvailable = true
      }
    }

    this.blueprintNav.setVisible(blueprintsAvailable)
    this.repairNav.setVisible(repairAvailable)
    this.repairArrow.setVisible(repairAvailable && hasResourcesForRepair)
    this.defenceNav.setVisible(defenceAvailable)
    this.defenceArrow.setVisible(defenceAvailable && hasResourcesForDefence)
    this.researchNavTask.setVisible(researchAvailable)
    this.researchArrow.setVisible(researchAvailable)
    this.productionNavTask.setVisible(productionAvailable && hasResourcesForProduction)
    this.productionArrow.setVisible(productionAvailable)
    this.miningNav.setVisible(miningAvailable)
    this.miningArrow.setVisible(miningAvailable)

    if (researchAvailable)
    {
      if (sector.research)
      {
        this.researchNavTask.setData('population', sector.research.allocated)
      }
      else
      {
        this.researchNavTask.setData('population', null)
      }
    }

    if (productionAvailable)
    {
      if (sector.production)
      {
        this.productionNavTask.setData('population', sector.production.allocated)
      }
      else
      {
        this.productionNavTask.setData('population', null)
      }
    }

    this.population.setData('population', sector.availablePopulation)
  }
}