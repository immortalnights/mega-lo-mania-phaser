import { Game } from 'phaser'
import { Teams, GameEvents } from './defines.js'

const offsetValue = 5
const armyIconOffset = {
  [Teams.RED]:    { x: -offsetValue, y: -offsetValue},
  [Teams.GREEN]:  { x:  offsetValue, y: -offsetValue},
  [Teams.BLUE]:   { x:  offsetValue, y:  offsetValue},
  [Teams.YELLOW]: { x: -offsetValue, y:  offsetValue},
}

const getKeyForSector = (index, data) => {
  const at = id => data[id] || 0
  return '' + at(index - 4) + at(index + 1) + at(index + 4) + at(index - 1)
}

export default class MiniMap extends Phaser.GameObjects.Container
{
  constructor(scene, x, y, island)
  {
    super(scene, x, y)

    this.sectors = new Phaser.GameObjects.Group(scene)
    this.name = island.name

    // Sector data provides a cache for the current state
    const sectorData = {}

    // Build the map
    for (let i = 0; i < 16; i++)
    {
      if (island.map[i])
      {
        sectorData[i] = {
          castle: null,
          armies: [],
          nuked: false
        }

        const key = getKeyForSector(i, island.map)

        const sector = new Phaser.GameObjects.Sprite(scene, 0, 0, 'mlm_smallmap', `${island.style}_${key}`)

        const position = this.sectorXY(i)
        sector.setPosition(position.x, position.y)
        sector.setInteractive()
        sector.on('pointerup', () => {
          this.scene.events.emit(GameEvents.SECTOR_SELECT, i, key)
        })
        this.sectors.add(sector, true)
        this.add(sector)
      }
    }

    const marker = new Phaser.GameObjects.Sprite(scene, 0, 0, 'mlm_icons', 'sector_selected_icon')
    marker.setData('sector', undefined)
    this.add(marker)

    const markSector = sector => {
      if (island.map[sector])
      {
        const position = this.sectorXYCenter(sector)
        marker.setPosition(position.x, position.y - 1)
        marker.setData('sector', sector)
      }
    }

    this.scene.events.on(GameEvents.SECTOR_VIEW, markSector)

    this.scene.events.on(GameEvents.SECTOR_ALERT, sector => {
      // Do not alert the sector, if the sector is being viewed
      if (marker.getData('sector') !== sector)
      {
        // TODO
      }
    })

    this.scene.events.on(GameEvents.SECTOR_ADD_CASTLE, (sector, team) => {
      if (sectorData[sector].castle != null)
      {
        console.warn(`Attempted to add castle for ${team} on sector ${sector} where a castle already exists`)
      }
      else
      {
        const position = this.sectorXYCenter(sector)
        const icon = new Phaser.GameObjects.Sprite(this.scene, position.x, position.y, 'mlm_icons', `${team}_castle_icon`)
        icon.setData('team', team)
        sectorData[sector].castle = icon
        this.add(icon)
      }
    })

    this.scene.events.on(GameEvents.SECTOR_REMOVE_CASTLE, (sector, team) => {
      if (sectorData[sector].castle == null)
      {
        console.warn(`Attempted to remove ${team} castle from sector ${sector} where it does not exist`)
      }
      else
      {
        sectorData[sector].castle.destroy()
        sectorData[sector].castle = null
      }
    })

    this.scene.events.on(GameEvents.SECTOR_ADD_ARMY, (sector, team) => {
      const index = sectorData[sector].armies.findIndex(a => a.getData('team') === team)
      if (index !== -1)
      {
        console.warn(`Attempted to add duplicate army for ${team} team to sector ${sector}`)
      }
      else
      {
        const position = this.sectorXYCenter(sector)

        position.x += armyIconOffset[team].x
        position.y += armyIconOffset[team].y

        const icon = new Phaser.GameObjects.Sprite(this.scene, position.x, position.y, 'mlm_icons', `${team}_army_icon`)
        icon.setData('team', team)
        sectorData[sector].armies.push(icon)
        this.add(icon)
      }
    })

    this.scene.events.on(GameEvents.SECTOR_REMOVE_ARMY, (sector, team) => {
      const index = sectorData[sector].armies.findIndex(a => a.getData('team') === team)
      if (index === -1)
      {
        console.warn(`Attempted to remove army for ${team} team from sector ${sector} that does not exist`)
      }
      else
      {
        const icon = sectorData[sector].armies[index]
        icon.destroy()
        sectorData[sector].armies.splice(index, 1)
      }
    })

    this.scene.events.on(GameEvents.SECTOR_START_CLAIM, (sector, team) => {
      const index = sectorData[sector].armies.findIndex(a => a.getData('team') === team)

      if (index === -1)
      {
        console.warn(`Attempted to start claiming sector ${sector} with ${team} army not present`)
      }
      else
      {
        const icon = sectorData[sector].armies[index]
        const position = this.sectorXYCenter(sector)
        icon.setPosition(position.x, position.y)
      }
    })

    // Can emit claim immediately with no visual "movement" of the icon
    this.scene.events.on(GameEvents.SECTOR_STOP_CLAIM, (sector, team) => {
      const index = sectorData[sector].armies.findIndex(a => a.getData('team') === team)

      if (index === -1)
      {
        console.warn(`Attempted to stop claiming sector ${sector} with ${team} army not present`)
      }
      else
      {
        const icon = sectorData[sector].armies[index]
        const iconTeam = icon.getData('team')
        const position = this.sectorXYCenter(sector)
        position.x += armyIconOffset[iconTeam].x
        position.y += armyIconOffset[iconTeam].y
        icon.setPosition(position.x, position.y)
      }
    })

    this.scene.events.on(GameEvents.SECTOR_NUKE, (sector, team) => {
      
    })
  }

  sectorXY(x, y)
  {
    if (y === undefined)
    {
      y = Math.floor(x / 4)
      x = x % 4
    }

    return { x: x * 16, y:  y * 16 }
  }

  sectorXYCenter(x, y)
  {
    const sectorXY = this.sectorXY(x, y)
    sectorXY.x + 9
    sectorXY.y + 9
    return sectorXY
  }

  sector(x, y)
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
}