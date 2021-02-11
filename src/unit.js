import Phaser from 'phaser'

const UNIT_WALK_VELOCITY = 20
const UNIT_FLY_VELOCITY = 220

const WonderMovementComponent = {

}

const FlyOverMovementComponent = {

}

const AttackComponent = {

}

export default class Unit extends Phaser.Physics.Arcade.Sprite
{
  constructor(scene, x, y, frame)
  {
   super(scene, x, y, 'mlm_armies', frame)

   this.unitType = 'stone'
   this.direction = 'none'
  }

  // TEST allow unit type to be changed at run time
  setType(type)
  {
    this.unitType = type
    this.setDirection(this.direction)
    console.log(this.unitType, type, this.anims.currentAnim.key)
  }

  // FIXME only valid for wondering units
  setDirection(direction)
  {
    this.direction = direction
    switch (direction)
    {
      case 'up':
      {
        this.body.setVelocity(0, -UNIT_WALK_VELOCITY)
        this.play(`${this.unitType}_walk_up`, true)
        break
      }
      case 'down':
      {
        this.body.setVelocity(0, UNIT_WALK_VELOCITY)
        this.play(`${this.unitType}_walk_down`, true)
        break
      }
      case 'left':
      {
        this.body.setVelocity(-UNIT_WALK_VELOCITY, 0)
        this.play(`${this.unitType}_walk_left`, true)
        break
      }
      case 'right':
      {
        this.body.setVelocity(UNIT_WALK_VELOCITY, 0)
        this.play(`${this.unitType}_walk_right`, true)
        break
      }
      case 'none':
      {
        this.body.setVelocity(0, 0)
        this.stop()
        break
      }
    }
  }

  applyComponent(name, options)
  {

  }
}