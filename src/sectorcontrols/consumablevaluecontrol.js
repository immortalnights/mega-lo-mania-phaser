import Phaser from 'phaser'
import { UserEvents } from '../defines'
import ValueControl from './valuecontrol'


export default class ConsumableValueControl extends ValueControl
{
  constructor(scene, x, y, icon, value)
  {
    super(scene, x, y, icon, value)

    this.isToggle = false
  }

  setToggle(b)
  {
    // remove from update list if toggle?
    this.isToggle = b
  }

  setValue(value, available)
  {
    super.setValue(value)
    this.value.setColor(available ? '#ffff00' : '#444444')
  }

  setValueFromTechnology(sector, technology)
  {
    // Available if there is enough people, cannot use the last person
    const available = (sector.availablePopulation - 1) >= technology.requiredPopulation

    // If items exist; display a number, available if there is enough population
    if (technology.produced > 0)
    {
      this.setValue(technology.produced, available)
    }
    else if (sector.hasResourcesFor(technology))
    {
      this.setValue('OK', available)
    }
    else
    {
      this.setValue(undefined, false)
    }
  }

  onPointerDown(pointer, localX, localY, event)
  {
    if (this.isToggle)
    {
      this.emit(UserEvents.VALUE_TOGGLE_DOWN)
    }
    else
    {
      super.onPointerDown(pointer, localX, localY, event)
    }
  }

  onPointerUp(pointer, localX, localY, event)
  {
    if (this.isToggle)
    {
      this.emit(UserEvents.VALUE_TOGGLE_UP)
    }
    else
    {
      super.onPointerDown(pointer, localX, localY, event)
    }
  }
}