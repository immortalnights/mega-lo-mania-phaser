import Phaser, { Scene } from 'phaser'

export default class SpriteTest extends Scene
{
  constructor(config)
  {
    super({
      ...config,
      key: 'spritetest',
    })
  }

  create()
  {
    this.cameras.main.setBackgroundColor('#444444')

    const sprites = this.game.cache.json.get('mlm_units_data')
    console.log(sprites)

    sprites.frames.forEach(frame => {
      this.add.image(2 + (frame.frame.w / 2) + frame.frame.x, 2 + (frame.frame.h / 2) + frame.frame.y, 'mlm_units', frame.filename)
    })
  }
}