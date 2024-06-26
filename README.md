# 3d Point Triangulator
Is an After Effects script that allows you to quickly extract 3d coordinates.  
Requirement: 3d camera data.  

## Credits
Expressions: `fadaaszhi` (discord)  
Script: `shy_rikki` (discord)  
https://www.youtube.com/@shy_rikki  

## Installation
1. Download the script: https://github.com/eirisocherry/3d-point-triangulator/releases  
2. Move the `3D_Point_Triangulator.jsx` script to:  
`C:\Program Files\Adobe\Adobe After Effects <version>\Support Files\Scripts\ScriptUI Panels`  
3. Restart After Effects.  

## Usage
1. Press [Add Point] button.  
2. Select the "Point Triangulator".  
3. Animate the "Point" property:  
Set a cursor to the location you want to extract 3d coordinates from, play a video a bit, set a cursor to the same location (only 2 keyframes needed).  
4. If you did everything correctly, a solid will appear exactly in your location.  
Select "Point Triangulator" layer and press [Set Point] button to bake the expressions.  
5. Paste the solid's position to any objects you want (light, null etc)  

If you want to spawn a solid with custom orientation, use [Add Surface] and [Set Surface] buttons instead.  
The process is absolutely the same as with [Add Point] & [Set Point] buttons except you'll need to animate three "Point" parameters at once (2 keyframes needed for each).  
