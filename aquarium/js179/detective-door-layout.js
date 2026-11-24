// Measured architectural openings in the actual painted back walls.
// World units are half the 780x1000 background's pixel coordinates.
export const DETECTIVE_DOORS=Object.freeze([
 {room:'study',file:'detective-v127/study.webp',x:339.75,thresholdY:123.5,width:45.5},
 {room:'gallery',file:'detective-v127/gallery.webp',x:319.25,thresholdY:121,width:42.5},
 {room:'archive',file:'detective-v127/archive.webp',x:305.25,thresholdY:121.5,width:51.5}
].map(Object.freeze));
export function atDetectiveDoor(player,door){
 return Math.abs(player.x-door.x)<door.width/2-3&&player.y>=door.thresholdY-8&&player.y<=door.thresholdY+24;
}
