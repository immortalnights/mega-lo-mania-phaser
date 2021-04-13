import Phaser from 'phaser'
import { UserEvents } from '../defines'
import Header from './header'
import ValueControl from './valuecontrol'


class ConsumableValueControl extends ValueControl
{
  constructor(scene, x, y, icon, value)
  {
    super(scene, x, y, icon, value)
  }

  setValue(value, available)
  {
    super.setValue(value)
    this.value.setColor(available ? '#ffff00' : '#444444')
  }

  setAvailable(available)
  {
    this.setValue('OK', available)
  }
}

export default class Offense extends Phaser.GameObjects.Container
{
  constructor(scene, x, y)
  {
    super(scene, x, y)

    this.name = 'offense'

    this.add(new Header(this.scene, 0, 0, 'offense_header', () => {
      this.parentContainer.emit('sectorcontrol:change_view', 'root')
    }))

    this.population = new ValueControl(this.scene, -25, 20, 'unarmed_population_icon', 0)
    this.population.on(UserEvents.VALUE_CHANGE, amount => {
      this.scene.events.emit(UserEvents.ADD_TO_ARMY, amount, 'unarmed')
    })
    this.scene.add.existing(this.population)
    this.add(this.population)

    this.weapons = []

    let weapon = new ConsumableValueControl(this.scene, 0, 20, 'rock', undefined)
    this.weapons.push(weapon)

    weapon = new ValueControl(this.scene, 25, 20, 'rock', undefined)
    this.weapons.push(weapon)

    weapon = new ValueControl(this.scene, -25, 50, 'rock', undefined)
    this.weapons.push(weapon)

    weapon = new ValueControl(this.scene, 0, 50, 'rock', undefined)
    this.weapons.push(weapon)

    this.weapons.forEach(item => {
      this.add(item)
      item.setVisible(false)

      item.on(UserEvents.VALUE_CHANGE, amount => {
        this.scene.events.emit(UserEvents.ADD_TO_ARMY, amount, item.getData('technology'))
      })
    })

    this.armyInHand = new ValueControl(this.scene, 25, 50, 'cross_swords_icon', undefined)
    // this.armyInHand.setLink(true)
    this.armyInHand.on(UserEvents.VALUE_CHANGE, () => {
      this.scene.events.emit(UserEvents.DISCARD_ARMY_IN_HAND)
    })
    this.add(this.armyInHand)
  }

  display(sector)
  {
    this.setVisible(true)

    this.population.setValue(sector.availablePopulation)

    let offensiveIndex = 0
    for (const [ key, technology ] of Object.entries(sector.technologies))
    {
      if (technology.category === 'offense' && technology.researched === true)
      {
        const icon = this.weapons[offensiveIndex]

        icon.setData('technology', technology.id)

        if (technology.produced > 0)
        {
          icon.setValue(technology.produced, technology.available)
        }
        else
        {
          icon.setAvailable(technology.available)
        }

        icon.setIcon(technology.id)
        icon.setVisible(true)

        offensiveIndex++
      }
    }

    for (let index = offensiveIndex; index < 4; index++)
    {
      this.weapons[index].setVisible(false)
    }

    const armySize = sector.getPendingArmySize()
    this.armyInHand.setValue(armySize > 0 ? armySize : undefined)
  }
}