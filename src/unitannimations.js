const WALK_ANIMATION_FRAMERATE = 12

const createAnnimations = (manager, prefix) => {
  const frames = 2
  const padding = 3

  manager.create({
    key: `${prefix}_walk_down`,
    frames: manager.generateFrameNames('mlm_units', {
      prefix: `${prefix}_down_`,
      end: frames,
      zeroPad: padding,
    }),
    frameRate: WALK_ANIMATION_FRAMERATE,
    yoyo: true,
    repeat: -1,
  });
  manager.create({
    key: `${prefix}_walk_up`,
    frames: manager.generateFrameNames('mlm_units', {
      prefix: `${prefix}_up_`,
      end: frames,
      zeroPad: padding,
    }),
    frameRate: WALK_ANIMATION_FRAMERATE,
    yoyo: true,
    repeat: -1,
  });
  manager.create({
    key: `${prefix}_walk_right`,
    frames: manager.generateFrameNames('mlm_units', {
      prefix: `${prefix}_right_`,
      end: frames,
      zeroPad: padding,
    }),
    frameRate: WALK_ANIMATION_FRAMERATE,
    yoyo: true,
    repeat: -1,
  });
  manager.create({
    key: `${prefix}_walk_left`,
    frames: manager.generateFrameNames('mlm_units', {
      prefix: `${prefix}_left_`,
      end: frames,
      zeroPad: padding,
    }),
    frameRate: WALK_ANIMATION_FRAMERATE,
    yoyo: true,
    repeat: -1,
  });
}


export default function(names) {
  names.forEach(name => {
    createAnnimations(this.anims, name)
  })
}