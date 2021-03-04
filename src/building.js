import Unit from './unit.js'
import { Teams, DefenderUnitTypes, BuildingTypes } from './defines.js'

const SCALE = 2

export default class Building extends Phaser.GameObjects.Container
{
  constructor(scene, x, y, options)
  {
    super(scene, x, y)

    this.buildingType = options.type

    // Tech level can change
    this.setData({
      epoch: options.epoch,
      team: options.team
    })

    this.building = new Phaser.GameObjects.Sprite(scene, 0, 0, 'mlm_buildings', `${this.buildingType}_${options.epoch}`);
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
        flag.setPosition(this.getInnerPositionX(flagPosition.x), this.getInnerPositionY(flagPosition.y))
      }

      this.on('changedata-epoch', repositionFlag)
      repositionFlag()
    }

    this.defenders = new Phaser.GameObjects.Group(scene)
    this.markers = new Phaser.GameObjects.Group(scene)

    for (let i = 0; i < 4; i++)
    {
      const marker = new Phaser.GameObjects.Arc(this.scene, 0, 0, 4, 0, 360, false, 0x0000FF, 1)
      marker.setVisible(false)
      this.markers.add(marker)
      this.add(marker)
    }

    for (let i = 0; i < 4; i++)
    {
      const defender = new Unit(scene, 35, 10, {
        team: this.team,
        type: DefenderUnitTypes.STICK,
        defender: true,
      })

      this.defenders.add(defender, true)
      this.add(defender)
    }

    this.setSize(this.building.displayWidth, this.building.displayHeight)
    this.setInteractive()

    const marker = new Phaser.GameObjects.Arc(scene, 0, 0, 4, 0, 360, false, 0xFFFFFF, 1)
    marker.setVisible(false)
    this.add(marker)

    this.on('pointerdown', (pointer, localX, localY, event) => {
      console.log(localX, localY)
      marker.setPosition(this.getInnerPositionX(localX), this.getInnerPositionY(localY))
      marker.setVisible(true)
    })

    this.updateDefenderMarkers()
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
      marker.setPosition(this.getInnerPositionX(pos.x), this.getInnerPositionY(pos.y))
      marker.setVisible(true)
    })
  }
}