import Unit from './unit.js'
import { Teams, DefenderUnitTypes, BuildingTypes, GameEvents, UserEvents } from '../defines.js'

const SCALE = 2

export default class Building extends Phaser.GameObjects.Container
{
  constructor(scene, x, y, options)
  {
    super(scene, x, y)

    Object.defineProperties(this, {
      buildingType: {
        get()
        {
          return this.getData('type')
        }
      },
    })

    // Tech level can change
    this.setData({
      type: options.type,
      epoch: options.epoch,
      team: options.team
    })

    this.building = new Phaser.GameObjects.Image(scene, 0, 0, 'mlm_buildings', `${this.buildingType}_${options.epoch}`);
    this.building.setInteractive()
    this.building.on('pointerdown', () => {
      this.scene.events.emit(UserEvents.BUILDING_SELECT, this.buildingType)
    })
    this.add(this.building)

    this.on('changedata-epoch', (obj, current, previous) => {
      this.building.setFrame(`${this.buildingType}_${current}`)
      this.updateDefenderMarkers()
    })

    if (this.buildingType === BuildingTypes.CASTLE)
    {
      const flag = new Phaser.GameObjects.Sprite(scene, 0, 0, 'mlm_icons', `${options.team}_flag_00`);
      flag.play(`${options.team}_flag`)
      this.add(flag)

      const repositionFlag = () => {
        const flagPosition = this.building.frame.customData.flag
        flag.setPosition(flagPosition.x, flagPosition.y)
      }

      this.on('changedata-epoch', repositionFlag)
      repositionFlag()
    }

    this.defenders = new Phaser.GameObjects.Group(scene)
    this.markers = new Phaser.GameObjects.Group(scene)

    for (let i = 0; i < 4; i++)
    {
      const marker = new Phaser.GameObjects.Arc(this.scene, 0, 0, 2, 0, 360, false, 0x0000FF, 1)
      marker.setData('index', i)
      marker.setVisible(false)
      marker.setAlpha(0.5)
      this.markers.add(marker)
      this.add(marker)
      marker.setInteractive()
      marker.on('pointerdown', () => {
        this.scene.events.emit(UserEvents.BUILDING_SELECT_DEFENDER_POSITION, this.buildingType, i)
      })
    }

    //BUILDING_REMOVE_DEFENDER

    this.setSize(this.building.displayWidth, this.building.displayHeight)
    this.setInteractive()

    const marker = new Phaser.GameObjects.Arc(scene, 0, 0, 2, 0, 360, false, 0xFFFFFF, 1)
    marker.setVisible(false)
    this.add(marker)

    this.on('pointerdown', (pointer, localX, localY, event) => {
      const relative = { x: localX - this.width / 2, y: localY - this.height / 2 }
      console.log(relative.x, relative.y)
      marker.setPosition(relative.x, relative.y)
      marker.setVisible(true)

      this.scene.events.emit(UserEvents.BUILDING_SELECT, this.buildingType)
    })

    this.updateDefenderMarkers()
  }

  addDefender(position, type, spawn = true)
  {
    const defenderPositions = this.building.frame.customData.defenders || []

    const p = defenderPositions[position]
    const defender = new Unit(this.scene, p.x, p.y, {
      type,
      team: this.getData('team'),
      defender: true,
      position: position,
      spawn,
    })
    this.add(defender)
    this.defenders.add(defender)
  }

  removeDefender(position)
  {
    const defender = this.defenders.getChildren().find(d => d.getData('position') === position)
    if (defender)
    {
      defender.destroy()
    }
    else
    {
      console.warn(`No defender at position ${position}`)
    }
  }

  getInnerPositionX(localX)
  {
    return localX - (this.building.displayWidth / 2)
  }

  getInnerPositionY(localY)
  {
    return localY - (this.building.displayHeight / 2)
  }

  advance(epoch)
  {
    this.setData('epoch', epoch)
  }

  updateDefenderMarkers()
  {
    this.markers.getChildren().forEach(m => m.setVisible(false))

    const defenderPositions = this.building.frame.customData.defenders || []
    defenderPositions.forEach((pos, index) => {
      const marker = this.markers.getChildren()[index]
      marker.setPosition(pos.x, pos.y)
      marker.setVisible(true)
    })
  }
}