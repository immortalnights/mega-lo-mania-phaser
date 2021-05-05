import Phaser from 'phaser'


export default class PauseMenuScene extends Phaser.Scene
{
  constructor(config)
  {
    super({
      ...config,
      key: 'pausemenu',
    })
  }
}