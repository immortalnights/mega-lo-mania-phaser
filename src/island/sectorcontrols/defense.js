import Phaser from 'phaser'
import { UserEvents } from '../../defines'
import Header from './header'
import ValueControl from '../../components/valuecontrol'
import ConsumableValueControl from '../../components/consumablevaluecontrol'


export default class Defense extends Phaser.GameObjects.Container
{
  constructor(scene, x, y)
  {
    super(scene, x, y)

    this.name = 'defense'

    this.add(new Header(this.scene, 0, 0, 'defense_header', () => {
      this.scene.events.emit(UserEvents.SECTOR_CONTROLS_VIEW_CHANGE, 'root')
    }))

    this.population = new ValueControl(this.scene, -25, 20, 'unarmed_population_icon', 0)
    this.population.on(UserEvents.VALUE_CHANGE, amount => {
      this.scene.events.emit(UserEvents.ADD_TO_ARMY, amount, 'unarmed')
    })
    this.add(this.population)

    this.weapons = []

    let weapon = new ConsumableValueControl(this.scene, 0, 20, 'rock', undefined)
    this.weapons.push(weapon)

    weapon = new ConsumableValueControl(this.scene, 25, 20, 'rock', undefined)
    this.weapons.push(weapon)

    weapon = new ConsumableValueControl(this.scene, -25, 50, 'rock', undefined)
    this.weapons.push(weapon)

    weapon = new ConsumableValueControl(this.scene, 0, 50, 'rock', undefined)
    this.weapons.push(weapon)

    this.weapons.forEach(item => {
      this.add(item)
      item.setVisible(false)

      item.on(UserEvents.VALUE_CHANGE, amount => {
        this.scene.events.emit(UserEvents.ADD_TO_ARMY, amount, item.getData('technology'))
      })
    })
  }

  refresh(sector)
  {
    this.display(sector)
  }

  display(sector)
  {
    this.setVisible(true)

    this.population.setValue(sector.availablePopulation)

    let defensiveIndex = 0
    for (const [ key, technology ] of Object.entries(sector.technologies))
    {
      if (technology.category === 'defense' && technology.researched === true)
      {
        const icon = this.weapons[defensiveIndex]

        icon.setData('technology', technology.id)

        icon.setIcon(`defense_${technology.id}`)
        icon.setValueFromTechnology(sector, technology)
        icon.setVisible(true)

        defensiveIndex++
      }
    }

    for (let index = defensiveIndex; index < 4; index++)
    {
      this.weapons[index].setVisible(false)
    }
  }
}
