// Ground-contact footprints. Artwork, walking and portal landings share these
// anchors; head/hat pixels are not invisible walls in a 3/4-view room.
export const CAST=Object.freeze({
 prince:{x:238,y:168,height:58,rx:12,ry:7},
 crusoe:{x:272,y:422,height:66,rx:21,ry:10},
 fisherman:{x:68,y:265,height:78,rx:15,ry:9},
 anne:{x:268,y:236,height:72,rx:15,ry:8},
 holmes:{x:80,y:204,height:84,rx:16,ry:9}
});
const ellipse=(x,y,rx,ry)=>Array.from({length:16},(_,k)=>[x+Math.cos(k*Math.PI/8)*rx,y+Math.sin(k*Math.PI/8)*ry]);
const cast=name=>{const p=CAST[name];return ellipse(p.x,p.y-3,p.rx,p.ry);};
const fixed=[
 [cast('prince'),ellipse(285,166,14,7)],
 [cast('crusoe'),[[145,399],[200,365],[247,389],[213,421],[185,427]]],
 [cast('fisherman')],
 [cast('anne'),[[47,154],[144,154],[144,182],[47,182]],[[341,191],[378,191],[378,221],[341,221]]],
 [],
 [ellipse(105,277,25,10),ellipse(285,344,25,10)],
 [ellipse(87,325,6,5),ellipse(300,270,6,5),ellipse(180,191,6,5)],
 [[[170,196],[212,196],[219,207],[195,217],[170,209]]],
 [cast('holmes'),[[174,154],[216,154],[216,176],[174,176]]]
];
export function roomSolids(i,scene={}){
 if(i===0&&!scene.carrying&&!scene.solved)return [...fixed[i],ellipse(78,340,17,7)];
 if(i===1)return [...fixed[i],...[[92,305],[292,245]].filter((_,k)=>!scene.flags?.has(k)&&scene.heldIndex!==k).map(([x,y])=>ellipse(x,y-3,25,8))];
 if(i===4&&!scene.mounted){const p=scene.park??{x:242,y:425};return [ellipse(p.x,p.y-9,27,17)];}
 return fixed[i]??[];
}
export const ENTRY_POINTS=Array.from({length:9},(_,i)=>i===1?{x:126,y:423}:{x:195,y:417});
// The sea-room exit is above the water. Returning 42 px below it put the
// explorer in the sea, where every movement was correctly rejected.
export const RETURN_POINTS=[{x:195,y:146},{x:195,y:176},{x:348,y:112},{x:195,y:165},{x:220,y:185},{x:310,y:252},{x:280,y:232},{x:320,y:235},{x:320,y:236}];
