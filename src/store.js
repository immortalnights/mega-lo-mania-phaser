import Phaser, { Game } from 'phaser'
import { Teams, GameEvents, BuildingTypes, unitSet } from './defines.js'
import Islands from './assets/islands.json'
import Technologies from './assets/technologies.json'
import Resources from './assets/resources.json'
import { getKeyForSector } from './utilities'

const getDefaultDefendersForBuilding = (type) => {
  let defenderCount = 0

  switch (type)
  {
    case BuildingTypes.CASTLE:
    {
      defenderCount = 4
      break
    }
    case BuildingTypes.MINE:
    {
      defenderCount = 2
      break
    }
    case BuildingTypes.FACTORY:
    {
      defenderCount = 3
      break
    }
    case BuildingTypes.LABORATORY:
    {
      defenderCount = 1
      break
    }
  }

  return Array(defenderCount)
}

class Sector
{
  constructor(scene, index, key)
  {
    this.name = "Island" // island name
    this.scene = scene
    this.id = index,
    this.key = key
    this.epoch = 1
    this.maxEpoch = 1
    this.technologyLevel = 0
    this.startPopulation = 0
    this.availablePopulation = 0
    this.spawnedPopulation = 0
    this.deployedPopulation = 0
    this.resources = []
    this.buildings = {
      castle: false,
      mine: false,
      factory: false,
      laboratory: false,
    }
    this.technologies = {}
    this.research = null
    this.construction = []
    this.production = null
    this.pendingArmy = []
    this.armies = []
    this.nuked = false

    // debugging
    this.timeUntilNextPop = 0
    this.timeSinceLastSpawn = 0
    this.lastGrowth = 0
  }

  /**
   * Initialize the sector resources and technologies (based on the epoch)
   */
  setup(epoch, resources = [])
  {
    this.epoch = epoch
    this.maxEpoch = epoch + 3

    Resources.forEach(res => {
      if (resources.includes(res.id))
      {
        let locked = false
        let available = 0
        let owned = 0
        if (res.type === 'mine')
        {
          available = 75
          locked = this.buildings.mine === false
        }
        else if (res.type === 'pit')
        {
          available = 50
          locked = this.epoch === 1
        }
        else
        {
          available = 90
          owned = 10
        }

        this.resources.push({
          ...res,
          available,
          owned,
          depleted: false,
          allocated: 0,
          progress: 0,
          baseDuration: 90,
          remainingDuration: 0,
          locked,
        })
      }
    })

    Technologies.forEach(technology => {
      if (technology.technologyLevel >= epoch && technology.technologyLevel < epoch + 4)
      {
        // find a matching recipe, perfect if possible
        let bestRecipe = null
        // Required until all technologies have recipes.
        if (technology.recipes)
        {
          technology.recipes.forEach(recipe => {
            if (Object.entries(recipe.resources).every(([ key, quantity ]) => {
              return !!this.resources.find(r => r.id === key)
            }))
            {
              if (bestRecipe == undefined || recipe.perfect)
              {
                bestRecipe = recipe
              }
            }
          })
        }
        
        this.technologies[technology.id] = {
          ...technology,
          recipe: bestRecipe,
          researched: false,
          produced: 0,
          available: false
        }
      }
    })
  }

  /**
   * Claim this sector for the specified player
   * @param {String} team 
   * @param {Number} population 
   */
  claim(team, population)
  {
    console.assert(this.buildings.castle === false, `Sector ${this.index} is already owned!`)

    this.buildings.castle = {
      team,
      // FIXME move defenders to root of sector and have building apply them from there?
      defenders: []
    }

    this.setupConstructionProjects()

    this.startPopulation = population
    this.availablePopulation = population

    // TESTING
    if (this.technologies['rock'])
    {
      this.technologies['rock'].researched = true
    }
  }

  tick(tickDelta, tickCount)
  {
    // Handle combat
    if (this.armies.length > 0)
    {
      
    }

    // Check if the sector is claimed
    if (this.buildings.castle === false)
    {
      // Handle castle building
      if (this.armies.length === 1)
      {

      }
    }
    else
    {
      // Apply population growth
      if (false)
      {
        if (this.availablePopulation < 500)
        {
          let currentTimeUntilNextSpawn = (180 / this.availablePopulation)
          this.timeSinceLastSpawn += tickDelta / 1000
    
          while (this.timeSinceLastSpawn > currentTimeUntilNextSpawn)
          {
            this.spawnedPopulation = this.spawnedPopulation + 1
            this.availablePopulation = this.availablePopulation + 1
            this.timeSinceLastSpawn -= currentTimeUntilNextSpawn
    
            currentTimeUntilNextSpawn = (180 / this.availablePopulation)
          }

          // Cap population to 500.
          this.availablePopulation = Math.min(this.availablePopulation, 500)
        }
      }

      // Handle buildings (what about the castle building if the sector is not claimed?)
      // backwards, so completed buildings can be removed from the array
      for (let index = this.construction.length - 1; index >= 0; index--)
      {
        const construction = this.construction[index]

        if (construction.allocated > 0)
        {
          construction.progress += 1
          construction.remainingDuration = construction.duration - construction.progress

          if (construction.remainingDuration <= 0)
          {
            this.availablePopulation = this.availablePopulation + construction.allocated

            switch (construction.id)
            {
              case 'mine':
              {
                this.buildings.mine = {
                  defenders: []
                }
                break
              }
              case 'factory':
              {
                this.buildings.factory = {
                  defenders: []
                }
                break
              }
              case 'laboratory':
              {
                this.buildings.laboratory = {
                  defenders: []
                }
                break
              }
              default:
              {
                console.warn(`Construction of the ${construction.id} is not yet implemented`)
                break
              }
            }

            this.scene.events.emit(GameEvents.BUILDING_CONSTRUCTED, this, construction.id)

            // Remove the construction project
            this.construction.splice(index, 1)
          }
        }
      }

      // Handle mining / resources
      // Event triggered after production to avoid multiple events
      let resourcesChanged = false
      this.resources.forEach(resource => {
        if (resource.depleted === false)
        {
          switch (resource.type)
          {
            case 'mine':
            {
              resource.locked = (this.buildings.mine === false)
              if (resource.locked === false && resource.allocated > 0)
              {
                resource.progress += 1
                resource.remainingDuration = resource.duration - resource.progress
                if (resource.remainingDuration <= 0)
                {
                  resource.progress = 0

                  // TODO handle mining more then one block at a time
                  const mined = Math.min(resource.available, 0.5)
                  resource.owned = resource.owned + 0.5
                  resource.available = resource.available - 0.5
                  resourcesChanged = true
                }
              }
              break
            }
            case 'pit':
            {
              resource.locked = (this.epoch === 1)
              if (resource.locked === false && resource.allocated > 0)
              {
                resource.progress += 1
                resource.remainingDuration = resource.duration - resource.progress
                if (resource.remainingDuration <= 0)
                {
                  resource.progress = 0

                  // TODO handle mining more then one block at a time
                  const mined = Math.min(resource.available, 0.5)
                  resource.owned = resource.owned + 0.5
                  resource.available = resource.available - 0.5
                  resourcesChanged = true
                }
              }
              break;
            }
            case 'surface':
            {
              if (resource.owned < 21)
              {
                const mined = Math.min(resource.available, 0.5)
                resource.owned = resource.owned + mined
                resource.available = resource.available - mined
                resourcesChanged = true
              }
              break;
            }
            default:
            {
              console.assert(false, `Unhandled resource type ${resource.type} for ${resource.id}`)
              break
            }
          }

          if (resource.available <= 0)
          {
            resource.depleted = true
            this.availablePopulation = this.availablePopulation + resource.allocated

            resourcesChanged = true
            this.scene.events.emit(GameEvents.RESOURCE_DEPLETED, this, resource)
          }
        }
      })

      // Handle research
      if (this.research)
      {
        if (this.research.allocated > 0)
        {
          this.research.progress += 1

          this.research.remainingDuration = this.research.duration - this.research.progress

          if (this.research.remainingDuration < 0)
          {
            const tech = this.technologies[this.research.id]

            // Mark the technology as completed
            tech.researched = true

            this.technologyLevel = this.technologyLevel + tech.technologyLevel
            if (Math.floor(this.technologyLevel / 3) >= this.epoch && this.epoch < this.maxEpoch)
            {
              this.epoch = this.epoch + 1
              this.onAdvancedTechnologyLevel()
              this.scene.events.emit(GameEvents.ADVANCED_TECH_LEVEL, this)
            }

            // Sector alert (map / audio)
            this.scene.events.emit(GameEvents.RESEARCH_COMPLETED, this)

            // Deallocate the population
            this.availablePopulation = this.availablePopulation + this.research.allocated

            // Reset the current research
            this.research = null
          }

          this.scene.events.emit(GameEvents.RESEARCH_CHANGED, this)
        }
      }

      // Handle Production
      if (this.production)
      {
        if (this.production.allocated > 0)
        {
          this.production.remainingDuration -= 1

          if (this.production.remainingDuration < 0)
          {
            // Check resources

            resourcesChanged = true

            this.production.runs -= 1

            // Mark the technology as completed
            this.technologies[this.production.name].available += 1

            // Sector alert (map / audio) (for an individual item)
            this.scene.events.emit(GameEvents.PRODUCTION_COMPLETED, this)

            if (this.production.runs > 0)
            {
              this.production.remainingDuration = this.production.duration
            }
            else
            {
              // Sector alert (map / audio) (for the entire run)
              this.scene.events.emit(GameEvents.PRODUCTION_RUN_COMPLETED, this)
  
              // Deallocate the population
              this.availablePopulation = this.availablePopulation + this.production.allocated
  
              // Reset the current production
              this.production = false
            }
          }

          this.scene.events.emit(GameEvents.PRODUCTION_CHANGED, this)
        }
      }

      if (resourcesChanged)
      {
        this.scene.events.emit(GameEvents.RESOURCES_CHANGED, this)
      }

      // Update the states of any researched technologies
      for (const [ key, value ] of Object.entries(this.technologies))
      {
        const technology = value

        if (value.researched)
        {
          if (technology.produced === 0 && this.hasResourcesFor(technology))
          {
            technology.available = (this.availablePopulation - 1) >= technology.requiredPopulation
          }
          else
          {
            technology.available = false
          }
        }
      }

      // The population of a sector always changes
      // though may change by < 1
      this.scene.events.emit(GameEvents.POPULATION_CHANGED, this)
    }
  }

  onAdvancedTechnologyLevel()
  {
    // unlock available resources
    // add construction projects
    this.setupConstructionProjects()
  }

  setupConstructionProjects()
  {
    this.construction = []

    if (this.epoch >= 4 && this.buildings.mine === false)
    {
      this.construction.push({
        id: 'mine',
        icon: '?',
        allocated: 0,
        started: 0,
        // Base duration
        baseDuration: 480,
        // duration based on allocated population
        duration: 0,
        // research progress
        progress: 0,
        // Remaining duration (base duration - progress)
        remainingDuration: Infinity,
      })
    }

    if (this.epoch >= 5 && this.buildings.factory === false)
    {
      this.construction.push({
        id: 'factory',
        icon: '?',
        allocated: 0,
        started: 0,
        // Base duration
        baseDuration: 480,
        // duration based on allocated population
        duration: 0,
        // research progress
        progress: 0,
        // Remaining duration (base duration - progress)
        remainingDuration: Infinity,
      })
    }

    if (this.epoch >= 6 && this.buildings.laboratory === false)
    {
      this.construction.push({
        id: 'laboratory',
        icon: '?',
        allocated: 0,
        started: 0,
        // Base duration
        baseDuration: 480,
        // duration based on allocated population
        duration: 0,
        // research progress
        progress: 0,
        // Remaining duration (base duration - progress)
        remainingDuration: Infinity,
      })
    }
  }

  getPendingArmySize()
  {
    let size = 0

    this.pendingArmy.forEach(item => {
      size += item.quantity
    })

    return size
  }

  findTechnology(name)
  {
    return this.technologies[name]
  }

  hasResourcesFor(technology)
  {
    let available = false
    if (technology.recipe === null)
    {
      // FIXME - temp while recipes are missing
      available = true
    }
    else if (technology != null)
    {
      available = Object.entries(technology.recipe.resources).every(([ key, quantity ]) => {
        const resource = this.resources.find(r => r.id === key)

        let ok = false
        console.assert(resource, `Failed to find resource ${key} for technology ${technology.id}`)

        if (resource.type === 'surface')
        {
          ok = (resource.available + resource.owned) >= quantity
        }
        else
        {
          ok = resource.owned >= quantity
        }

        return ok
      })
    }

    return available
  }

  takeResourcesFor(technology)
  {
    if (technology.recipe)
    {
      for (const [ key, quantity ] of Object.entries(technology.recipe.resources))
      {
        const resource = this.resources.find(r => r.id === key)

        if (resource.type === 'surface')
        {
          // Take the resources from "available" before "owned"
          // Since players wont typically see the resource count and the consumer at the same time
          // how it looks is not important.
          let required = quantity
          if (resource.owned > 0)
          {
            const take = Math.min(resource.owned, required)
            resource.owned = resource.owned - take
            required = required - take
          }

          if (resource.available >= required)
          {
            resource.available = resource.available - required
          }
        }
        else
        {
          console.assert(resource.owned < quantity, `Attempted to take too many of ${resource}`)
          resource.owned = resource.owned - quantity
        }
      }
    }
  }

  returnResourcesFor(technology)
  {
    if (technology.recipe)
    {
      for (const [ key, quantity ] of Object.entries(technology.recipe.resources))
      {
        const resource = this.resources.find(r => r.id === key)
        resource.owned = resource.owned + quantity
      }
    }
  }

  /**
   * 
   * @param {String} task 
   * @param {String} detail 
   * @param {Number} population 
   */
  modifyPopulation(task, detail, population)
  {
    let change = 0

    const availablePopulation = this.availablePopulation - 1

    switch (task)
    {
      case 'research':
      {
        if (this.research)
        {
          const research = this.research

          if (population < 0)
          {
            change = Math.min(research.allocated, Math.abs(population))
            research.allocated = research.allocated - change
            this.availablePopulation = this.availablePopulation + change
          }
          else
          {
            change = Math.min(availablePopulation, population)
            this.availablePopulation = this.availablePopulation - change
            research.allocated = research.allocated + change
          }

          if (research.allocated > 0)
          {
            research.duration = Math.ceil(research.baseDuration / research.allocated)
            research.remainingDuration = research.duration - research.progress
          }
          else
          {
            research.duration = research.baseDuration
            research.remainingDuration = Infinity
          }

          this.scene.events.emit(GameEvents.RESEARCH_CHANGED, this)
        }
        break
      }
      case 'production':
      {
        if (this.production)
        {
          /// copy research
          console.log("FIXME")
          // if (population < 0)
          // {
          //   change = Math.min(this.production.allocated, Math.abs(population))
          //   this.production.allocated = this.production.allocated - change
          //   this.availablePopulation = this.availablePopulation + change
          // }
          // else
          // {
          //   change = Math.min(availablePopulation - 1, population)
          //   this.availablePopulation = this.availablePopulation - change
          //   this.production.allocated = this.production.allocated + change
          // }

          this.scene.events.emit(GameEvents.PRODUCTION_CHANGED, this)
        }
        break
      }
      case 'production_runs':
      {
        if (this.production)
        {
          this.production.runs = this.production.runs + population

          this.scene.events.emit(GameEvents.PRODUCTION_CHANGED, this)
        }
        break
      }
      case 'building':
      {
        const construction = this.construction.find(item => item.id === detail)
        if (construction == null)
        {
          console.warn(`Failed to find construction of ${detail}`)
        }
        else
        {
          if (population < 0)
          {
            change = Math.min(construction.allocated, Math.abs(population))
            construction.allocated = construction.allocated - change
            this.availablePopulation = this.availablePopulation + change
          }
          else
          {
            change = Math.min(availablePopulation, population)
            this.availablePopulation = this.availablePopulation - change
            construction.allocated = construction.allocated + change
          }

          if (construction.allocated > 0)
          {
            construction.duration = Math.ceil(construction.baseDuration / construction.allocated)
            construction.remainingDuration = construction.duration - construction.progress
          }
          else
          {
            construction.duration = construction.baseDuration
            construction.remainingDuration = Infinity
          }

          this.scene.events.emit(GameEvents.POPULATION_CHANGED, this)
        }
        break
      }
      case 'mining':
      {
        const resource = this.resources.find(item => item.id === detail)
        if (resource == null)
        {
          console.warn(`Failed to find resource ${detail}`)
        }
        else
        {
          if (population < 0)
          {
            change = Math.min(resource.allocated, Math.abs(population))
            resource.allocated = resource.allocated - change
            this.availablePopulation = this.availablePopulation + change
          }
          else
          {
            change = Math.min(availablePopulation, population)
            this.availablePopulation = this.availablePopulation - change
            resource.allocated = resource.allocated + change
          }

          if (resource.allocated > 0)
          {
            resource.duration = Math.ceil(resource.baseDuration / resource.allocated)
            resource.remainingDuration = resource.duration - resource.progress
          }
          else
          {
            resource.duration = resource.baseDuration
            resource.remainingDuration = Infinity
          }

          this.scene.events.emit(GameEvents.POPULATION_CHANGED, this)
        }
        break
      }
    }
  }

  beginResearch(technology)
  {
    const tech = this.technologies[technology]
    if (tech)
    {
      if (this.research === null || this.research.id !== tech.id)
      {
        if (this.research)
        {
          // Cancel current research
          this.availablePopulation = this.availablePopulation + this.research.allocated
        }

        this.research = {
          id: tech.id,
          name: tech.name,
          icon: tech.researchIcon,
          allocated: 0,
          started: 0,
          // Base duration
          baseDuration: tech.researchDuration,
          // duration based on allocated population
          duration: 0,
          // research progress
          progress: 0,
          // Remaining duration (base duration - progress)
          remainingDuration: Infinity,
        }
  
        this.scene.events.emit(GameEvents.RESEARCH_CHANGED, this)
      }
    }
  }

  // from user event
  /**
   * FIXME - change to addUnitsToGroup so this can work with deployed/returned armies
   * @param {*} assigned 
   * @param {*} type 
   */
  addUnitsToArmy(assigned, type)
  {
    if (type === 'unarmed')
    {
      if (this.availablePopulation > 2)
      {
        const quantity = Math.min(this.availablePopulation, assigned)
        this._addUnitsToArmy(type, quantity, quantity)
      }
    }
    else
    {
      const technology = this.findTechnology(type)
      console.assert(technology, `Failed to find technology ${type}`)

      // Allocate up to `assigned`
      for (let count = 0, done = false; count < assigned && done === false; count++)
      {
        if (technology.requiredProduction)
        {
          /**
           * FIXME current there is `available` used as true / false to update the UI
           * and there is `produced` to indicate how many of the technology has been
           * made (factory not required)
           * but maybe `available` boolean is not required and confusing. The UI can use
           * produced to show a number or if produced === 0 check requiredProduction
           * and display accordingly.
           */

          if (technology.produced === 0)
          {
            done = true
            console.log(`No more produced ${type}`)
          }
          else if (technology.requiredPopulation > (this.availablePopulation - 1))
          {
            done = true
            console.log(`Not enough population to add ${type}, required ${technology.requiredPopulation} have ${this.availablePopulation - 1}`)
          }
          else
          {
            this._addUnitsToArmy(type, 1, technology.requiredPopulation)
            technology.produced = technology.produced - 1
          }
        }
        else
        {
          if (technology.produced > 0)
          {
            this._addUnitsToArmy(type, 1, technology.requiredPopulation)
            technology.production = technology.produced - 1
          }
          else if (this.hasResourcesFor(technology) === false)
          {
            // Cannot allocate more without resources
            console.log(`Not enough resources to add ${type}`)
          }
          else if (technology.requiredPopulation > (this.availablePopulation - 1))
          {
            done = true
            console.log(`Not enough population to add ${type}, required ${technology.requiredPopulation} have ${this.availablePopulation - 1}`)
          }
          else
          {
            this._addUnitsToArmy(type, 1, technology.requiredPopulation)
            this.takeResourcesFor(technology)
          }
          break
        }
      }
    }

    this.scene.events.emit(GameEvents.ARMY_CHANGED, this)
    this.scene.events.emit(GameEvents.RESOURCES_CHANGED, this)
  }

  // from user event
  removeUnitsFromArmy(quantity, type)
  {
    const group = this.pendingArmy.find(group => group.type === type)
    if (group)
    {
      const amount = Math.min(quantity, group.quantity)
      this._removeUnitsFromArmy(type, amount)
      group.quantity = group.quantity - amount
    }

    this.scene.events.emit(GameEvents.ARMY_CHANGED, this)
    this.scene.events.emit(GameEvents.RESOURCES_CHANGED, this)
  }

  _removeUnitsFromArmy(type, quantity)
  {
    // FIXME
    const armyInHand = true

    if (type === 'unarmed')
    {
      this.availablePopulation = this.availablePopulation + quantity
    }
    else
    {
      const technology = this.findTechnology(type)
      console.assert(technology, `Failed to find technology ${type}`)

      for (let count = 0; count < quantity; count++)
      {
        if (technology.requiredProduction)
        {
          technology.produced = technology.produced + 1
          this.availablePopulation = this.availablePopulation + technology.requiredPopulation
        }
        else if (armyInHand === true)
        {
          this.returnResourcesFor(technology)
          this.availablePopulation = this.availablePopulation + technology.requiredPopulation
        }
        else
        {
          technology.produced = technology.produced + 1
          this.availablePopulation = this.availablePopulation + technology.requiredPopulation
        }
      }
    }
  }

  _addUnitsToArmy(type, quantity, population)
  {
    let group = this.pendingArmy.find(p => p.type === type)

    if (group == null)
    {
      group = {
        type,
        quantity: 0
      }

      this.pendingArmy.push(group)
    }

    group.quantity = group.quantity + quantity
    this.availablePopulation = this.availablePopulation - population
  }

  _addUnitsToArmyOLD(type, quantity, population)
  {
    let group = this.pendingArmy.find(p => p.type === type)

    if (group == null)
    {
      group = {
        type,
        quantity: 0
      }

      this.pendingArmy.push(group)
    }

    let transfer = 0
    if (quantity > 0)
    {
      transfer = Math.min(this.availablePopulation, quantity)
    }
    else
    {
      transfer = -Math.min(group.quantity, Math.abs(quantity))
    }

    group.quantity = group.quantity + transfer
    this.availablePopulation = this.availablePopulation - transfer

    this.scene.events.emit(GameEvents.ARMY_CHANGED, this)
  }

  disbandPendingArmy()
  {
    this.pendingArmy.forEach(group => {
      this._removeUnitsFromArmy(group.type, group.quantity)
    })

    this.pendingArmy = []

    this.scene.events.emit(GameEvents.ARMY_CHANGED, this)
    this.scene.events.emit(GameEvents.RESOURCES_CHANGED, this)
  }

  beginProduction(technology)
  {
    const tech = this.technologies[technology]
    if (tech)
    {
      this.production = {
        id: tech.id,
        name: tech.name,
        icon: tech.productionIcon,
        allocated: 0,
        runs: 1,
        name: technology,
        started: 0,
        duration: tech.productionDuration,
        remainingDuration: tech.productionDuration,
      }

      this.scene.events.emit(GameEvents.PRODUCTION_CHANGED, this)
    }
  }
}

export default class Store extends Phaser.Events.EventEmitter
{
  constructor(scene)
  {
    super()

    this.scene = scene

    this.players = []
    this.sectors = {}

    this.tickTimer = 0
    this.tickCount = 0
    this.tickSpeed = 1000 // 1s Normal speed
  }

  tick(time, delta)
  {
    this.tickTimer += delta
    if (this.tickTimer > this.tickSpeed)
    {
      Object.values(this.sectors).forEach(sector => sector.tick(this.tickTimer, this.tickCount))

      this.tickTimer = 0
      this.tickCount++
    }
  }

  setIsland(name)
  {
    const island = Islands.find(i => i.name === name)
    console.assert(island != null, `Island '${name}' is invalid`)
    this.island = { ...island }

    this.sectors = {}
    this.island.map.forEach((value, index) => {
      if (value)
      {
        this.addSector(index, getKeyForSector(index, island.map), 1)
      }
    })
  }

  addSector(index, key, startEpoch)
  {
    this.sectors[index] = new Sector(this.scene, index, key, startEpoch)
    return this.sectors[index]
  }

  setPlayers(teams)
  {
    teams.forEach(team => {
      this.players.push({
        team,
        allies: []
      })
    })
  }

  changeMiners(index, value, resource)
  {
    const sector = this.sectors[index]
    sector.modifyPopulation('mining', resource, value)
    this.scene.events.emit(GameEvents.POPULATION_ALLOCATION_CHANGED, sector)
  }

  changeResearchers(index, value)
  {
    const sector = this.sectors[index]
    sector.modifyPopulation('research', undefined, value)
    this.scene.events.emit(GameEvents.POPULATION_ALLOCATION_CHANGED, sector)
  }

  changeBuilders(index, value, building)
  {
    const sector = this.sectors[index]
    sector.modifyPopulation('building', building, value)
    this.scene.events.emit(GameEvents.POPULATION_ALLOCATION_CHANGED, sector)
  }

  allocatePopulation(index, task, detail, population = 1)
  {
    const sector = this.sectors[index]
    sector.modifyPopulation(task, detail, population)
    this.scene.events.emit(GameEvents.POPULATION_ALLOCATION_CHANGED, sector)
  }

  deallocatePopulation(index, task, detail, population = 1)
  {
    const sector = this.sectors[index]
    sector.modifyPopulation(task, detail, -population)
    this.scene.events.emit(GameEvents.POPULATION_ALLOCATION_CHANGED, sector)
  }

  addToArmy(index, quantity, type)
  {
    const sector = this.sectors[index]
    if (quantity < 0)
    {
      sector.removeUnitsFromArmy(Math.abs(quantity), type)
    }
    else
    {
      sector.addUnitsToArmy(quantity, type)
    }
  }

  discardPendingArmy(index)
  {
    const sector = this.sectors[index]
    sector.disbandPendingArmy()
  }

  /**
   * 
   * @param {*} sector 
   * @param {*} destination 
   * @returns {boolean} True if the two sectors are connected
   */
  hasPath(sector, destination)
  {
    return true
  }

  isAllied(team, other=null)
  {
    const p = this.players.find(p => p.team === team)
    return other ? p.allies.includes(other) : p.allies.length > 0
  }

  updateTeams(localPlayer)
  {
    const teams = []
    let localPlayerAllied = false

    const isIncluded = t => {
      return -1 !== teams.findIndex(group => {
        return group.includes(t)
      })
    }

    this.players.forEach(p => {
      if (isIncluded(p.team))
      {
        // Skip
      }
      else if (p.allies.length === 0)
      {
        if (teams.includes(p.team) === false)
        {
          teams.push(p.team)
        }
      }
      else
      {
        if (p.team === localPlayer)
        {
          localPlayerAllied = true
        }

        teams.push([p.team].concat(p.allies))
      }
    })

    this.scene.events.emit(GameEvents.TEAMS_CHANGED, teams, localPlayerAllied)
  }

  makeAlliance(a, b)
  {
    const player = this.players.find(p => p.team === a)
    player.allies.push(b)

    const otherPlayer = this.players.find(p => p.team === b)
    otherPlayer.allies.push(a)

    // Update team shields
    this.updateTeams(a)
  }

  breakAlliances(a)
  {
    const player = this.players.find(p => p.team === a)

    // update all allies
    player.allies.forEach(name => {
      const ally = this.players.find(p => p.team === name)
      const index = ally.allies.findIndex(i => i === player.team)
      ally.allies.splice(index, 1)
    })

    player.allies.splice(0, player.allies.length)

    // Update team shields
    this.updateTeams(a)
  }

  buildBuilding(sector, type, team)
  {
    const sec = this.sectors[sector]
    console.assert(sec.buildings[type] === false, `Attempted to build another ${type} in sector ${sector}`)
    sec.buildings[type] = {
      team,
      defenders: getDefaultDefendersForBuilding(type)
    }

    this.scene.events.emit(GameEvents.SECTOR_ADD_BUILDING, sector, type, team)
  }

  destroyBuilding(sector, type)
  {
    const sec = this.sectors[sector]
    console.assert(sec.buildings[type] !== false, `Attempted to destroy missing ${type} in sector ${sector}`)

    sec.buildings[type] = false

    this.scene.events.emit(GameEvents.SECTOR_REMOVE_BUILDING, sector, type)
  }

  hasDefender(sector, building, position)
  {
    const sec = this.sectors[sector]
    const b = sec.buildings[building]
    return !!b.defenders[position]
  }

  addDefender(sector, building, position, type)
  {
    console.log("add defender", sector, building, position, type)
    const sec = this.sectors[sector]
    const b = sec.buildings[building]

    b.defenders[position] = type
    this.scene.events.emit(GameEvents.BUILDING_ADD_DEFENDER, sector, building, position, type)
  }

  removeDefender(sector, building, position)
  {
    console.log("remove defender", sector, building, position)

    const sec = this.sectors[sector]
    const b = sec.buildings[building]
    b.defenders[position] = undefined

    this.scene.events.emit(GameEvents.BUILDING_REMOVE_DEFENDER, sector, building, position)
  }

  hasArmy(sectorIndex, team)
  {
    const sector = this.sectors[sectorIndex]
    return !!sector.armies.find(a => a.team === team)
  }

  /**
   * Deploy an army from a Castle to a Sector
   * @param {Integer} sectorIndex Source sector owned by the player
   * @param {Object} units Army units and quantity
   * @param {Integer} destination Destination sector (optional)
   */
  deployArmy(sectorIndex, units, destinationIndex=undefined)
  {
    //
    const sector = this.sectors[sectorIndex]
    const castle = sector.buildings['castle']

    if (destinationIndex == null) { destinationIndex = sectorIndex }
    const destination = this.sectors[destinationIndex]

    if (castle == null)
    {
      console.warn(`Cannot deploy army from sector ${sectorIndex}, not owned by player`)
    }
    else if (this.hasPath(sectorIndex, destinationIndex) === false)
    {
      console.warn(`Cannot deploy army from sector ${sectorIndex} to ${destinationIndex}, no path`)
    }
    else
    {
      const ownerTeam = castle.team
      let isNew = false
      let army = destination.armies.find(a => a.team === ownerTeam)

      if (army == null)
      {
        army = { team: ownerTeam, ...unitSet }
        destination.armies.push(army)
        isNew = true
      }

      this.combineArmies(army, units)

      if (sectorIndex === destinationIndex)
      {
        this.scene.events.emit(GameEvents.SECTOR_ADD_ARMY, sectorIndex, ownerTeam, army)
      }
      else
      {
        this.moveArmy(sectorIndex, destinationIndex)
      }
    }
  }

  /**
   * Move an army from one Sector to another
   */
  moveArmy(sectorIndex, destinationIndex, team)
  {
    const source = this.sectors[sectorIndex]
    const destination = this.sectors[destinationIndex]

    if (source === destination)
    {
      // Nothing to do.
    }
    else if (this.hasPath(sectorIndex, destinationIndex) === false)
    {
      console.warn(`Cannot deploy army from sector ${sectorIndex} to ${destinationIndex}, no path`)
    }
    else
    {
      let armyIndex = source.armies.findIndex(a => a.team === team)

      if (armyIndex == -1)
      {
        console.warn(`No army for ${team} on sector ${sectorIndex}`)
      }
      else
      {
        // Remove army from the source Sector
        const sourceArmy = source.armies.splice(armyIndex, 1)[0]
        let destinationArmy = destination.armies.find(a => a.team === team)

        // Create destination army, if required
        if (destinationArmy == null)
        {
          destinationArmy = { team: team, ...unitSet }
          destination.armies.push(destinationArmy)
        }

        // Merge armies
        this.combineArmies(destinationArmy, sourceArmy)

        this.scene.events.emit(GameEvents.SECTOR_REMOVE_ARMY, sectorIndex, team, sourceArmy)
        this.scene.events.emit(GameEvents.SECTOR_ADD_ARMY, destinationIndex, team, destinationArmy)
      }
    }
  }

  /**
   * Move an army into own Castle
   */
  retireArmy(sector)
  {

  }

  /**
   * Adds others to 'destination'
   * @param {Object} destination
   * @param {*} others
   * @returns destination, with others merged in
   */
  combineArmies(destination, ...others)
  {
    const ignoredKeys = ['team']

    others.forEach(b => {
      for (const [key, value] of Object.entries(b))
      {
        if (ignoredKeys.includes(key) === false)
        {
          destination[key] += value
        }
      }
    })

    return destination
  }
}