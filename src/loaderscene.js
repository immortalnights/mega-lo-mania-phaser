import Phaser from 'phaser'
import animationFactory from './animationfactory'


export default class LoaderScene extends Phaser.Scene
{
  constructor(config)
  {
    super({
      ...config,
      key: 'loader',
    })

    this.nextScene = config.nextScene
    this.nextSceneData = config.nextSceneData
  }

  preload()
  {
    this.load.json('islands', '../data/islands.json')
    this.load.json('technologies', '../data/technologies.json')
    this.load.json('resources', '../data/resources.json')

    this.load.json('mlm_icons_data', './mlm_icons.json')
    this.load.json('mlm_units_data', './mlm_units.json')

    this.load.atlas('mlm_icons', './mlm_icons.png', './mlm_icons.json')
    this.load.atlas('mlm_units', './mlm_units.png', './mlm_units.json')
    this.load.atlas('mlm_buildings', './mlm_buildings.png', './mlm_buildings.json')
    this.load.atlas('mlm_smallmap', './mlm_smallmap.png', './mlm_smallmap.json')
    this.load.atlas('mlm_islands', './mlm_islands.png', './mlm_islands.json')
    this.load.image('mlm_slab', './mlm_slabs.png')
    this.load.atlas('mlm_features', './mlm_features.png', './mlm_features.json')
    this.load.image('paletteswap-template', '/link-palette.png')

    this.load.image('sunrise', './mlm_sunrise.png')

  }

  create()
  {
    // Set default game data
    this.game.registry.set('team', 'red')
    this.game.registry.set('level', 1)
    this.game.registry.set('population', 100)
    this.game.registry.set('completedIslands', [])

    animationFactory.createUnitAnimations(this)
    animationFactory.createSpawnAnimation(this)
    animationFactory.createFlagAnimations(this)
    animationFactory.createProjectileAnimations(this)

    this.scene.start(this.nextScene, this.nextSceneData);
  }
}