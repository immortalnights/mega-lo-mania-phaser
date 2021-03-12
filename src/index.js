import Phaser from 'phaser'
import TransparentColorsPipeline from './transparent-colors-pipeline.ts'
import Unit from './unit.js'
import Building from './building.js'
import MiniMap from './minimap.js'
import { DefaultKeys, GameEvents, BuildingTypes, Teams, UnitTypes, UserEvents } from './defines.js'
import { getKeyForSector } from './utilities'
import animationFactory from './animationfactory.js'
import Sector from './sector'
import Store from './store'

// const shader = new TransparentColorsPipeline(game, [[124, 154, 160], [92, 100, 108]]);
// const renderer = game.renderer as Phaser.Renderer.WebGL.WebGLRenderer;
// renderer.addPipeline('transparent-colors', shader);

// const image = new Phaser.GameObjects.Image(this, x, y, 'textureName');
// image.setPipeline('transparent-colors');
// this.add.existing(image);

class IslandGameScene extends Phaser.Scene
{
  constructor(config)
  {
    super({
      ...config,
      key: 'game',
      physics: {
        default: 'arcade',
        arcade: {
          debug: false
        }
      },
    })
  }

  preload()
  {
    this.load.atlas('mlm_units', './mlm_units.png', './mlm_units.json')
    this.load.atlas('mlm_icons', './mlm_icons.png', './mlm_icons.json')
    this.load.atlas('mlm_buildings', './mlm_buildings.png', './mlm_buildings.json')
    this.load.atlas('mlm_smallmap', './mlm_smallmap.png', './mlm_smallmap.json')
    this.load.image('mlm_slab', './mlm_slabs.png')
    // this.load.atlas('mlm_features', './mlm_features_count.png', './mlm_features.json')
    this.load.atlas('mlm_features', './mlm_features.png', './mlm_features.json')
  }

  create()
  {
    const { width, height } = this.sys.game.canvas

    animationFactory.createUnitAnimations(this)
    animationFactory.createSpawnAnimation(this)
    animationFactory.createFlagAnimations(this)
    animationFactory.createProjectileAnimations(this)

    // game data could be scene.data or scene.game.registry?
    let sector = -1;
    const teams = Object.values(Teams)
    let team = 0
    let epoch = 0

    const store = new Store(this)
    store.setIsland("Quota")

    // Create the minimap
    this.add.existing(new MiniMap(this, 20, 40, store.island))

    // Create the Sector  view
    this.add.existing(new Sector(this, 250, 120, { style: store.island.style }))

    const units = this.physics.add.group()
    const projectiles = this.physics.add.group()
    this.units = units

    // debug text
    this.debugText = this.add.text(0, 0, ``);
    const updateDebugText = () => {
      this.debugText.setText(`Sector ${sector}, Team ${teams[team]}, Epoch ${epoch}`)
    }

    // Listen to the sector selection event (emitted by the minimap)
    // TODO should this be emitted on the map to which the Scene listens?
    this.events.on(UserEvents.SECTOR_SELECT, (index, key) => {
      console.debug(UserEvents.SECTOR_SELECT, index, key)

      sector = index

      // Find the sector data from the game data...
      const sec = store.sectors[sector]
      this.events.emit(GameEvents.SECTOR_VIEW, index, key, sec.buildings.map(), {/*armies*/})

      updateDebugText()
    })

    this.events.on(UserEvents.BUILDING_SELECT, building => {
      console.debug(UserEvents.BUILDING_SELECT, building)

      // Check the player is in placement mode
      // Check if the sector has the required population
      // Check if the sector has the required resources
      // Check a position is free
      let position
      for (let i = 0; i < 4; i++)
      {
        if (store.hasDefender(sector, building, i) === false)
        {
          position = i
          break
        }
      }

      if (position != null)
      {
        // Place the defender
        store.addDefender(sector, building, position, 'stick')
      }
    })

    this.events.on(UserEvents.BUILDING_SELECT_DEFENDER_POSITION, (building, position) => {
      console.debug(UserEvents.BUILDING_SELECT_DEFENDER_POSITION, building, position)

      // if placement mode
      // preplacement checks
      // store.placeDefender(sector, building, 'stick')
      // else
      // remove defender

      if (store.hasDefender(sector, building, position))
      {
        store.removeDefender(sector, building, position)
      }
      else
      {
        store.addDefender(sector, building, position, 'stick')
      }
    })

    // Trigger the selection of first sector of the island
    // FIXME!

    // Place player and AI in random locations; select the player sector
    const indexes = []
    store.island.map.forEach((value, index) => {
      if (value)
      {
        indexes.push(index)
      }
    })

    // random player castle (red)
    let position = Phaser.Math.RND.pick(indexes)
    // store.sectors[position].buildings.build('castle', Teams.RED)
    store.buildBuilding(position, 'castle', Teams.RED)


    // not ideal
    const key = getKeyForSector(position, store.island.map)

    this.events.emit(UserEvents.SECTOR_SELECT, position, key)

    indexes.splice(indexes.findIndex(v => v === position), 1)

    // random AI castle (blue)
    position = Phaser.Math.RND.pick(indexes)
    store.buildBuilding(position, 'castle', Teams.BLUE)

    // Use a zone to spawn in a specific location
    // for (let i = 0; i < 1; i++)
    // {
    //   const u = new Unit(this, 0, 0, {
    //     team: Teams.RED,
    //     type: UnitTypes.STONE,
    //   })
    //   u.setRandomPosition()
    //   units.add(u, true)
    // }

    // this.events.on('projectile:spawn', (obj, position, velocity, unitType) => {
    //   const p = new Phaser.GameObjects.Sprite(this, position.x, position.y, 'mlm_units', 'stone_projectile_000')
    //   p.play('stone_projectile')
    //   projectiles.add(p, true)
    //   p.body.setVelocity(velocity.x, velocity.y)
    // })

    // let epoch = 6
    // const building = new Building(this, 100, 100, {
    //   type: BuildingTypes.CASTLE,
    //   team: Teams.RED,
    //   epoch: epoch
    // })
    // this.add.existing(building)
    // this.physics.add.existing(building)

    this.input.keyboard.on('keydown', event => {
      if (event.key === '+')
      {
        epoch++
      }
      else if (event.key === '-')
      {
        epoch--
      }

      epoch = Phaser.Math.Wrap(epoch, 0, 9)

      if (event.key === 'PageUp')
      {
        sector++
      }
      else if (event.key === 'PageDown')
      {
        sector--
      }

      sector = Phaser.Math.Wrap(sector, 0, 16)

      if (event.key === 'Home')
      {
        team++
      }
      else if (event.key === 'End')
      {
        team--
      }

      team = Phaser.Math.Wrap(team, 0, 4)

      if (event.key === 'z')
      {
        store.buildBuilding(sector, 'castle', teams[team])
      }
      else if (event.key === 'x')
      {
        store.destroyBuilding(sector, 'castle')
      }

      if (event.key === 'c')
      {
        this.events.emit('game:sector:add_army', sector, teams[team])
      }
      else if (event.key === 'v')
      {
        this.events.emit('game:sector:remove_army', sector, teams[team])
      }

      if (event.key === 'b')
      {
        this.events.emit('game:sector:start_claim', sector, teams[team])
      }
      else if (event.key === 'n')
      {
        this.events.emit('game:sector:stop_claim', sector, teams[team])
      }

      updateDebugText()
    })

    this.bindings = this.input.keyboard.addKeys(DefaultKeys)
  }

  update()
  {
    let newType = ''
    if (this.bindings.one.isDown)
    {
      newType = 'stone'
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
  }
}

const config = {
  type: Phaser.WEBGL,
  width: 400,
  height: 300,
  zoom: 2,
  scene: IslandGameScene,
  seed: [ 'T' ],
  // backgroundColor: 0x005500,
  loader: {
    baseUrl: '.',
    path: process.env.NODE_ENV === 'production' ? './assets' : './src/assets'
  },
  disableContextMenu: true,
  banner: {
    background: [ '#000000' ],
  }
}

const game = new Phaser.Game(config)
