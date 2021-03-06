import Phaser from 'phaser'
import Button from '../../components/button'
import { UserEvents } from '../../defines'
import ValueControl from '../../components/valuecontrol'


export default class Root extends Phaser.GameObjects.Container
{
  constructor(scene, x, y)
  {
    super(scene, x, y)

    this.name = 'root'

    const onChangeView = name => {
      this.scene.events.emit(UserEvents.SECTOR_CONTROLS_VIEW_CHANGE, name)
    }

    this.blueprintNav = new Button(this.scene, -30, -22, 'blueprint_icon', () => {
      onChangeView('blueprints')
    })

    this.repairNav = new Button(this.scene, -10, -22, 'repair_icon', () => {
      onChangeView('repair')
    })
    this.repairArrow = new Phaser.GameObjects.Image(this.scene, -10, -10, 'mlm_icons', 'arrow_up_left')

    this.defenseNav = new Button(this.scene, 10, -22, 'defense_icon', () => {
      onChangeView('defense')
    })
    this.defenseArrow = new Phaser.GameObjects.Image(this.scene, 10, -10, 'mlm_icons', 'arrow_up_right_1')

    this.offenseNav = new Button(this.scene, 32, -22, 'offense_icon', () => {
      onChangeView('offense')
    })
    this.offenseArrow = new Phaser.GameObjects.Image(this.scene, 20, -14, 'mlm_icons', 'arrow_up_right_0')

    this.researchNavTask = new ValueControl(this.scene, -30, 0, 'research_icon', null)
    this.researchNavTask.setLink(true)
    this.researchNavTask.on(UserEvents.VALUE_LINK_UP, () => {
      onChangeView('research')
    })
    this.researchNavTask.on(UserEvents.VALUE_CHANGE, value => {
      this.scene.events.emit(UserEvents.CHANGE_RESEARCHERS, value)
    })
    this.researchArrow = new Phaser.GameObjects.Image(this.scene, -16, 0, 'mlm_icons', 'arrow_left')

    this.population = new ValueControl(this.scene, 0, 0, 'population_epoch_1', 1)
    this.population.setReadOnly(true)
    this.population.setDepth(1)

    this.productionNavTask = new ValueControl(this.scene, 32, 0, 'factory_icon')
    this.productionNavTask.setLink(true)
    this.productionNavTask.on(UserEvents.VALUE_LINK_UP, () => {
      onChangeView('production')
    })
    this.productionNavTask.on(UserEvents.VALUE_CHANGE, value => {
      this.scene.events.emit(UserEvents.CHANGE_MANUFACTURERS, value)
    })
    this.productionArrow = new Phaser.GameObjects.Image(this.scene, 15, 0, 'mlm_icons', 'arrow_right')

    this.miningNav = new Button(this.scene, 0, 36, 'mine_spade_icon', () => {
      onChangeView('mining')
    })
    this.miningArrow = new Phaser.GameObjects.Image(this.scene, 0, 22, 'mlm_icons', 'arrow_down')

    let icon = null
    let arrow = null
    let gatherArrow = null

    this.resources = []

    icon = new ValueControl(this.scene, 0, 66, 'resource_rock', 0) // bottom center
    icon.name = 'resource_1'
    arrow = new Phaser.GameObjects.Image(this.scene, 0, 50, 'mlm_icons', 'arrow_down')
    this.resources.push({ icon, arrow })

    icon = new ValueControl(this.scene, 32, 36, 'resource_rock', 0) // top right
    icon.name = 'resource_3'
    arrow = new Phaser.GameObjects.Image(this.scene, 16, 32, 'mlm_icons', 'arrow_right')
    gatherArrow = new Phaser.GameObjects.Image(this.scene, 16, 17, 'mlm_icons', 'arrow_up_left_green')
    this.resources.push({ icon, arrow, gatherArrow })

    icon = new ValueControl(this.scene, 32, 66, 'resource_rock', 0) // bottom right
    icon.name = 'resource_2'
    arrow = new Phaser.GameObjects.Image(this.scene, 14, 48, 'mlm_icons', 'arrow_down_right')
    gatherArrow = new Phaser.GameObjects.Image(this.scene, 18, 38, 'mlm_icons', 'arrow_up_left_green_1')
    this.resources.push({ icon, arrow, gatherArrow })

    icon = new ValueControl(this.scene, -30, 66, 'resource_rock', 0) // bottom left
    icon.name = 'resource_4'
    arrow = new Phaser.GameObjects.Image(this.scene, -12, 48, 'mlm_icons', 'arrow_down_left_0')
    this.resources.push({ icon, arrow })

    this.resources.forEach(item => {
      item.icon.setVisible(false)
      item.icon.setLink(true)
      item.icon.on(UserEvents.VALUE_LINK_UP, () => {
        onChangeView('mining')
      })
      item.arrow.setVisible(false)

      this.add([ item.icon, item.arrow ])

      if (item.gatherArrow)
      {
        item.gatherArrow.setVisible(false)
        this.add(item.gatherArrow)
      }
    })

    this.buildings = {}
    icon = new ValueControl(this.scene, -30, 36, 'construct_laboratory', 0)
    icon.on(UserEvents.VALUE_CHANGE, inc => {
      this.scene.events.emit(UserEvents.CHANGE_BUILDERS, inc, 'laboratory')
    })
    arrow = new Phaser.GameObjects.Image(this.scene, -18, 14, 'mlm_icons', 'arrow_down_left_1')
    this.buildings.laboratory = { icon, arrow }

    icon = new ValueControl(this.scene, 32, 0, 'construct_factory', 0)
    icon.on(UserEvents.VALUE_CHANGE, inc => {
      this.scene.events.emit(UserEvents.CHANGE_BUILDERS, inc, 'factory')
    })
    arrow = new Phaser.GameObjects.Image(this.scene, 14, 0, 'mlm_icons', 'arrow_right')
    this.buildings.factory = { icon, arrow }

    icon = new ValueControl(this.scene, -30, 66, 'construct_mine', 0)
    icon.on(UserEvents.VALUE_CHANGE, inc => {
      this.scene.events.emit(UserEvents.CHANGE_BUILDERS, inc, 'mine')
    })
    arrow = new Phaser.GameObjects.Image(this.scene, -12, 48, 'mlm_icons', 'arrow_down_left_0')
    this.buildings.mine = { icon, arrow }

    for (const [ key, item ] of Object.entries(this.buildings))
    {
      item.icon.setVisible(false)
      item.arrow.setVisible(false)
      this.add([ item.icon, item.arrow ])
    }

    this.add([
      this.blueprintNav,
      this.repairNav,
      this.repairArrow,
      this.defenseNav,
      this.defenseArrow,
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

  refresh(sector)
  {
    this.display(sector)
  }

  display(sector)
  {
    this.setVisible(true)

    this.population.setIcon(`population_epoch_${sector.epoch}`)
    this.population.setValue(sector.availablePopulation)

    let blueprintsAvailable = false
    let repairAvailable = false
    let hasResourcesForRepair = false
    let defenseAvailable = false
    let hasResourcesForDefense = false
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
          case 'defense':
          {
            defenseAvailable = true
            hasResourcesForDefense |= hasResourcesFor
            break
          }
        }

        if (val.requiresProduction === true)
        {
          productionAvailable = (sector.buildings.factory !== false)
          hasResourcesForProduction |= hasResourcesFor
        }
      }
      else if (sector.hasResourcesFor(val))
      {
        researchAvailable = true
      }
    }

    if (sector.epoch > 1 && sector.resources.some(res => {
      return res.available > 0
    }))
    {
      miningAvailable = true

      if (sector.buildings.mine !== false)
      {
        this.miningNav.setFrame('mine_icon')
      }
    }

    this.blueprintNav.setVisible(blueprintsAvailable)
    this.repairNav.setVisible(repairAvailable)
    this.repairArrow.setVisible(repairAvailable && hasResourcesForRepair)
    this.defenseNav.setVisible(defenseAvailable)
    this.defenseArrow.setVisible(defenseAvailable && hasResourcesForDefense)
    this.researchNavTask.setVisible(researchAvailable)
    this.researchArrow.setVisible(researchAvailable)
    this.productionNavTask.setVisible(productionAvailable && hasResourcesForProduction)
    this.productionArrow.setVisible(productionAvailable)
    this.miningNav.setVisible(miningAvailable)
    this.miningArrow.setVisible(miningAvailable)

    if (researchAvailable)
    {
      this.researchNavTask.setIcon(sector.buildings.laboratory === false ? 'research_icon' : 'laboratory_icon')

      if (sector.research)
      {
        this.researchNavTask.setValue(sector.research.allocated)
      }
      else
      {
        this.researchNavTask.setValue(null)
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

    // update resources
    let surfaceIndex = 1
    let resourceIndex = 0
    sector.resources.forEach(r => {
      if (r.available)
      {
        if (r.type === 'surface')
        {
          this.resources[surfaceIndex].icon.setIcon(`resource_${r.id}`).setValue(r.owned).setVisible(true)
          this.resources[surfaceIndex].gatherArrow.setVisible(true)
          surfaceIndex++
        }
        else
        {

          resourceIndex = Phaser.Math.Wrap(resourceIndex + 1, 0, 4)
        }
      }
    })

    const constructionProjectsAvailable = sector.construction.map(item => item.id)

    // update buildings
    for (const [ key, item ] of Object.entries(this.buildings))
    {
      const construction = sector.construction.find(item => item.id === key)

      const available = !!construction
      const allocated = construction ? construction.allocated : 0

      item.icon.setVisible(available)
      item.icon.setValue(allocated)
      item.arrow.setVisible(available)

      if (item.gatherArrow)
      {
        item.gatherArrow.setVisible(available)
      }
    }

    this.population.setData('population', sector.availablePopulation)
  }
}