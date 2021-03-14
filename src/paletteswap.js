
import mlm_units from  './assets/mlm_units.json'

/**
 * Creates new sprite sheets and animations from the given palette and spritesheet.
 * from https://github.com/Colbydude/phaser-3-palette-swapping-example/blob/master/public/js/palette-swap.js
 * @param {object} config - Config schema.
 */
export default function paletteSwap(config)
{
  // Create color lookup from palette image.
  const game = config.game
  let colorLookup = {};
  let x, y;
  let pixel, palette;
  let paletteWidth = game.textures.get(config.paletteKey).getSourceImage().width;

  // Go through each pixel in the palette image and add it to the color lookup.
  for (y = 0; y < config.paletteNames.length; y++) {
      palette = config.paletteNames[y];
      colorLookup[palette] = [];

      for (x = 0; x < paletteWidth; x++) {
          pixel = game.textures.getPixel(x, y, config.paletteKey);
          colorLookup[palette].push(pixel);
      }
  }

  // Create sheets and animations from base sheet.
  let sheet = game.textures.get(config.spriteSheet.key).getSourceImage();
  let atlasKey, anim, animKey;
  let canvasTexture, canvas, context, imageData, pixelArray;

  // Iterate over each palette.
  for (y = 0; y < config.paletteNames.length; y++) {
      palette = config.paletteNames[y];
      atlasKey = config.spriteSheet.key + '-' + palette;

      // Create a canvas to draw new image data onto.
      canvasTexture = game.textures.createCanvas(config.spriteSheet.key + '-temp', sheet.width, sheet.height);
      canvas = canvasTexture.getSourceImage();
      context = canvas.getContext('2d');

      // Copy the sheet.
      context.drawImage(sheet, 0, 0);

      // Get image data from the new sheet.
      imageData = context.getImageData(0, 0, sheet.width, sheet.height);
      pixelArray = imageData.data;

      // Iterate through every pixel in the image.
      for (let p = 0; p < pixelArray.length / 4; p++) {
          let index = 4 * p;

          let r = pixelArray[index];
          let g = pixelArray[++index];
          let b = pixelArray[++index];
          let alpha = pixelArray[++index];

          // If this is a transparent pixel, ignore, move on.
          if (alpha === 0) {
              continue;
          }

          // Iterate through the colors in the palette.
          for (let c = 0; c < paletteWidth; c++) {
              let oldColor = colorLookup[config.paletteNames[0]][c];
              let newColor = colorLookup[palette][c];

              // If the color matches, replace the color.
              if (r === oldColor.r && g === oldColor.g && b === oldColor.b && alpha === 255) {
                  pixelArray[--index] = newColor.b;
                  pixelArray[--index] = newColor.g;
                  pixelArray[--index] = newColor.r;
              }
          }
      }

      // Put our modified pixel data back into the context.
      context.putImageData(imageData, 0, 0);

      // Add the canvas as a sprite sheet to the game.
      game.textures.addAtlas(atlasKey, canvasTexture.getSourceImage(), mlm_units, null);
      // game.textures.addSpriteSheet(atlasKey, canvasTexture.getSourceImage(), {
      //   frameWidth: config.spriteSheet.frameWidth,
      //   frameHeight: config.spriteSheet.frameHeight,
      // });
      
      /* NOT YET
      // Iterate over each animation.
      for (let a = 0; a < config.animations.length; a++) {
          anim = config.animations[a];
          animKey = atlasKey + '-' + anim.key;

          // Add the animation to the game.
          game.anims.create({
              key: animKey,
              frames: game.anims.generateFrameNumbers(atlasKey, {start: anim.startFrame, end: anim.endFrame}),
              frameRate: anim.frameRate,
              repeat: anim.repeat === undefined ? -1 : anim.repeat
          });
      }

      // Destroy temp texture.
      */
     game.textures.get(config.spriteSheet.key + '-temp').destroy();
  }

  // Destroy textures that are not longer needed.
  // NOTE: This doesn't remove the textures from TextureManager.list.
  //       However, it does destroy source image data.
  // NOT YET
  // game.textures.get(config.spriteSheet.key).destroy();
  // game.textures.get(config.paletteKey).destroy();
}