import Phaser from 'phaser'


const ProjectileStates = {
  OK: 'projectile:ok',
  DYING: 'projectile:dying',
}

class Projectile extends Phaser.GameObjects.Sprite
{
  constructor(scene, x, y, type)
  {
    super(scene, x, y)

    switch (type)
    {
      case 'stone':
      {
        this.setTexture('mlm_units', 'stone_projectile_00')
        this.play('stone_projectile')
        break
      }
    }

    this.life = 300
    this.state = ProjectileStates.OK
  }

  preUpdate(time, delta)
  {
    this.life -= delta

    if (this.life <= 0 && this.state === ProjectileStates.OK)
    {
      this.state = ProjectileStates.DYING
      this.setTexture('mlm_icons', 'ground_explosion_00')

      this.once('animationcomplete', () => {
        this.destroy()
      })

      this.body.stop()
      this.play('ground_explosion')
    }

    super.preUpdate(time, delta)
  }
}
