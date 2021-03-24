import Phaser from 'phaser'
import { GameEvents, UserEvents } from './defines'

export default class Task extends Phaser.GameObjects.Container
{
  constructor(scene, x, y, frame, name)
  {
    super(scene, x, y)

    this.name = name

    const icon = new Phaser.GameObjects.Sprite(scene, 0, -4, 'mlm_icons', frame)
    this.add(icon)

    this.label = new Phaser.GameObjects.Text(scene, -1, 8, '0', { fontSize: 10 })
    this.label.setOrigin(0.5, 0.5)
    this.add(this.label)

    this.setData('allocated', 0)

    this.on('changedata-allocated', this.onAllocationChanged, this)

    this.setSize(16, 24)
    this.setInteractive()
    this.on('pointerdown', pointer => {
      console.log("OK")
      if (pointer.buttons === 1)
      {
        this.scene.events.emit(UserEvents.ALLOCATE_POPULATION, name)
      }
      else if (pointer.buttons === 2)
      {
        this.scene.events.emit(UserEvents.DEALLOCATE_POPULATION, name)
      }
    })

    this.scene.events.on(GameEvents.POPULATION_ALLOCATION_CHANGED, (task, population) => {
      if (this.name === task)
      {
        this.setData('allocated', population)
      }
    })
  }

  onAllocationChanged(obj, val, prev)
  {
    this.label.setText(Math.max(val, 0))
  }
}