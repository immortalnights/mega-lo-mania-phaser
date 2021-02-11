/*---------------------------
 * Pipeline definition
 *---------------------------
 * https://gitlab.com/snippets/1796602
 */
import Phaser from 'phaser'

const SHADER_SCRIPT: string = `
precision mediump float;
uniform sampler2D uMainSampler;
varying vec2 outTexCoord;
void main(void) {
    vec4 color = texture2D(uMainSampler, outTexCoord);
    {{transparencyTest}}
    gl_FragColor = color;
}
`;

export default class TransparentColorsPipeline extends Phaser.Renderer.WebGL.Pipelines.MultiPipeline {
  constructor(game: Phaser.Game, colors: [number, number, number][]) {
    super(TransparentColorsPipeline.getConfig(game, colors));
  }

  private static getConfig(game: Phaser.Game, colors: [number, number, number][]): any {
    return {
      game,
      renderer: game.renderer,
      fragShader: TransparentColorsPipeline.configureScript(SHADER_SCRIPT, colors)
    };
  }

  private static configureScript(script: string, colors: [number, number, number][]): string {
    const testTransparencyString = `

    vec3 transparent{{index}} = vec3({{rVal}}, {{gVal}}, {{bVal}});
    if (color.rgb == transparent{{index}}.rgb)
      discard;

    `;
    const transparencyTest = colors
      .map((color: [number, number, number], index: number) =>
        testTransparencyString
          .replace(new RegExp('{{index}}', 'g'), `${index}`)
          .replace('{{rVal}}', `${color[0] / 255}`)
          .replace('{{gVal}}', `${color[1] / 255}`)
          .replace('{{bVal}}', `${color[2] / 255}`)
      )
      .join('');
    return script.replace('{{transparencyTest}}', transparencyTest);
  }
}
