import Phaser from 'phaser'
import MiniMap from '../components/minimap.js'
import { DefaultKeys, PlayerStates, GameEvents, Teams, UserEvents, BuildingTypes } from '../defines.js'
import { getKeyForSector } from '../utilities'
import Sector from './sector'
import Store from './data/store'
import PlayerTeamShields from './teamshield'
import SectorControls from './sectorcontrols/'
import clone from 'lodash.clonedeep'


export default class IslandScene extends Phaser.Scene
{
  constructor(config)
  {
    super({
      ...config,
      key: 'island',
      physics: {
        default: 'arcade',
        arcade: {
          debug: false
        }
      },
    })

    window.GAME_SCENE = this
  }

  init(options)
  {
    console.log("Island.init", options)
    this.store = new Store(this, options)
  }

  preload()
  {
  }

  create()
  {
    const { width, height } = this.sys.game.canvas

    this.state = PlayerStates.DEFAULT
    this.activeSector = undefined
    this.activeArmySectorIndex = undefined

    // game data could be scene.data or scene.game.registry?
    this.data.set({
      // (dev) current team
      team: Teams.RED,
    })

    // Create the minimap
    this.add.existing(new MiniMap(this, 40, 40, this.store.island))

    this.add.existing(new PlayerTeamShields(this, 90, 28, this.store.players.map(p => p.team)))

    this.sectorControls = new SectorControls(this, 50, 120)
    this.add.existing(this.sectorControls)

    // Create the Sector view
    this.add.existing(new Sector(this, 250, 120, { style: this.store.island.style, epoch: 1 }))

    const units = this.physics.add.group()
    this.projectiles = this.physics.add.group()
    this.units = units

    // debug text
    this.debugText = this.add.text(0, height - 12, ``, { fontSize: 12 });

    this.events.on(UserEvents.SECTOR_CONTROLS_VIEW_CHANGE, name => {
      this.sectorControls.switch(name, this.activeSector)
    })
    this.events.on(UserEvents.SECTOR_SELECT, this.onSectorSelected, this)
    // Listen to the sector selection event (emitted by the minimap)
    // TODO should this be emitted on the map to which the Scene listens?
    this.events.on(UserEvents.SECTOR_MAP_SELECT, this.onMapSectorSelected, this)
    this.events.on(UserEvents.BUILDING_SELECT, this.onBuildingSelected, this)
    this.events.on(UserEvents.BUILDING_SELECT_DEFENDER_POSITION, this.onBuildingPositionSelected, this)
    this.events.on(UserEvents.REQUEST_ALLIANCE, this.onRequestAlliance, this)
    this.events.on(UserEvents.BREAK_ALLIANCES, this.onBreakAlliances, this)

    this.events.on(UserEvents.SELECT_RESEARCH, technology => {
      this.activeSector.beginResearch(technology)
    });
    this.events.on(UserEvents.SELECT_PRODUCTION, technology => {
      this.activeSector.beginProduction(technology)
    });

    this.events.on(UserEvents.CHANGE_MINERS, (...args) => {
      this.store.changeMiners(this.activeSector.id, ...args)
    })
    this.events.on(UserEvents.CHANGE_RESEARCHERS, (...args) => {
      this.store.changeResearchers(this.activeSector.id, ...args)
    })
    this.events.on(UserEvents.CHANGE_BUILDERS, (...args) => {
      this.store.changeBuilders(this.activeSector.id, ...args)
    })
    this.events.on(UserEvents.CHANGE_MANUFACTURERS, (...args) => {
      this.store.changeManufacturers(this.activeSector.id, ...args)
    })
    this.events.on(UserEvents.CHANGE_PRODUCTION_RUNS, (...args) => {
      this.store.changeProductionRuns(this.activeSector.id, ...args)
    })

    this.events.on(UserEvents.ADD_TO_ARMY, (...args) => {
      this.state = PlayerStates.DEPLOY_ARMY
      this.store.addToArmy(this.activeSector.id, ...args)
    })
    this.events.on(UserEvents.DISCARD_ARMY_IN_HAND, (...args) => {
      this.state = PlayerStates.DEFAULT
      this.store.discardPendingArmy(this.activeSector.id, ...args)
    })

    // Game update events
    const updateSectorControls = sector => {
      if (this.activeSector.id === sector.id)
      {
        this.sectorControls.refresh(this.activeSector)
      }
    }

    this.events.on(GameEvents.RESOURCES_CHANGED, updateSectorControls)
    this.events.on(GameEvents.POPULATION_CHANGED, updateSectorControls)
    this.events.on(GameEvents.ARMY_CHANGED, updateSectorControls)
    this.events.on(GameEvents.RESEARCH_CHANGED, updateSectorControls)
    this.events.on(GameEvents.PRODUCTION_CHANGED, updateSectorControls)

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


    // Select the sector, always do this last
    setTimeout(() => {
      // Setup after the scene has been initialized so that the store events
      // can update the GameObjects as required
      this.store.start()

      // Find the first local player sector (for loading, selected sector should be saved)
      const localPlayerSector = Object.values(this.store.sectors).find(s => {
        return s.owner === this.data.get('team')
      })

      this.onMapSectorSelected({}, localPlayerSector.id)
    })

    this.events.on('projectile:spawn', (obj, position, velocity, unitType) => {
      switch (unitType)
      {
        case 'rock':
        {
          break
        }
        case 'stone':
        {
          const p = new Projectile(this, position.x, position.y, 'stone')
          this.projectiles.add(p, true)
          p.body.setVelocity(velocity.x, velocity.y)
          break
        }
        default:
        {
          console.log(`Unhandled unit type for projectile`)
          break
        }
      }
    })

    this.input.keyboard.on('keydown', event => {
      // TODO keyboard shortcuts
    })

    this.bindings = this.input.keyboard.addKeys(DefaultKeys)
  }

  getActiveSector()
  {
    return this.activeSector
  }

  update(time, delta)
  {
    this.debugText.setText(`Sector ${this.activeSector?.id}, Team ${this.data.get('team')}`)

    this.store.tick(time, delta)
  }

  onRequestAlliance(otherTeam)
  {
    // TODO player cannot ally with everyone at the same time.
    const localPlayer = this.data.get('team')
    if (localPlayer !== otherTeam && this.store.isAllied(localPlayer, otherTeam) === false)
    {
      // Check if the other player actually wants to be allied
      this.store.makeAlliance(localPlayer, otherTeam)
    }
  }

  onBreakAlliances()
  {
    const localPlayer = this.data.get('team')
    if (this.store.isAllied(localPlayer) === true)
    {
      this.store.breakAlliances(localPlayer)
    }
  }

  onMapSectorSelected(pointer, index)
  {
    console.debug(`onMapSectorSelected button=${pointer.button}, sector=${index}, state=${this.state}`)

    const team = this.data.get('team')

    if (pointer.button === 2) // Right
    {
      if (this.store.hasArmy(index, team))
      {
        this.state = PlayerStates.MOVE_ARMY
        this.activeArmySectorIndex = index
        this.events.emit(GameEvents.SECTOR_ACTIVATE_ARMY, index, team)
      }
    }
    else // Left
    {
      switch (this.state)
      {
        case PlayerStates.DEPLOY_ARMY:
        {
          this.store.deployArmy(this.activeSector.id, {}, index)
          this.state = PlayerStates.DEFAULT
          break
        }
        case PlayerStates.MOVE_ARMY:
        {
          this.store.moveArmy(this.activeArmySectorIndex, index, team)
          this.state = PlayerStates.DEFAULT
          break
        }
        case PlayerStates.DEFAULT:
        {
          if (this.activeSector == null || this.activeSector.id !== index)
          {
            this.projectiles.clear(true, true)

            const key = getKeyForSector(index, this.store.island.map)
            this.activeSector = this.store.sectors[index]

            // Update the sector view
            this.events.emit(GameEvents.SECTOR_VIEW, index, key, this.activeSector.buildings, this.activeSector.armies)
            // this.events.emit(GameEvents.ACTIVATE_SECTOR, clone(sec))
            
            // Update the sector controls
            this.sectorControls.display(this.activeSector)
          }
          break
        }
      }
    }
  }

  /**
   * Handle click on the Sector Game Object
   * @param {*} pointer 
   */
  onSectorSelected(pointer)
  {
    console.debug(`onSectorSelected; button=${pointer.button}`)

    const team = this.data.get('team')

    if (pointer.button === 0) // Left
    {
      if (this.state === PlayerStates.DEPLOY_ARMY)
      {
        // Deploy army
        this.store.deployArmy(this.activeSector.id, {})
        this.state = PlayerStates.DEFAULT
      }
    }
    else if (pointer.button === 2) // Right
    {
      if (this.store.hasArmy(this.activeSector.id, team))
      {
        this.state = PlayerStates.MOVE_ARMY
        this.activeArmySectorIndex = this.activeSector.id
        this.events.emit(GameEvents.SECTOR_ACTIVATE_ARMY, this.activeSector, team)
      }
    }
  }

  /**
   * Handle click on the Sector buildings
   * @param {*} building 
   */
  onBuildingSelected(building)
  {
    console.debug(`onBuildingSelected; button=${pointer.button}, building=${building}`)

    // Check the player is in placement mode
    // Check if the sector has the required population
    // Check if the sector has the required resources
    // Check a position is free
    let position
    for (let i = 0; i < 4; i++)
    {
      if (this.store.hasDefender(this.sector, building, i) === false)
      {
        position = i
        break
      }
    }
    
    if (position != null)
    {
      // Place the defender
      this.store.addDefender(this.sector, building, position, 'stick')
    }
  }

  /**
   * Handle click on a building defender position
   * @param {*} building 
   * @param {*} position 
   */
  onBuildingPositionSelected(building, position)
  {
    console.debug(UserEvents.BUILDING_SELECT_DEFENDER_POSITION, building, position)

    // if placement mode
    // preplacement checks
    // this.store.placeDefender(sector, building, 'stick')
    // else
    // remove defender

    if (this.store.hasDefender(this.sector, building, position))
    {
      this.store.removeDefender(this.sector, building, position)
    }
    else
    {
      this.store.addDefender(this.sector, building, position, 'stick')
    }
  }
}
