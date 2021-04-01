import Phaser from 'phaser'
import { GameEvents, UserEvents } from './defines'

export default class Task extends Phaser.GameObjects.Container
{
  constructor(scene, x, y, frame, name, onClick = undefined)
  {
    super(scene, x, y)

    this.name = name

    const icon = new Phaser.GameObjects.Sprite(scene, 0, -4, 'mlm_icons', frame)
    this.add(icon)

    this.label = new Phaser.GameObjects.Text(scene, 0, 8, '0', { fontSize: 10 })
    this.label.setOrigin(0.5, 0.5)
    this.add(this.label)

    this.setData('population', null)

    this.on('changedata-population', this.onPopulationChanged, this)

    const onAllocateDeallocate = pointer => {
      if (pointer.buttons === 1)
      {
        this.scene.events.emit(UserEvents.ALLOCATE_POPULATION, name)
      }
      else if (pointer.buttons === 2)
      {
        this.scene.events.emit(UserEvents.DEALLOCATE_POPULATION, name)
      }
    }

    if (onClick)
    {
      icon.setInteractive()
      icon.on('pointerdown', onClick, this)

      this.label.setInteractive()
      this.label.on('pointerdown', onAllocateDeallocate)
    }
    else
    {
      this.setSize(16, 24)
      this.setInteractive()
      this.on('pointerdown', onAllocateDeallocate)
    }
  }

  onAllocate()
  {

  }

  onDeallocate()
  {

  }

  onPopulationChanged(obj, val, prev)
  {
    if (val === undefined)
    {
      this.label.setText('-')
    }
    else if (val === null)
    {
      this.label.setText('')
    }
    else
    {
      this.label.setText(Math.max(val, 0))
    }
  }
}