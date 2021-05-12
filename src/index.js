import Phaser from 'phaser'
import Loader from './loaderscene'
import Introduction from './introduction/scene'
import Menu from './menu/scene'
import CharacterSelect from './characterselect/scene'
import Campaign from './campaign/scene'
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
      return new Loader({ nextScene: 'campaign' })
    },
    Introduction,
    Menu,
    CharacterSelect,
    Campaign,
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
