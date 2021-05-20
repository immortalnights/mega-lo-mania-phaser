import Phaser from 'phaser'
import MiniMap from '../components/minimap.js'
import { DefaultKeys, PlayerStates, GameEvents, Teams, UserEvents, BuildingTypes } from '../defines.js'
import { getKeyForSector } from '../utilities'
import Sector from './sector'
import Store from './store'
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
    this.store = new Store(this)

    // IslandSetup has whole island data and it should be used!
    this.store.setIsland(options.island.name)
    this.store.players = []
    this.store.setPlayers(options.sectors.map(s => s.team))

    // Get from init data!
    this.localPlayer = Teams.RED


    options.sectors.forEach(s => {
      this.store.buildBuilding(s.index, BuildingTypes.CASTLE, s.team)
    })
  }

  preload()
  {
  }

  create()
  {
    const { width, height } = this.sys.game.canvas


    this.state = PlayerStates.DEFAULT
    this.activeArmySector = undefined

    Object.defineProperties(this, {
      sector: {
        get()
        {
          return this.data.get('sector')
        },
        set(value)
        {
          return this.data.set('sector', value)
        }
      },
    })

    this.sector = undefined

    // game data could be scene.data or scene.game.registry?
    this.data.set({
      // (dev) current team
      team: Teams.RED,
    })

    // Create the minimap
    this.add.existing(new MiniMap(this, 12, 40, this.store.island))

    this.add.existing(new PlayerTeamShields(this, 90, 48, this.store.players.map(p => p.team)))

    // Create the Sector view
    this.add.existing(new Sector(this, 250, 120, { style: this.store.island.style, epoch: 1 }))

    const units = this.physics.add.group()
    this.projectiles = this.physics.add.group()
    this.units = units

    // debug text
    this.debugText = this.add.text(0, 0, ``);

    this.events.on(UserEvents.SECTOR_SELECT, this.onSectorSelected, this)
    // Listen to the sector selection event (emitted by the minimap)
    // TODO should this be emitted on the map to which the Scene listens?
    this.events.on(UserEvents.SECTOR_MAP_SELECT, this.onMapSectorSelected, this)
    this.events.on(UserEvents.BUILDING_SELECT, this.onBuildingSelected, this)
    this.events.on(UserEvents.BUILDING_SELECT_DEFENDER_POSITION, this.onBuildingPositionSelected, this)
    this.events.on(UserEvents.REQUEST_ALLIANCE, this.onRequestAlliance, this)
    this.events.on(UserEvents.BREAK_ALLIANCES, this.onBreakAlliances, this)
    this.events.on(UserEvents.ALLOCATE_POPULATION, this.onAllocatePopulation, this)
    this.events.on(UserEvents.DEALLOCATE_POPULATION, this.onDeallocatePopulation, this)

    // Select the sector, always do this last
    setTimeout(() => {
      // this.events.emit(UserEvents.SECTOR_MAP_SELECT, {}, castles[Teams.RED])
    })

    this.add.existing(new SectorControls(this, 0, 110))

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

    const teamNames = Object.values(Teams)
    this.input.keyboard.on('keydown', event => {
      let team = this.data.get('team')

      let teamIndex = -1
      if (event.key === 'Home')
      {
        teamIndex = teamNames.findIndex(n => n === team)
        teamIndex++
      }
      else if (event.key === 'End')
      {
        teamIndex = teamNames.findIndex(n => n === team)
        teamIndex--
      }

      teamIndex = Phaser.Math.Wrap(teamIndex, 0, 4)
      team = teamNames[teamIndex]
      this.data.set('team', team)

      if (event.key === 'z')
      {
        this.store.buildBuilding(this.sector, 'castle', team)
      }
      else if (event.key === 'x')
      {
        this.store.destroyBuilding(this.sector, 'castle')
      }

      if (event.key === 'c')
      {
        this.events.emit('game:sector:add_army', this.sector, team)
      }
      else if (event.key === 'v')
      {
        this.events.emit('game:sector:remove_army', this.sector, team)
      }

      if (event.key === 'b')
      {
        this.events.emit('game:sector:start_claim', this.sector, team)
      }
      else if (event.key === 'n')
      {
        this.events.emit('game:sector:stop_claim', this.sector, team)
      }
    })

    this.bindings = this.input.keyboard.addKeys(DefaultKeys)
  }

  update()
  {
    let newType = ''
    if (this.bindings.one.isDown)
    {
      newType = 'rock'
    }
    else if (this.bindings.two.isDown)
    {
      newType = 'sling'
    }
    else if (this.bindings.three.isDown)
    {
      newType = 'spear'
    }

    if (newType)
    {
      this.units.getChildren().forEach(u => {
        u.setType(newType)
      })
    }

    this.debugText.setText(`Sector ${this.sector}, Team ${this.data.get('team')}`)
  }

  onRequestAlliance(otherTeam)
  {
    // TODO player cannot ally with everyone at the same time.
    if (this.localPlayer !== otherTeam && this.store.isAllied(this.localPlayer, otherTeam) === false)
    {
      // Check if the other player actually wants to be allied
      this.store.makeAlliance(this.localPlayer, otherTeam)
    }
  }

  onBreakAlliances()
  {
    if (this.store.isAllied(this.localPlayer) === true)
    {
      this.store.breakAlliances(this.localPlayer)
    }
  }

  onMapSectorSelected(pointer, index)
  {
    console.debug(UserEvents.SECTOR_MAP_SELECT, pointer.button, index)

    const team = this.data.get('team')

    if (pointer.button === 2) // Right
    {
      if (this.store.hasArmy(index, team))
      {
        this.state = PlayerStates.MOVE_ARMY
        this.activeArmySector = index
        this.events.emit(GameEvents.SECTOR_ACTIVATE_ARMY, index, team)
      }
    }
    else // Left
    {
      switch (this.state)
      {
        case PlayerStates.DEPLOY_ARMY:
        {
          break
        }
        case PlayerStates.MOVE_ARMY:
        {
          this.store.moveArmy(this.activeArmySector, index, team)
          this.state = PlayerStates.DEFAULT
          break
        }
        case PlayerStates.DEFAULT:
        {
          if (this.sector !== index)
          {
            this.projectiles.clear(true, true)

            this.sector = index

            const key = getKeyForSector(index, this.store.island.map)
            const sec = this.store.sectors[this.sector]
            this.events.emit(GameEvents.SECTOR_VIEW, index, key, sec.buildings, sec.armies)
            this.events.emit(GameEvents.ACTIVATE_SECTOR, clone(sec))
          }
          break
        }
      }
    }
  }

  onSectorSelected(pointer)
  {
    console.debug(UserEvents.BUILDING_SELECT, pointer.button)

    const team = this.data.get('team')

    if (pointer.button === 0) // Left
    {
      // if (this.state === PlayerStates.DEPLOY_ARMY)
      {
        // Deploy army
        this.store.deployArmy(this.sector, {
          rock: 10
        })

        this.state = PlayerStates.DEFAULT
      }
    }
    else if (pointer.button === 2) // Right
    {
      if (this.store.hasArmy(this.sector, team))
      {
        this.state = PlayerStates.MOVE_ARMY
        this.activeArmySector = this.sector
        this.events.emit(GameEvents.SECTOR_ACTIVATE_ARMY, this.sector, team)
      }
    }
  }

  onBuildingSelected(building)
  {
    console.debug(UserEvents.BUILDING_SELECT, building)

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

  onAllocatePopulation(task)
  {
    this.store.allocatePopulation(this.sector, task)
  }

  onDeallocatePopulation(task)
  {
    this.store.deallocatePopulation(this.sector, task)
  }
}
