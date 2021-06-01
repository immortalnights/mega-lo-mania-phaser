import Technologies from '/src/data/technologies.json'
import Resources from '/src/data/resources.json'
import { BuildingTypes, GameEvents } from '../../defines'


export default class Sector
{
  constructor(eventProxy, index, key, islandName)
  {
    this.name = islandName
    this.eventProxy = eventProxy
    this.id = index,
    this.key = key
    this.epoch = 1 // Set during 'setup'
    this.maxEpoch = 1 // Set during 'setup'
    this.owner = undefined // Set during 'claim'
    this.technologyLevel = 0
    this.startPopulation = 0 // Set during 'claim'
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
        let bestRecipe = undefined
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

        // console.debug(`Technology ${technology.id} available for sector ${this.id}`, bestRecipe)
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

    this.owner = team
    this.buildings.castle = {
      team, // remove?
      // FIXME move defenders to root of sector and have building apply them from there?
      defenders: []
    }

    this.setupConstructionProjects()

    this.startPopulation = population
    this.availablePopulation = population

    this.eventProxy.emit(GameEvents.SECTOR_ADD_BUILDING, this.id, BuildingTypes.CASTLE, team)

    // TESTING
    // if (this.technologies['rock'])
    // {
    //   this.technologies['rock'].researched = true
    //   console.log("`rock` has been researched")
    // }
    // if (this.technologies['cannon'])
    // {
    //   this.technologies['cannon'].researched = true
    //   console.log("`cannon` has been researched")
    // }
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

            this.eventProxy.emit(GameEvents.BUILDING_CONSTRUCTED, this, construction.id)

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
              break
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
              break
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
            this.eventProxy.emit(GameEvents.RESOURCE_DEPLETED, this, resource)
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
              this.eventProxy.emit(GameEvents.ADVANCED_TECH_LEVEL, this)
            }

            // Sector alert (map / audio)
            this.eventProxy.emit(GameEvents.RESEARCH_COMPLETED, this)

            // Deallocate the population
            this.availablePopulation = this.availablePopulation + this.research.allocated

            // Reset the current research
            this.research = null
          }

          this.eventProxy.emit(GameEvents.RESEARCH_CHANGED, this)
        }
      }

      // Handle Production
      if (this.production)
      {
        if (this.production.allocated > 0)
        {
          // Check resources, cancel production if there are no resources
          this.production.progress += 1

          this.production.remainingDuration = Math.max(this.production.duration - this.production.progress, 0)

          if (this.production.remainingDuration <= 0)
          {
            resourcesChanged = true

            this.production.runs -= 1

            // Mark the technology as completed
            this.technologies[this.production.name].produced += 1

            // Sector alert (map / audio) (for an individual item)
            this.eventProxy.emit(GameEvents.PRODUCTION_COMPLETED, this)

            if (this.production.runs > 0)
            {
              this.production.progress = 0
              this.production.remainingDuration = this.production.duration
              this.production.totalDuration = (this.production.duration * (this.production.runs - 1)) + this.production.remainingDuration
            }
            else
            {
              // Sector alert (map / audio) (for the entire run)
              this.eventProxy.emit(GameEvents.PRODUCTION_RUN_COMPLETED, this)
  
              // Deallocate the population
              this.availablePopulation = this.availablePopulation + this.production.allocated
  
              // Reset the current production
              this.production = false
            }
          }
          else
          {
            this.production.totalDuration = (this.production.duration * (this.production.runs - 1)) + this.production.remainingDuration
          }

          this.eventProxy.emit(GameEvents.PRODUCTION_CHANGED, this)
        }
      }

      if (resourcesChanged)
      {
        this.eventProxy.emit(GameEvents.RESOURCES_CHANGED, this)
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
      this.eventProxy.emit(GameEvents.POPULATION_CHANGED, this)
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
    if (technology.recipe == null)
    {
      // FIXME - temp while recipes are missing
      available = true
      console.debug(`Have no recipes for ${technology.name}`)
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
      // console.debug(`Have resources for ${technology.name}: ${available}`)
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


    // using `this` is not ideal. perhaps pass "availablePopulation" in and return modified value
    const allocateOrDeallocate = task => {
      if (population < 0)
      {
        change = Math.min(task.allocated, Math.abs(population))
        task.allocated = task.allocated - change
        this.availablePopulation = this.availablePopulation + change
      }
      else
      {
        change = Math.min(availablePopulation, population)
        this.availablePopulation = this.availablePopulation - change
        task.allocated = task.allocated + change
      }

      if (task.allocated > 0)
      {
        task.duration = Math.ceil(task.baseDuration / task.allocated)
        task.remainingDuration = Math.max(task.duration - task.progress, 0)
      }
      else
      {
        task.duration = task.baseDuration
        task.remainingDuration = Infinity
      }
    }

    switch (task)
    {
      case 'research':
      {
        if (this.research)
        {
          allocateOrDeallocate(this.research)
          this.eventProxy.emit(GameEvents.POPULATION_CHANGED, this)
          this.eventProxy.emit(GameEvents.RESEARCH_CHANGED, this)
        }
        break
      }
      case 'production':
      {
        if (this.production)
        {
          allocateOrDeallocate(this.production)

          // recalculate runs
          if (this.production.remainingDuration === Infinity)
          {
            this.production.totalDuration = Infinity
          }
          else
          {
            this.production.totalDuration = Math.max((this.production.duration * (this.production.runs - 1)) + this.production.remainingDuration, 0)
          }

          this.eventProxy.emit(GameEvents.POPULATION_CHANGED, this)
          this.eventProxy.emit(GameEvents.PRODUCTION_CHANGED, this)
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
          allocateOrDeallocate(construction)
          this.eventProxy.emit(GameEvents.POPULATION_CHANGED, this)
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
          allocateOrDeallocate(resource)
          this.eventProxy.emit(GameEvents.POPULATION_CHANGED, this)
        }
        break
      }
    }
  }

  changeProductionRuns(value)
  {
    if (this.production)
    {
      if (this.production === Infinity && value < 0)
      {
        this.production = 100 + value
      }
      else
      {
        this.production.runs = this.production.runs + value

        if (this.production.runs > 100)
        {
          this.production.runs = Infinity
        }
      }

      this.eventProxy.emit(GameEvents.PRODUCTION_CHANGED, this)
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
  
        this.eventProxy.emit(GameEvents.RESEARCH_CHANGED, this)
      }
    }
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
        // Base duration
        baseDuration: tech.researchDuration,
        // duration based on allocated population
        duration: 0,
        // research progress
        progress: 0,
        // Remaining duration (base duration - progress)
        remainingDuration: Infinity,
        // Total duration for all runs
        totalDuration: Infinity,
      }

      this.eventProxy.emit(GameEvents.PRODUCTION_CHANGED, this)
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
        if (technology.requiresProduction)
        {
          /**
           * FIXME current there is `available` used as true / false to update the UI
           * and there is `produced` to indicate how many of the technology has been
           * made (factory not required)
           * but maybe `available` boolean is not required and confusing. The UI can use
           * produced to show a number or if produced === 0 check requiresProduction
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

    this.eventProxy.emit(GameEvents.ARMY_CHANGED, this)
    this.eventProxy.emit(GameEvents.RESOURCES_CHANGED, this)
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

    this.eventProxy.emit(GameEvents.ARMY_CHANGED, this)
    this.eventProxy.emit(GameEvents.RESOURCES_CHANGED, this)
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
        if (technology.requiresProduction)
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

    this.eventProxy.emit(GameEvents.ARMY_CHANGED, this)
  }

  disbandPendingArmy(deployed = false)
  {
    if (deployed === false)
    {
      this.pendingArmy.forEach(group => {
        this._removeUnitsFromArmy(group.type, group.quantity)
      })
    }

    this.pendingArmy = []

    this.eventProxy.emit(GameEvents.ARMY_CHANGED, this)
    this.eventProxy.emit(GameEvents.RESOURCES_CHANGED, this)
  }
}
