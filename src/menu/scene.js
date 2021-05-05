import Phaser from 'phaser'


export default class MenuScene extends Phaser.Scene
{
  constructor(config)
  {
    super({
      ...config,
      key: 'menu',
    })
  }
}