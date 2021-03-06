import Phaser from 'phaser'
import { UserEvents } from '../defines'

/**
 * Display an icon and a value
 * Has events for click (icon), click-hold value, etc
 * 
 * ```javascript
 *   let vv = 0
 *
 *   const vc = new ValueControl(this, 200, 30, 'resource_bone', vv)
 *   this.add.existing(vc)
 *   vc.on(UserEvents.VALUE_CLICKED, dir => {
 *     // console.log("clicked")
 *     vv += dir
 *     vc.setValue(vv)
 *   })
 *   vc.on(UserEvents.VALUE_RELEASED, (inc) => {
 *     console.log("released", inc)
 *   })
 *   vc.on(UserEvents.VALUE_CHANGE, (inc) => {
 *     // console.log("change", inc)
 *     vv += inc
 *     vv = Math.max(vv, 0)
 *     vc.setValue(vv)
 *   })
 *   vc.on(UserEvents.VALUE_LINK_DOWN, () => {
 *     console.log("link down")
 *   })
 *   vc.on(UserEvents.VALUE_LINK_UP, () => {
 *     console.log("link up")
 *   })
 * ```
 */
export default class ValueControl extends Phaser.GameObjects.Container
{
  constructor(scene, x, y, icon, value)
  {
    super(scene, x, y)

    this.setSize(16, 24)
    this.setInteractive()

    // for the click/hold to function, this Object must be added to the update list
    // this.addToUpdateList() // next?
    this.scene.add.existing(this)

    // Can the user change the value
    this.readOnly = false
    // Does clicking the icon have a different effect to clicking the text
    this.isLink = false
    // Don't allow click-hold and just emit one event for mouse down and up
    this.isToggle = false
    // Minimum value before "disabled" style is applied
    this.minimumValue = undefined

    this.icon = new Phaser.GameObjects.Image(this.scene, 1, -3, 'mlm_icons', icon)
    this.add(this.icon)

    this.value = new Phaser.GameObjects.Text(this.scene, 0, 8, '?', { fontSize: 10 })
    this.value.setOrigin(0.5, 0.5)
    this.add(this.value)

    this.once('setdata', (obj, key, val) => {
      if (key === 'value')
      {
        this.onValueChanged(obj, val, undefined)
      }
    })
    this.on('changedata-value', this.onValueChanged, this)
    this.setData('value', value)

    // Having the icon and value interactive, block pointer events on the container; so attach
    // all the event handlers to the container and determine which item has been clicked based
    // on the localY position.
    this.reset()

    // Handle clicking on the icon
    this.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, this.onPointerDown, this)
    this.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, this.onPointerUp, this)

    this.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, (pointer, localX, localY, event) => {
      // console.log("ValueControl container over")
      // this.icon.setTint(0xFF0000)
    })
    this.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, (pointer, localX, localY, event) => {
      // console.log("ValueControl container out")
      // this.icon.setTint(0xFFFFFF)
      this.reset()
    })
    this.on(Phaser.Input.Events.GAMEOBJECT_POINTER_WHEEL, (pointer, deltaX, deltaY, deltaZ, event) => {
      // console.log("ValueControl click wheel container", deltaX, deltaY, deltaZ)
      this.emit(UserEvents.VALUE_CHANGE, -Math.floor(deltaY / 100))
    })
  }

  onValueChanged(obj, val, prev)
  {
    if (val === undefined)
    {
      this.value.setText('-')
    }
    else if (val === null)
    {
      this.value.setText('')
    }
    else if (Number.isFinite(val) === true)
    {
      // Prevent negative numbers
      // this.value.setText(Math.max(Math.floor(val), 0))
      this.value.setText(Math.max(val, 0))
    }
    else
    {
      this.value.setText(val)
    }
  }

  onPointerDown(pointer, localX, localY, event)
  {
    console.log("ValueControl click down cont", pointer.button)

    if (this.isLink && localY < 16)
    {
      this.emit(UserEvents.VALUE_LINK_DOWN)
    }
    else if (pointer.button === 1)
    {
      this.emit(UserEvents.VALUE_RESET)
    }
    else if (pointer.button === 4)
    {
      this.emit(UserEvents.VALUE_MAX)
    }
    else if (pointer.button === 3)
    {
      this.emit(UserEvents.VALUE_MIN)
    }
    else
    {
      this.isPointerDown = true
      this.pointerButton = pointer.buttons
      this.pointerDownTime = this.scene.game.getTime()
    }
  }

  onPointerUp(pointer, localX, localY, event)
  {
    // console.log("ValueControl click up cont")

    if (this.isLink && localY < 16)
    {
      this.emit(UserEvents.VALUE_LINK_UP)
    }
    else
    {
      this.isPointerDown = false
      this.pointerUpTime = this.scene.game.getTime()
    }
  }

  reset()
  {
    this.isPointerDown = false
    this.pointerButton = undefined
    this.pointerDownTime = undefined
    this.pointerUpTime = undefined
    this.lastChangeEvent = 0
  }

  setReadOnly(b)
  {
    this.readOnly = b
    this.value.setColor('#AAA')
    return this
  }

  setMinimum(val)
  {
    this.minimumValue = val
    return this
  }

  /**
   * If the control is a link, clicking the icon will emit a different event
   */
  setLink(b)
  {
    this.isLink = b === undefined || b
    return this
  }

  setIcon(icon)
  {
    this.icon.setFrame(icon)
    return this
  }

  setValue(val)
  {
    this.setData('value', val)

    if (this.readOnly === true || (this.minimumValue != null && val <= this.minimumValue))
    {
      this.value.setColor('#AAA')
    }
    else
    {
      this.value.setColor('#FFF')
    }

    return this
  }

  preUpdate(time, delta)
  {
    if (this.isPointerDown)
    {
      const duration = time - this.pointerDownTime
      if (duration > 125)
      {
        let inc = duration > 5000 ? 10 : 1
        if (this.pointerButton === 2)
        {
          inc = -inc
        }

        const wait = Math.min(800 - (1.50 * (duration / 10)), 100)
        if ((time - this.lastChangeEvent) > wait)
        {
          this.emit(UserEvents.VALUE_CHANGE, inc)
          this.lastChangeEvent = time
        }
      }
    }
    else if (this.pointerDownTime !== undefined)
    {
      // Stopped holding
      const duration = this.pointerUpTime - this.pointerDownTime
      // console.log("stopped holding", duration)

      if (duration < 125)
      {
        const dir = this.pointerButton === 2 ? -1 : 1
        this.emit(UserEvents.VALUE_CHANGE, dir)
      }
      else
      {
        this.emit(UserEvents.VALUE_RELEASED, duration)
      }

      this.pointerDownTime = undefined
      this.pointerUpTime = undefined
      this.pointerButton = undefined
    }
  }
}