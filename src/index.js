import Phaser from 'phaser'
import Loader from './loaderscene'
import Introduction from './introduction/scene'
import Menu from './menu/scene'
import CharacterSelect from './characterselect/scene'
import Campaign from './campaign/scene'
import Island from './island/scene'
import PauseMenu from './pausemenu/scene'
import Credits from './credits/scene'
import Sandbox from './sandbox'


const config = {
  type: Phaser.WEBGL,
  width: 450, // 320,
  height: 300, // 200,
  zoom: 3,
  scene: [
    () => {
      const initData = {
        setup: {
          island: {
            name: "Aloha",
            epoch: 1,
            players: 2,
            style: "mud",
            map: [0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0],
            resources: {
              "6": ["herbirite","rock","slate","solarium"],
              "10": ["bethlium","moonlite","parasite","wood"]
            },
            opponents : ["green"]
          },
          localPlayerTeam: 'red',
          sectors: [
            {
              index: 6,
              team: "green",
              population: 30
            },
            {
              index: 10,
              team: "red",
              population: 10
            }
          ]
        }
      }

      return new Loader({ nextScene: 'island', nextSceneData: initData })
    },
    Introduction,
    Menu,
    CharacterSelect,
    Campaign,
    Island,
    PauseMenu,
    Credits,
    Sandbox,
  ],
  seed: [ 'T' ],
  // backgroundColor: 0x005500,
  loader: {
    baseUrl: '.',
    path: process.env.NODE_ENV === 'production' ? './assets' : './src/assets'
  },
  disableContextMenu: true,
  banner: {
    background: [ '#000000' ],
  }
}

const game = new Phaser.Game(config)
