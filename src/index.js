import Phaser from 'phaser'
import TransparentColorsPipeline from './transparent-colors-pipeline.ts'
import Unit from './unit.js'
import animationFactory from './unitannimations.js'
import UnitSpawn from './unitspawn'

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
    this.load.atlas('mlm_armies', './mlm_armies.png', './mlm_armies.json')
    this.load.atlas('mlm_icons', './mlm_icons.png', './mlm_icons.json')
  }

  create()
  {
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
      repeat: 0,
      hideOnComplete: true
    });

    const spawner = new UnitSpawn(this, 100, 100)
    spawner.setScale(2)
    spawner.on('animationcomplete', () => {
      const u = new Unit(this, 100, 100, 'stone_down_000')
      u.setScale(2)
      this.add.existing(u)
      this.physics.add.existing(u)
      this.u = u
    })
    this.add.existing(spawner)

    this.bindings = this.input.keyboard.addKeys(DefaultKeys)
  }

  update()
  {
    if (this.bindings.one.isDown)
    {
      this.u.setType('stone')
    }
    else if (this.bindings.two.isDown)
    {
      this.u.setType('sling')
    }
    else if (this.bindings.three.isDown)
    {
      this.u.setType('spear')
    }

    if (this.bindings.left.isDown)
    {
      this.u.setDirection('left')
    }
    else if (this.bindings.right.isDown)
    {
      this.u.setDirection('right')
    }

    if (this.bindings.up.isDown)
    {
      this.u.setDirection('up')
    }
    else if (this.bindings.down.isDown)
    {
      this.u.setDirection('down')
    }

    if (this.bindings.space.isDown)
    {
      this.u.setDirection('none')
    }
  }
}

const config = {
  type: Phaser.WEBGL,
  width: 800,
  height: 600,
  scene: MyGame,
  seed: [ 'T' ],
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
