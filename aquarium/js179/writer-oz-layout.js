// One frontal panorama shares Jack's level floor. Register the painted contact
// line, not transparent canvas padding; no separate sloping entry patch.
const scale=1425/2172,left=7990-900*scale;
export const OZ_LANDSCAPE=Object.freeze({left,right:left+3072*scale,bottom:439,sourceGroundY:720,asset:'oz-level-v127'});
export function ozLandscapePlacement(image){
 const width=OZ_LANDSCAPE.right-OZ_LANDSCAPE.left,scale=width/image.width;
 return {x:OZ_LANDSCAPE.left,y:OZ_LANDSCAPE.bottom-OZ_LANDSCAPE.sourceGroundY*scale,width,height:image.height*scale,scale};
}
export function ozLandscapeVisible(cameraX,width=390){return cameraX+width>OZ_LANDSCAPE.left&&cameraX<OZ_LANDSCAPE.right;}
