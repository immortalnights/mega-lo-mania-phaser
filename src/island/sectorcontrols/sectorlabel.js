import Phaser from 'phaser'
import BlockText from '../../components/blocktext'
import { yearFromEpoch } from '../../utilities'


/**
 * ```JavaScript
 *     const islands = [
 *     { name: "Aloha", epoch: 1 },
 *     { name: "Bazooka", epoch: 1 },
 *     { name: "Cilla", epoch: 1 },
 *     { name: "Dracula", epoch: 2 },
 *     { name: "Etcetra", epoch: 2 },
 *     { name: "Formica", epoch: 2 },
 *     { name: "Gazza", epoch: 3 },
 *     { name: "Hernia", epoch: 3 },
 *     { name: "Ibiza", epoch: 3 },
 *     { name: "Junta", epoch: 4 },
 *     { name: "Karma", epoch: 4 },
 *     { name: "Lada", epoch: 4 },
 *     { name: "Mascara", epoch: 5 },
 *     { name: "Nausea", epoch: 5 },
 *     { name: "Ocarina", epoch: 5 },
 *     { name: "Pyjama", epoch: 6 },
 *     { name: "Quota", epoch: 6 },
 *     { name: "Rumbaba", epoch: 6 },
 *     { name: "Sinatra", epoch: 7 },
 *     { name: "Tapioca", epoch: 7 },
 *     { name: "Utopia", epoch: 7 },
 *     { name: "Vespa", epoch: 8 },
 *     { name: "Wonca", epoch: 8 },
 *     { name: "Xtra", epoch: 8 },
 *     { name: "Yoga", epoch: 9 },
 *     { name: "Zappa", epoch: 9 },
 *     { name: "Ohm", epoch: 9 },
 *     { name: "Megalomania", epoch: 10 },
 *   ]
 *
 *
 *   let index = 0
 *   setInterval(() => {
 *     this.sectorLabel.display(islands[index])
 *     index++
 *
 *     index = Phaser.Math.Wrap(index, 0, 28)
 *   }, 500)
 * ```
 */

export default class SectorLabel extends Phaser.GameObjects.Container
{
  constructor(scene, x, y)
  {
    super(scene, x, y)

    this.name = new BlockText(scene, -20, 0, 'A')
    this.date = new BlockText(scene, 20, 0, 'A')
    this.notation = new BlockText(scene, 40, 0, 'A')

    this.add([ this.name, this.date, this.notation ])
  }

  display(sector)
  {
    const [ year, notation ] = yearFromEpoch(sector.epoch)

    this.name.setText(sector.name) // FIXME use islandName?

    if (sector.name === 'megalomania')
    {
      this.date.setText('')
      this.notation.setText('')
    }
    else
    {
      this.date.setText(String(year).padStart(4, ' '))
      this.notation.setText(notation)
    }
  }
}
