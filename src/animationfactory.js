import { Teams, UnitTypes } from './defines.js'
import paletteSwap from './paletteswap.js'

const WALK_ANIMATION_FRAMERATE = 12

const createUnitAnimationSet = (manager, team, unit) => {
  const frames = 2
  const padding = 3

  manager.create({
    key: `${team}_${unit}_walk_down`,
    frames: manager.generateFrameNames(`mlm_units-${team}`, {
      prefix: `${unit}_down_`,
      end: frames,
      zeroPad: padding,
    }),
    frameRate: WALK_ANIMATION_FRAMERATE,
    yoyo: true,
    repeat: -1,
  });
  manager.create({
    key: `${team}_${unit}_walk_up`,
    frames: manager.generateFrameNames(`mlm_units-${team}`, {
      prefix: `${unit}_up_`,
      end: frames,
      zeroPad: padding,
    }),
    frameRate: WALK_ANIMATION_FRAMERATE,
    yoyo: true,
    repeat: -1,
  });
  manager.create({
    key: `${team}_${unit}_walk_right`,
    frames: manager.generateFrameNames(`mlm_units-${team}`, {
      prefix: `${unit}_right_`,
      end: frames,
      zeroPad: padding,
    }),
    frameRate: WALK_ANIMATION_FRAMERATE,
    yoyo: true,
    repeat: -1,
  });
  manager.create({
    key: `${team}_${unit}_walk_left`,
    frames: manager.generateFrameNames(`mlm_units-${team}`, {
      prefix: `${unit}_left_`,
      end: frames,
      zeroPad: padding,
    }),
    frameRate: WALK_ANIMATION_FRAMERATE,
    yoyo: true,
    repeat: -1,
  });
}


export const createUnitAnimations = scene => {
  paletteSwap({
    game: scene.game,
    paletteKey: 'paletteswap-template',
    paletteNames: Object.values(Teams),
    spriteSheet: {
      key: 'mlm_units',
      dataKey: 'mlm_units_data'
    }
  })

  Object.values(Teams).forEach(team => {
    Object.values(UnitTypes).forEach(unit => {
      createUnitAnimationSet(scene.anims, team, unit)
    })
  })
}


export const createSpawnAnimation = scene => {
  scene.anims.create({
    key: `spawn`,
    frames: scene.anims.generateFrameNames('mlm_icons', {
      prefix: `spawn_`,
      end: 6,
      zeroPad: 3,
    }),
    frameRate: 12,
    yoyo: true,
    repeat: 0
  });
}


export const createFlagAnimations = scene => {
  Object.values(Teams).forEach(team => {
    scene.anims.create({
      key: `${team}_flag`,
      frames: scene.anims.generateFrameNames('mlm_icons', {
        prefix: `${team}_flag_`,
        end: 3,
        zeroPad: 2,
      }),
      frameRate: 12,
      yoyo: true,
      repeat: -1
    });
  })
}


export const createProjectileAnimations = scene => {
  scene.anims.create({
    key: `rock_projectile`,
    frames: scene.anims.generateFrameNames('mlm_units', {
      prefix: `rock_projectile_`,
      end: 3,
      zeroPad: 3,
    }),
    frameRate: 12,
    yoyo: false,
    repeat: 0
  });
}


export default {
  createUnitAnimations,
  createSpawnAnimation,
  createFlagAnimations,
  createProjectileAnimations,
}