import Phaser from 'phaser'

// slab = 224 x 173

const featurePositions = {
  'f02': { x: 0, y: 81 }, // bottom
  'f00': { x: 95, y: 6 }, // right center
  'f01': { x: -89, y: 13 }, // left center
  'f03': { x: 5, y: 71 }, // bottom center
  'f05': { x: 102, y: 72 }, // right bottom
  'f06': { x: 99, y: 73 }, // bottom right
  'f07': { x: -87, y: -62 }, // top left soft corner
  'f08': { x: -86, y: -61 }, // left top
  'f09': { x: -87, y: -62 }, // top left
  'f10': { x: -93, y: 74 }, // bottom left
  'f11': { x: 81, y: -66 }, // top right soft corner
  'f12': { x: -93, y: 73 }, // bottom left soft corner
  'f13': { x: 99, y: 73 }, // bottom right soft corner
  'f14': { x: 81, y: -68 }, // top right
  'f15': { x: 82, y: -66 }, // right top
  'f16': { x: -1, y: -80 }, // top center
  'f17': { x: -105, y: 72 }, // left bottom
}

const sectorFeatures = {
  's0000': [ '02', '00', '01', '03', '07', '11', '12', '13', '16' ],
  's0001': [ '02', '00', '03', '05', '09', '10', '11', '13', '16' ],
  's0010': [ '02', '00', '01', '05', '07', '11', '16', '17' ],
  's0011': [ '02', '00', '05', '09', '11', '16' ],
  's0100': [ '02', '01', '03', '06', '07', '12', '14', '16' ],
  's0101': [ '02', '03', '06', '09', '10', '14', '16' ],
  's0110': [ '02', '01', '09', '14', '16', '17' ],
  's0111': [ '02', '09', '14', '16' ],
  's1000': [ '02', '00', '01', '03', '08', '12', '13', '15' ],
  's1001': [ '02', '00', '03', '10', '13', '15' ],
  's1010': [ '02', '00', '01', '05', '08', '15', '17' ],
  's1011': [ '02', '00', '05', '15' ],
  's1100': [ '02', '01', '03', '06', '08', '12' ],
  's1101': [ '02', '03', '06', '10' ],
  's1111': [ '02' ],
}


export default class Sector extends Phaser.GameObjects.Container
{
  constructor(scene, x, y, options)
  {
    super(scene, x, y)

    // Slab image
    const land = new Phaser.GameObjects.Image(scene, 0, 0, 'mlm_slab')
    land.setTint(options.tint || 0x228822)
    this.add(land)

    // Features
    const features = new Phaser.GameObjects.Group(scene)
    Object.keys(featurePositions).forEach(key => {
      const position = featurePositions[key]

      if (position.x || position.y)
      {
        const image = new Phaser.GameObjects.Image(scene, position.x, position.y, 'mlm_features', key)
        image.setData({ key })
        this.add(image)
        features.add(image)
        // console.debug(key, position.x, position.y)
      }
    })
    features.setVisible(false)

    // Update features based on sector key
    const displaySectorByKey = key => {
      features.setVisible(false)
      const keys = sectorFeatures['s' + key]
      keys.forEach(k => {
        const feature = features.getChildren().find(f => {
          return f.getData('key') === 'f' + k
        })

        feature.setVisible(true)
      })
    }

    // Display the initial sector type
    displaySectorByKey(options.key)

    // Handle view sector event
    scene.events.on('game:view:sector', (index, key, buildings, armies) => {
      displaySectorByKey(key)
    })
  }
}