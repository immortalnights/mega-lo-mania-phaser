import Phaser from 'phaser'

const featurePositions = {
  '00': { x: 69, y: 5 },
  '01': { x: -116, y: 12 },
  '02': { x: 0, y: 0 },
  '03': { x: 0, y: 0 },
  '04': { x: 0, y: 0 },
  '05': { x: 76, y: 72 },
  '06': { x: 0, y: 0 },
  '07': { x: 0, y: 0 },
  '08': { x: -114, y: -63 },
  '09': { x: 0, y: 0 },
  '10': { x: 0, y: 0 },
  '11': { x: 0, y: 0 },
  '12': { x: 0, y: 0 },
  '13': { x: 0, y: 0 },
  '14': { x: 0, y: 0 },
  '15': { x: 55, y: -67 },
  '16': { x: 0, y: 0 },
  '17': { x: -131, y: 72 },
}

const features = {
  '1010': [ '00', '01', '05', '08', '15', '17' ]
}


export default class Sector extends Phaser.GameObjects.Container
{
  constructor(scene, x, y)
  {
    super(scene, x, y)

    // Slab image
    const land = new Phaser.GameObjects.Image(scene, 20, 40, 'mlm_slab')
    land.setTint(0x228822)
    this.add(land)

    const template = new Phaser.GameObjects.Image(scene, -26, 0, '1010_sector')
    template.setScale(0.33)
    template.setAlpha(0.65)
    this.add(template)


    const features = new Phaser.GameObjects.Group(scene)

    const inc = []
    for (let i = 0; i < 18; i++)
    {
      const index = String(i).padStart(2, '0')
      const position = featurePositions[index]

      if (position.x || position.y)
      {
        const image = new Phaser.GameObjects.Image(scene, position.x, position.y, 'mlm_features', 'cliff_' + index)
        image.setAlpha(0.5)
        this.add(image)
        features.add(image)

        inc.push(index)
        console.log(index, position.x, position.y)
      }
    }

    console.log(`[ '${inc.join('\', \'')}' ]`)

    scene.events.on('sector:show:template', () => {
      features.setAlpha(0.5)
      template.setVisible(true)
    })
    scene.events.on('sector:hide:template', () => {
      features.setAlpha(1)
      template.setVisible(false)
    })
    scene.events.on('sector:show:features', () => {
      features.setVisible(true)
    })
    scene.events.on('sector:hide:features', () => {
      features.setVisible(false)
    })
  }
}