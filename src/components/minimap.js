import Phaser from 'phaser'
import { getKeyForSector } from '../utilities'
import { Teams, BuildingTypes, GameEvents, UserEvents } from '../defines.js'


const offsetValue = 5
const armyIconOffset = {
  [Teams.RED]:    { x: -offsetValue, y: -offsetValue},
  [Teams.GREEN]:  { x:  offsetValue, y: -offsetValue},
  [Teams.BLUE]:   { x:  offsetValue, y:  offsetValue},
  [Teams.YELLOW]: { x: -offsetValue, y:  offsetValue},
}


export default class MiniMap extends Phaser.GameObjects.Container
{
  constructor(scene, x, y, island = undefined)
  {
    super(scene, x, y)

    //! Sector images
    this.sectors = new Phaser.GameObjects.Group(scene)
    for (let index = 0; index < 16; index++)
    {
      const sector = new Phaser.GameObjects.Image(scene, 0, 0, 'mlm_smallmap', ``)

      const position = this.getSectorXY(index)
      sector.setPosition(position.x, position.y)
      sector.setInteractive()
      sector.on('pointerup', pointer => {
        this.scene.events.emit(UserEvents.SECTOR_MAP_SELECT, pointer, index)
      })

      this.sectors.add(sector)
      this.add(sector)
    }

    //! Castle and Army icons on sectors
    this.icons = new Phaser.GameObjects.Group(scene)

    //! Sector marker
    const marker = new Phaser.GameObjects.Image(scene, 0, 0, 'mlm_icons', 'sector_selected_icon')
    marker.setData('sector', undefined)
    marker.setVisible(false)
    this.add(marker)

    // Apply initial map if provided
    if (island)
    {
      this.setIsland(island.style, island.map)
    }

    //! Event sector marker
    // TODO

    scene.events.on(GameEvents.SECTOR_VIEW, index => {
      const sector = this.sectors.getChildren()[index]
      if (sector.visible === true)
      {
        // const position = this.getSectorXY(sector)
        marker.setPosition(sector.x, sector.y - 1)
        marker.setData('sector', sector)
        marker.setVisible(true)
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

    this.setSize(4 * 16, 4 * 16)
  }

  setIsland(style, map)
  {
    console.debug(`Set island ${style}`)
    this.icons.clear(true, true)
    this.sectors.setVisible(false)

    for (let index = 0; index < 16; index++)
    {
      if (map[index])
      {
        const key = getKeyForSector(index, map)
        // console.debug(index, key, index % 4, `r=${index % 4 !== 3}`, `l=${index % 4 !== 0}`)

        const sector = this.sectors.getChildren()[index]
        sector.setFrame(`${style}_${key}`)
        sector.setVisible(true)
        console.debug(`${index} x=${sector.x}, y=${sector.y}`)
      }
    }
  }

  /**
   * Return (local) X Y position of sector at grid location x, y
   * @param {integer} index Sector index
   * @returns {Object}
   */
  getSectorXY(index)
  {
    let x = -32 + ((index % 4) * 16)
    let y = -32 + (Math.floor(index / 4) * 16)

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
    console.debug(`Add building ${building} to ${sector}`)
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
    console.debug(`Remove building ${building} from ${sector}`)
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