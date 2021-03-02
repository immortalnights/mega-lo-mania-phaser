### Day 1
* Initialized the project from Phaser 3 template
* Imported the units spritesheets
* Created atlas JSON for the armies spritesheet added the first frame
* Displayed the sprite, got side tracked trying to make spritesheet background transparent with a color replacement pipeline
  * Pipeline was out of date, so doesn't currently work. Also needed to include TypeScript for it to work
* Stopped trying to fix the background for now
* Write the atlas frames for the first unit movement
* Initialized the animation from the frames and verified it worked
* Added atlas frames for the rest of the directions
* Added keyboard controls to change the sprite "direction" to test all animations aligned
* Fixed some alignment issues and made the sprite move at the same time
* Added atlas frames for the sling unit
* Added ability to dynamically change the test unit type (number keys)
* Created animation factory for the units
* Added atlas frames for the spear unit as final verification
* Added atlas frames for the Biplane and Jet, verified they displayed
* Imported the icons spritesheet, made empty atlas files for all the spritesheets
* Added atlas frames for the spawn animation, contained in the icons spritesheet
* Added a GameObject for the spawner (animation) and, upon completing the animation spawn an actual unit

End of day 1.

### Day 2 : 28-02-21
* Improved unit movement to better represent end-goal movement
* Fixed movement frames to remove Attack frame
* Implemented basic attack into Unit cycle
* Instead of spawner class, just change the sprite texture and animation


### Day 3 : 01-03-21
* Add Building and define all building images
* Handle defender placement on buildings
* Implement "click" marker to help position the defenders, still manual process, but better
* add const Object to define all units and teams, use these in the animation factory to (later) set up all animations
