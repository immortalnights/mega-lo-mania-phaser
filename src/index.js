import Phaser from 'phaser'
import TransparentColorsPipeline from './transparent-colors-pipeline.ts'
import Unit from './unit.js'
import Building from './building.js'
import { DefaultKeys, BuildingTypes, Teams, UnitTypes } from './defines.js'
import animationFactory from './animationfactory.js'

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
  }

  create()
  {
    const { width, height } = this.sys.game.canvas

    animationFactory.createUnitAnimations(this)
    animationFactory.createSpawnAnimation(this)
    animationFactory.createFlagAnimations(this)

    this.anims.create({
      key: `stone_projectile`,
      frames: this.anims.generateFrameNames('mlm_units', {
        prefix: `stone_projectile_`,
        end: 3,
        zeroPad: 3,
      }),
      frameRate: 12,
      yoyo: false,
      repeat: 0
    });

    const units = this.physics.add.group()
    this.units = units
    const projectiles = this.physics.add.group()

    // Use a zone to spawn in a specific location
    for (let i = 0; i < 1; i++)
    {
      const u = new Unit(this, 0, 0, {
        team: Teams.RED,
        type: UnitTypes.STONE,
      })
      u.setRandomPosition()
      units.add(u, true)
    }

    this.events.on('projectile:spawn', (obj, position, velocity, unitType) => {
      const p = new Phaser.GameObjects.Sprite(this, position.x, position.y, 'mlm_units', 'stone_projectile_000')
      p.play('stone_projectile')
      projectiles.add(p, true)
      p.body.setVelocity(velocity.x, velocity.y)
    })

    let tech = 6
    const building = new Building(this, 100, 100, {
      type: BuildingTypes.CASTLE,
      team: Teams.RED,
      techLevel: tech
    })
    this.add.existing(building)
    this.physics.add.existing(building)

    this.input.keyboard.on('keydown', event => {
      if (event.key === '+')
      {
        building.advance(++tech)
      }
      else if (event.key === '-')
      {
        building.advance(--tech)
      }

      console.log(tech)
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
  backgroundColor: 0x005500,
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
