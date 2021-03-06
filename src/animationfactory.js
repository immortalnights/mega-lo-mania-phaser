import { Teams } from './defines.js'
import paletteSwap from './paletteswap.js'

const WALK_ANIMATION_FRAMERATE = 12

const createUnitAnimationSet = (manager, texture, team, unit) => {
  const frames = 2
  const padding = 2

  manager.create({
    key: `${team}_${unit}_walk_down`,
    frames: manager.generateFrameNames(`${texture}-${team}`, {
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
    frames: manager.generateFrameNames(`${texture}-${team}`, {
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
    frames: manager.generateFrameNames(`${texture}-${team}`, {
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
    frames: manager.generateFrameNames(`${texture}-${team}`, {
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
      key: 'mlm_icons',
      dataKey: 'mlm_icons_data'
    }
  })

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
    createUnitAnimationSet(scene.anims, 'mlm_icons', team, 'stone')
  })

  Object.values(Teams).forEach(team => {
    const unitTypes = [ 'rock', 'sling', 'pike', 'longbow', 'catapult', 'cannon' ]
    Object.values(unitTypes).forEach(unit => {
      createUnitAnimationSet(scene.anims, 'mlm_units', team, unit)
    })
  })
}

// export const DefenderUnitTypes = {
//   STICK: 'stick',
//   // SPEAR: 'spear',
//   // BOW: 'bow',
//   // OIL: 'oil',
//   // CROSSBOW: 'crossbow',
//   RIFLE: 'rifle',
//   // MACHINE_GUN: 'machinegun',
//   // ROCKET_LAUNCHER: 'rocketlauncher',
//   // ANTI_NUKE: 'antinuke',
//   // LASER: 'laser',
// }

export const createSpawnAnimation = scene => {
  scene.anims.create({
    key: `spawn`,
    frames: scene.anims.generateFrameNames('mlm_icons', {
      prefix: `spawn_`,
      end: 6,
      zeroPad: 2,
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
    key: `ground_explosion`,
    frames: scene.anims.generateFrameNames('mlm_icons', {
      prefix: `ground_explosion_`,
      end: 4,
      zeroPad: 2,
    }),
    frameRate: 12,
    yoyo: false,
    repeat: 0
  });

  scene.anims.create({
    key: `stone_projectile`,
    frames: scene.anims.generateFrameNames('mlm_units', {
      prefix: `stone_projectile_`,
      end: 3,
      zeroPad: 2,
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