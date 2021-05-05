import Phaser from 'phaser'


export default class CharacterSelectScene extends Phaser.Scene
{
  constructor(config)
  {
    super({
      ...config,
      key: 'characterselect',
    })
  }
}