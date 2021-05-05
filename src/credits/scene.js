import Phaser from 'phaser'


export default class CreditsScene extends Phaser.Scene
{
  constructor(config)
  {
    super({
      ...config,
      key: 'credits',
    })
  }
}