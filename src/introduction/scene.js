import Phaser from 'phaser'


export default class IntroductionScene extends Phaser.Scene
{
  constructor(config)
  {
    super({
      ...config,
      key: 'introduction',
    })
  }
}