import Phaser from 'phaser'
import { Teams, UnitTypes } from './defines.js'

const UNIT_WALK_VELOCITY = 20
const UNIT_FLY_VELOCITY = 220

const WonderMovementComponent = {

}

const FlyOverMovementComponent = {

}

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

export default class Unit extends Phaser.Physics.Arcade.Sprite
{
  constructor(scene, x, y, config)
  {
    super(scene, x, y, 'mlm_icons', 'spawn_00')

    Object.defineProperties(this, {
      unitType: {
        get()
        {
          return this.getData('type')
        }
      },
      team: {
        get()
        {
          return this.getData('team')
        }
      },
    })

    this.setData(config)

    this.direction = 'left'

    // config.spawn
    this.state = config.spawn ? UnitStates.SPAWNING : ''

    // Do something different after 0.5s to 2s
    this.cooldown = Phaser.Math.RND.between(500, 2000)
    this.lastAttack = 0

    this.unitTexture = this.unitType === 'stone' ? 'mlm_icons' : 'mlm_units'

    // FIXME
    this.once(Phaser.GameObjects.Events.ADDED_TO_SCENE, this.onAddedToScene, this)
  }

  onAddedToScene()
  {
    const onSpawnComplete = () => {
      const frame = `${this.unitType}_${this.direction}_00`
      this.setTexture(`${this.unitTexture}-${this.team}`, frame)

      if (!this.data.get('defender'))
      {
        this.state = UnitStates.WANDERING
        this.changeDirection()
      }
    }

    if (this.state === UnitStates.SPAWNING)
    {
      this.play('spawn', true)
      this.once('animationcomplete', onSpawnComplete)
    }
    else
    {
      onSpawnComplete()
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

  // TEST allow unit type to be changed at run time
  setType(type)
  {
    this.unitType = type
    this.setFrame(`${this.team}_${this.unitType}_${this.direction}_000`)
    // console.log(this.unitType, type, this.anims.currentAnim.key)
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

    this.play(`${this.team}_${this.unitType}_walk_${this.direction}`, true)
  }

  applyComponent(name, options)
  {

  }
}
