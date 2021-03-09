import Phaser from 'phaser'
import TransparentColorsPipeline from './transparent-colors-pipeline.ts'
import Unit from './unit.js'
import Building from './building.js'
import MiniMap from './minimap.js'
import { DefaultKeys, GameEvents, BuildingTypes, Teams, UnitTypes } from './defines.js'
import animationFactory from './animationfactory.js'
import Sector from './sector'

// const shader = new TransparentColorsPipeline(game, [[124, 154, 160], [92, 100, 108]]);
// const renderer = game.renderer as Phaser.Renderer.WebGL.WebGLRenderer;
// renderer.addPipeline('transparent-colors', shader);

// const image = new Phaser.GameObjects.Image(this, x, y, 'textureName');
// image.setPipeline('transparent-colors');
// this.add.existing(image);


class MyGame extends Phaser.Scene
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

    // templates
    this.load.image('1010_sector', './1010_sector.png')
  }

  create()
  {
    const { width, height } = this.sys.game.canvas

    animationFactory.createUnitAnimations(this)
    animationFactory.createSpawnAnimation(this)
    animationFactory.createFlagAnimations(this)
    animationFactory.createProjectileAnimations(this)

    const map = new MiniMap(this, 20, 40, 'Quota')
    this.add.existing(map)

    const units = this.physics.add.group()
    this.units = units
    const projectiles = this.physics.add.group()

    this.add.existing(new Sector(this, 250, 120, { key: '0010' }))

    this.events.on(GameEvents.SECTOR_SELECT, (index, key) => {
      console.debug(GameEvents.SECTOR_SELECT, index, key)
      // Find the sector data from the game data...

      this.events.emit('game:view:sector', index, key, {/*buildings*/}, {/*armies*/})
    })


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

    let sector = 1;
    const teams = [ Teams.RED, Teams.YELLOW, Teams.BLUE, Teams.GREEN ]
    let team = 0

    this.debugText = this.add.text(0, 0, `Sector ${sector}, Team ${teams[team]}`);
    this.input.keyboard.on('keydown', event => {
      if (event.key === '+')
      {
        building.advance(++epoch)
        console.log("Epoch", epoch)
      }
      else if (event.key === '-')
      {
        building.advance(--epoch)
        console.log("Epoch", epoch)
      }

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

      this.debugText.setText(`Sector ${sector}, Team ${teams[team]}`)

      // Select the first sector
      this.events.emit(GameEvents.SECTOR_SELECT, sector)

      if (event.key === 'z')
      {
        this.events.emit('game:sector:add_castle', sector, teams[team])
      }
      else if (event.key === 'x')
      {
        this.events.emit('game:sector:remove_castle', sector, teams[team])
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

      // Show / hide template
      if (event.key === 'q')
      {
        this.events.emit('sector:show:template')
      }
      else if (event.key === 'w')
      {
        this.events.emit('sector:hide:template')
      }

      // Show / hide features
      if (event.key === 'e')
      {
        this.events.emit('sector:show:features')
      }
      else if (event.key === 'r')
      {
        this.events.emit('sector:hide:features')
      }
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
  scene: MyGame,
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
