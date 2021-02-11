const WALK_ANIMATION_FRAMERATE = 12

const createAnnimations = (manager, prefix) => {
  manager.create({
    key: `${prefix}_walk_down`,
    frames: manager.generateFrameNames('mlm_armies', {
      prefix: `${prefix}_down_`,
      end: 3,
      zeroPad: 3,
    }),
    frameRate: WALK_ANIMATION_FRAMERATE,
    yoyo: true,
    repeat: -1,
  });
  manager.create({
    key: `${prefix}_walk_up`,
    frames: manager.generateFrameNames('mlm_armies', {
      prefix: `${prefix}_up_`,
      end: 3,
      zeroPad: 3,
    }),
    frameRate: WALK_ANIMATION_FRAMERATE,
    yoyo: true,
    repeat: -1,
  });
  manager.create({
    key: `${prefix}_walk_right`,
    frames: manager.generateFrameNames('mlm_armies', {
      prefix: `${prefix}_right_`,
      end: 3,
      zeroPad: 3,
    }),
    frameRate: WALK_ANIMATION_FRAMERATE,
    yoyo: true,
    repeat: -1,
  });
  manager.create({
    key: `${prefix}_walk_left`,
    frames: manager.generateFrameNames('mlm_armies', {
      prefix: `${prefix}_left_`,
      end: 3,
      zeroPad: 3,
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