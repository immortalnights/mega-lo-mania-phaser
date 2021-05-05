import Phaser from 'phaser'
import { GameEvents, UserEvents } from '../defines'
import TeamShieldConfig from '../data/teamshieldconfig.json'


const findTeamShieldFrame = team => {
  let frame
  if (Array.isArray(team) === false)
  {
    frame = TeamShieldConfig.find(c => c.teams.length === 1 && c.teams[0] === team).frame
  }
  else
  {
    const teams = team.sort()
    const conf = TeamShieldConfig.find(item => {
      return teams.every(t => {
        return item.teams.includes(t)
      })
    })

    console.assert(conf, `Failed to find shield item for ${teams.join(', ')}`)
    frame = conf.frame
  }

  return frame
}

export class TeamShield extends Phaser.GameObjects.Image
{
  constructor(scene, x, y, frame)
  {
    super(scene, x, y, 'mlm_icons', frame)

    this.setData({ group: null })

    this.setInteractive()
    this.on('pointerdown', () => {
      const g = this.getData('group')

      if (g)
      {
        this.scene.events.emit(UserEvents.REQUEST_ALLIANCE, g)
      }
      else
      {
        this.scene.events.emit(UserEvents.BREAK_ALLIANCES)
      }
    })
  }
}

const SHIELD_Y_SPACING = 15

export default class PlayerTeamShields extends Phaser.GameObjects.Container
{
  constructor(scene, x, y, teams, localPlayerAllied)
  {
    super(scene, x, y)

    let shieldY = 0
    for (let i = 0; i < 4; i ++)
    {
      const shield = new TeamShield(scene, 0, shieldY, 'team_shield_black')
      shield.setVisible(false)
      this.add(shield)

      shieldY += SHIELD_Y_SPACING
    }

    this.updateIcons(teams, localPlayerAllied)

    this.scene.events.on(GameEvents.TEAMS_CHANGED, this.updateIcons, this)
  }

  updateIcons(teams, localPlayerAllied=false)
  {
    let breakAllianceDisplayed = false
    this.list.forEach((icon, index) => {
      const group = teams[index]

      if (group)
      {
        icon.setData({ group })
        icon.setFrame(findTeamShieldFrame(group))
        icon.setVisible(true)
      }
      else if (localPlayerAllied && breakAllianceDisplayed === false)
      {
        icon.setFrame('team_shield_black')
        icon.data.remove('group')
        icon.setVisible(true)
        breakAllianceDisplayed = true
      }
      else
      {
        icon.data.remove('group')
        icon.setVisible(false)
      }
    })
  }

  // remove later, need to handle defeat in the store to propagate actual teams back here
  onTeamDefeated(team)
  {
    const item = this.list.find(s => s.getData('team') === team)
    if (item)
    {
      item.destroy()
    }

    let shieldY = 0
    this.list.forEach(s => {
      s.setPosition(0, shieldY)
      shieldY += SHIELD_Y_SPACING
    })
  }
}