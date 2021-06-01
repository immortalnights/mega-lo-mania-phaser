import Phaser from 'phaser'
import { BuildingTypes, UserEvents } from '../../defines'
import SectorLabel from './sectorlabel'
import Blueprints from './blueprints'
import Defense from './defense'
import Mining from './mining'
import Offense from './offense'
import Production from './production'
import Repair from './repair'
import Research from './research'
import Root from './root'


export default class SectorControls extends Phaser.GameObjects.Container
{
  constructor(scene, x, y)
  {
    super(scene, x, y)

    this.activeView = undefined

    const root = new Root(this.scene, 0, 0)
    this.add(root)

    const blueprints = new Blueprints(this.scene, 0, -40)
    this.add(blueprints)

    const repair = new Repair(this.scene, 0, -40)
    this.add(repair)

    const defense = new Defense(this.scene, 0, -40)
    this.add(defense)

    const offense = new Offense(this.scene, 0, -40)
    this.add(offense)

    const research = new Research(this.scene, 0, -40)
    research.on('technology:selected', technology => {
      this.scene.events.emit(UserEvents.SELECT_RESEARCH, technology)
    })
    this.add(research)

    const production = new Production(this.scene, 0, -40)
    this.add(production)

    const mining = new Mining(this.scene, 0, -40)
    this.add(mining)

    this.views = new Phaser.GameObjects.Group(this.scene, [
      root,
      blueprints,
      repair,
      defense,
      offense,
      research,
      production,
      mining,
    ])

    this.views.setVisible(false)

    // 
    this.sectorLabel = new SectorLabel(this.scene, 0, -40)
    this.add(this.sectorLabel)
  }

  refresh(sector)
  {
    this.activeView?.refresh(sector)
  }

  /**
   * Displays the appropriate Sector Controls for the provided sector
   * @param {*} sector 
   */
  display(sector)
  {
    const localPlayer = {
      team: this.scene.data.get('team'),
      inAlliance: false
    }

    const hasOwnArmy = armies => {
      return -1 !== armies.findIndex(army => {
        return /*army.team === localPlayer.team*/
      })
    }

    this.sectorLabel.display(sector)

    const castle = sector.buildings[BuildingTypes.CASTLE]
    if (castle && castle.team === localPlayer.team)
    {
      this.switch('root', sector)
    }
    else
    {
      // Hide the current view
      this.activeView?.setVisible(false)
      this.activeView = null

      // Display the sector label
      this.sectorLabel.setVisible(true)

      if (sector.armies.length > 0 && hasOwnArmy(sector.armies) && localPlayer.inAlliance === false)
      {
        console.log("Claim!")
      }
      else
      {
        // Nothing displayed.
        console.log("Nothing")
      }
    }
  }

  /**
   * Display Sector Controls view for the provided sector
   * @param {*} name 
   * @param {*} sector 
   */
  switch(name, sector)
  {
    // Hide the current view
    this.activeView?.setVisible(false)

    const view = this.views.getChildren().find(view => view.name === name)
    if (view == null)
    {
      console.warn(`Unknown view name ${name}`)
      this.activeView = this.views.getChildren().find(view => view.name === 'root')
    }
    else
    {
      this.activeView = view
    }

    // Display the Sector label on the when the root view is displayed
    this.sectorLabel.setVisible(this.activeView.name === 'root')

    // Refresh the view with the sector details
    this.activeView.display(sector)
  }
}