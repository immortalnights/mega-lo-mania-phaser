import Phaser from 'phaser'
import { getKeyForSector } from './utilities'
import { Teams, BuildingTypes, GameEvents, UserEvents } from './defines.js'


const offsetValue = 5
const armyIconOffset = {
  [Teams.RED]:    { x: -offsetValue, y: -offsetValue},
  [Teams.GREEN]:  { x:  offsetValue, y: -offsetValue},
  [Teams.BLUE]:   { x:  offsetValue, y:  offsetValue},
  [Teams.YELLOW]: { x: -offsetValue, y:  offsetValue},
}


export default class MiniMap extends Phaser.GameObjects.Container
{
  constructor(scene, x, y, island)
  {
    super(scene, x, y)

    // this.sectors = new Phaser.GameObjects.Group(scene)
    this.name = island.name

    this.icons = new Phaser.GameObjects.Group(scene)

    // Build the map
    for (let index = 0; index < 16; index++)
    {
      if (island.map[index])
      {
        const key = getKeyForSector(index, island.map)

        const sector = new Phaser.GameObjects.Image(scene, 0, 0, 'mlm_smallmap', `${island.style}_${key}`)

        const position = this.getSectorXY(index)
        sector.setPosition(position.x, position.y)
        sector.setInteractive()
        sector.on('pointerup', pointer => {
          this.scene.events.emit(UserEvents.SECTOR_MAP_SELECT, pointer, index)
        })
        // this.sectors.add(sector, true)
        this.add(sector)
      }
    }

    const marker = new Phaser.GameObjects.Image(scene, 0, 0, 'mlm_icons', 'sector_selected_icon')
    marker.setData('sector', undefined)
    this.add(marker)

    scene.events.on(GameEvents.SECTOR_VIEW, sector => {
      if (island.map[sector])
      {
        const position = this.getSectorXY(sector)
        marker.setPosition(position.x, position.y - 1)
        marker.setData('sector', sector)
      }
    })

    scene.events.on(GameEvents.SECTOR_ADD_BUILDING, this.onAddBuilding, this)
    scene.events.on(GameEvents.SECTOR_REMOVE_BUILDING, this.onRemoveBuilding, this)
    scene.events.on(GameEvents.SECTOR_ADD_ARMY, this.onAddArmy, this)
    scene.events.on(GameEvents.SECTOR_REMOVE_ARMY, this.onRemoveArmy, this)
    scene.events.on(GameEvents.SECTOR_START_CLAIM, this.onStartClaim, this)
    scene.events.on(GameEvents.SECTOR_STOP_CLAIM, this.onStopClaim, this)
    scene.events.on(GameEvents.SECTOR_NUKED, this.onNuked, this)

    scene.events.on(GameEvents.SECTOR_ALERT, sector => {
      // Do not alert the sector, if the sector is being viewed
      if (marker.getData('sector') !== sector)
      {
        // TODO
      }
    })
  }

  /**
   * Return (local) X Y position of sector at grid location x, y
   * @param {integer} index Sector index
   * @returns {Object}
   */
  getSectorXY(index)
  {
    let x = (index % 4) * 16
    let y = Math.floor(index / 4) * 16

    return { x, y }
  }

  /**
   * 
   * @param {integer} index Sector index
   * @returns {Object}
   */
  getSectorCenterXY(index)
  {
    const position = this.getSectorXY(index)
    position.x += 9
    position.y += 9
    return position
  }

  /**
   * 
   * @param {integer} index Sector index
   * @returns {Phaser.GameObjects.Image}
   */
  getSectorImage(x, y)
  {
    if (y === undefined)
    {
      sectorIndex = x
    }
    else
    {
      sectorIndex = (y * 4 + x)
    }

    const sector = this.sectors.getChildren().find(child => child.id === sectorIndex)

    console.log(x, y, sectorIndex, sector)
    return sector
  }

  hasCastle(sector, team)
  {
    return !!this.icons.getChildren().find(child => {
      return child.name === BuildingTypes.CASTLE && child.getData('sector') === sector && child.getData('team') === team
    })
  }

  hasArmy(sector, team)
  {
    return !!this.icons.getChildren().find(child => {
      return child.name === 'army' && child.getData('sector') === sector && child.getData('team') === team
    })
  }

  onAddBuilding(sector, building, team)
  {
    if (building === BuildingTypes.CASTLE)
    {
      const position = this.getSectorXY(sector)

      const icon = new Phaser.GameObjects.Image(this.scene, position.x, position.y, 'mlm_icons', `${team}_castle_icon`)
      icon.name = BuildingTypes.CASTLE
      icon.setData({
        sector,
        team,
      })

      this.icons.add(icon)
      this.add(icon)
    }
  }

  onRemoveBuilding(sector, building, team)
  {
    if (building === BuildingTypes.CASTLE)
    {
      const icon = this.icons.getChildren().find(child => {
        return child.name === BuildingTypes.CASTLE && child.getData('sector') === sector
      })

      if (icon)
      {
        icon.destroy()
      }
    }
  }

  onAddArmy(sector, team, units)
  {
    // Ignore the event if an army icon for the specific team already exists
    if (this.hasArmy(sector, team) === false)
    {
      const position = this.getSectorXY(sector)

      position.x += armyIconOffset[team].x
      position.y += armyIconOffset[team].y

      const icon = new Phaser.GameObjects.Image(this.scene, position.x, position.y, 'mlm_icons', `${team}_army_icon`)
      icon.name = 'army'
      icon.setData({
        sector,
        team,
      })

      this.icons.add(icon)
      this.add(icon)
    }
  }

  onRemoveArmy(sector, team)
  {
    const icon = this.icons.getChildren().find(child => {
      return child.name === 'army' && child.getData('sector') === sector && child.getData('team') === team
    })

    if (icon)
    {
      icon.destroy()
    }
  }

  onStartClaim(sector, team)
  {
    const icon = this.icons.getChildren().find(child => {
      return child.name === 'army' && child.getData('sector') === sector && child.getData('team') === team
    })

    const position = this.getSectorCenterXT(sector)
    icon.setPosition(position.x, position.y)
  }

  onStopClaim(sector, team)
  {
    const icon = this.icons.getChildren().find(child => {
      return child.name === 'army' && child.getData('sector') === sector && child.getData('team') === team
    })

    const iconTeam = icon.getData('team')
    const position = this.getSectorCenterXY(sector)
    position.x += armyIconOffset[iconTeam].x
    position.y += armyIconOffset[iconTeam].y
    icon.setPosition(position.x, position.y)
  }

  onNuked(sector)
  {
    console.warn("Nuke unimplemented")
  }
}