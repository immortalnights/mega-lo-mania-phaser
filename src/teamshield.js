import Phaser, { Game } from 'phaser'
import { GameEvents, UserEvents } from './defines'
import TeamShieldConfig from './assets/teamshieldconfig.json'

const findTeamShieldFrame = (team, allies=[]) => {
  let frame
  if (allies.length === 0)
  {
    frame = TeamShieldConfig.find(c => c.teams.length === 1 && c.teams[0] === team).frame
  }
  else
  {
    const teams = [team].concat(allies).sort()
    const conf = TeamShieldConfig.find(item => {
      return item.teams.every(t => {
        return teams.includes(t)
      })

      console.assert(conf, `Failed to find shield item for ${teams.join(', ')}`)

      frame = conf.frame
    })
  }

  return frame
}


export class TeamShield extends Phaser.GameObjects.Image
{
  constructor(scene, x, y, team)
  {
    super(scene, x, y, 'mlm_icons', findTeamShieldFrame(team))

    this.setData({ team })

    this.setInteractive()
    this.on('pointerdown', () => {
      this.scene.events.emit(UserEvents.REQUEST_ALLY, this.getData('team'))
    })

  }
}

const SHIELD_Y_SPACING = 16

export default class PlayerTeamShields extends Phaser.GameObjects.Container
{
  constructor(scene, x, y, teams)
  {
    super(scene, x, y)

    let shieldY = 0
    teams.forEach(t => {
      const shield = new TeamShield(scene, 0, shieldY, t)
      this.add(shield)
      shieldY += SHIELD_Y_SPACING
    })

    this.scene.events.on(GameEvents.TEAM_ALLIANCE_CHANGED, this.onTeamAllianceChange, this)

    this.scene.events.on(GameEvents.TEAM_DEFEATED, this.onTeamDefeated, this)
  }

  onTeamAllianceChange()
  {

  }

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