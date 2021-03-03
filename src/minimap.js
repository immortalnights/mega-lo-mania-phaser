
import Islands from './assets/islands.json'

export default class MiniMap extends Phaser.GameObjects.Container
{
  constructor(scene, x, y, island)
  {
    super(scene, x, y)

    if (typeof island === 'string')
    {
      island = Islands[island]
    }

    this.sectors = new Phaser.GameObjects.Group(scene)

    this.name = island.name

    const at = id => {
      return island.map[id] || 0
    }

    for (let i = 0; i < 16; i++)
    {
      if (island.map[i])
      {
        const key = '' + at(i - 4) + at(i + 1) + at(i + 4) + at(i - 1)

        const sector = new Phaser.GameObjects.Sprite(scene, 0, 0, 'mlm_smallmap', `${island.style}_${key}`)

        const position = this.sectorXY(i)
        sector.setPosition(position.x, position.y)
        this.sectors.add(sector, true)
        this.add(sector)
      }
    }
  }

  sectorXY(x, y)
  {
    if (y === undefined)
    {
      y = Math.floor(x / 4)
      x = x % 4
    }

    return { x: x * 18, y:  y * 18 }
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