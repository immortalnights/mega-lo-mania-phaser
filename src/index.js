import Phaser from 'phaser'
import TransparentColorsPipeline from './transparent-colors-pipeline.ts'
import Unit from './unit.js'
import animationFactory from './unitannimations.js'

// const shader = new TransparentColorsPipeline(game, [[124, 154, 160], [92, 100, 108]]);
// const renderer = game.renderer as Phaser.Renderer.WebGL.WebGLRenderer;
// renderer.addPipeline('transparent-colors', shader);

// const image = new Phaser.GameObjects.Image(this, x, y, 'textureName');
// image.setPipeline('transparent-colors');
// this.add.existing(image);

const DefaultKeys = {
  up: 'up',
  down: 'down',
  left: 'left',
  right: 'right',
  space: 'space',
  one: 'one',
  two: 'two',
  three: 'three',
}

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
  }

  create()
  {
    const { width, height } = this.sys.game.canvas

    animationFactory.call(this, ['stone', 'sling', 'spear'])

    this.anims.create({
      key: `spawn`,
      frames: this.anims.generateFrameNames('mlm_icons', {
        prefix: `spawn_`,
        end: 6,
        zeroPad: 3,
      }),
      frameRate: 12,
      yoyo: true,
      repeat: 0
    });

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
    for (let i = 0; i < 100; i++)
    {
      const u = new Unit(this, 0, 0, 'stone')
      u.setRandomPosition()
      u.setScale(2)
      units.add(u, true)
    }

    this.events.on('projectile:spawn', (obj, position, velocity, unitType) => {
      const p = new Phaser.GameObjects.Sprite(this, position.x, position.y, 'mlm_units', 'stone_projectile_000')
      p.setScale(2)
      p.play('stone_projectile')
      projectiles.add(p, true)
      p.body.setVelocity(velocity.x, velocity.y)
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
  width: 800,
  height: 600,
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
