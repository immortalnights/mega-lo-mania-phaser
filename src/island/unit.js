import Phaser from 'phaser'
import { Teams, UnitTypes } from '../defines.js'

const UNIT_WALK_VELOCITY = 20
const UNIT_FLY_VELOCITY_X = 100
const UNIT_FLY_VELOCITY_Y = 60

const AttackComponent = {

}

const UnitStates = {
  SPAWNING: 'unit:spawning',
  WANDERING: 'unit:wandering',
  ATTACKING: 'unit:attacking',
  DYING: 'unit:dying'
}

const PROJECTILE_MULTIPLIER = new Phaser.Math.Vector2({
  x: 6,
  y: 6
})

export class DefenseUnit extends Phaser.GameObjects.Sprite
{

}

export default class GroundUnit extends Phaser.Physics.Arcade.Sprite
{
  constructor(scene, x, y, config)
  {
    super(scene, x, y, '', '')

    this.type = config.type
    this.team = config.team
    this.direction = ''
    this.state = config.spawn ? UnitStates.SPAWNING : UnitStates.WANDERING

    // Do something different after 0.5s to 2s
    this.cooldown = Phaser.Math.RND.between(500, 2000)
    this.lastAttack = 0

    const onSpawnCompleted = function() {
      this.state = UnitStates.WANDERING
      this.setTexture(this.type === 'stone' ? `mlm_icons-${this.team}` : `mlm_units-${this.team}`)
      this.changeDirection()
    }

    if (config.spawn)
    {
      this.state = UnitStates.SPAWNING
      this.setTexture('mlm_icons')
      this.setFrame('spawn_00')
      this.once(Phaser.GameObjects.Events.ADDED_TO_SCENE, () => {
        this.once('animationcomplete', onSpawnCompleted, this)
        this.play('spawn', true)
      })
    }
    else
    {
      this.once(Phaser.GameObjects.Events.ADDED_TO_SCENE, onSpawnCompleted, this)
    }
  }

  getCanAttack(time)
  {
    const hasEnemiesInSector = false
    let canAttack

    if (hasEnemiesInSector === false)
    {
      // No enemies, no attacking
      // console.log("No enemies")
    }
    // Don't attack more then every two seconds
    else if (this.lastAttack + 2000 > time)
    {
      // Too soon
      // console.log("Too soon")
    }
    // 25% chance of an attack
    else if (Phaser.Math.RND.realInRange(0, 1) > 0.25)
    {
      // console.log("Random failure")
    }
    else
    {
      canAttack = true
    }

    return canAttack
  }

  preUpdate(time, delta)
  {
    super.preUpdate(time, delta)

    // Action cooldown
    this.cooldown = Phaser.Math.MinSub(this.cooldown, delta, 0)
    let action = this.cooldown <= 0

    if (action)
    {
      this.cooldown = Phaser.Math.RND.between(500, 2000)
    }

    switch (this.state)
    {
      case UnitStates.SPAWNING:
      {
        // Nothing
        break
      }
      case UnitStates.WANDERING:
      {
        if (action)
        {
          // can attack if there are enemies in the same sector
          const attacking = this.getCanAttack(time)

          if (attacking)
          {
            const velocity = this.body.velocity.clone().multiply(PROJECTILE_MULTIPLIER)
            // console.log("Attack velocity", velocity)

            // stop the walk animation
            this.stop()
            // stop the movement
            this.body.stop()
            this.setFrame(`${this.unitType}_${this.direction}_attacked_00`)
            this.cooldown = Phaser.Math.RND.between(500, 750)
            this.lastAttack = time

            this.scene.events.emit('projectile:spawn', this, this.body.position, velocity, this.unitType)
          }
          else
          {
            this.changeDirection()
          }
        }
        break
      }
      case UnitStates.ATTACKING:
      {
        break
      }
    }
  }

  changeDirection()
  {
    let x = Phaser.Math.RND.between(-UNIT_WALK_VELOCITY, UNIT_WALK_VELOCITY)
    let y = Phaser.Math.RND.between(-UNIT_WALK_VELOCITY, UNIT_WALK_VELOCITY)

    if (Math.abs(x) > Math.abs(y))
    {
      // Left or Right
      x = x < 0 ? x - 20 : x + 20
      this.direction = x < 0 ? 'left' : 'right'
    }
    else
    {
      // Up or Down
      y = y < 0 ? y - 20 : y + 20
      this.direction = y < 0 ? 'up' : 'down'
    }

    this.body.setVelocity(x, y)

    this.play(`${this.team}_${this.type}_walk_${this.direction}`, true)
  }

  despawn(dead)
  {
    return new Promise((resolve, reject) => {
      if (dead)
      {
        this.once('animationcomplete', resolve())
        this.play('despawn', true)
      }
      else
      {
        this.once('animationcomplete', resolve())
        this.playReverse('spawn', true)
      }
    })
  }
}

export class FlyingUnit extends Phaser.Physics.Arcade.Sprite
{

  constructor(scene, x, y, config)
  {
    super(scene, x, y, `mlm_units`)

    this.type = config.type
    this.team = config.team
    this.state = UnitStates.WANDERING

    let speedMultiplier = 1
    switch (this.type)
    {
      case 'biplane':
      {
        speedMultiplier = Phaser.Math.FloatBetween(0.75, 1.25)
        this.setFrame(`${config.team}_${config.type}`)
        break
      }
      case 'jet':
      {
        speedMultiplier = Phaser.Math.FloatBetween(1.5, 2)
        this.setFrame(`${config.team}_${config.type}`)
        break
      }
      case 'flyingsaucer':
      {
        this.setTexture(`mlm_units-${this.team}`)
        this.setFrame('flyingsaucer_00')
        speedMultiplier = Phaser.Math.FloatBetween(2.25, 2.75)
        break
      }
    }

    this.once(Phaser.GameObjects.Events.ADDED_TO_SCENE, () => {
      this.body.setVelocity(-(UNIT_FLY_VELOCITY_X * speedMultiplier), -(UNIT_FLY_VELOCITY_Y * speedMultiplier))
    })
  }

  preUpdate(time, delta)
  {
    super.preUpdate(time, delta)

    // reset position if offscreen (with delay)
    // if (this.x > this.scene || this.y > this.scene)

  }
}

export class NuclearMissile extends Phaser.GameObjects.Sprite
{

}