// The painted atlas has unequal row heights. Use measured source rectangles
// and hand/key contact points, never assume a uniform 4-by-8 grid.
export const WORK_ROWS=[
 {bounds:[16,239],feet:[[152,233],[376,233],[598,233],[821,233]],hands:[[34,165],[278,149],[501,150],[709,165]]},
 {bounds:[242,465],feet:[[152,459],[376,459],[598,459],[821,459]],hands:[[34,389],[278,374],[501,375],[709,390]]},
 {bounds:[470,697],feet:[[152,690],[376,690],[598,690],[821,690]],hands:[[31,610],[273,603],[496,596],[709,610]]},
 {bounds:[703,929],feet:[[152,921],[376,921],[598,921],[821,921]],hands:[[30,838],[270,829],[497,824],[705,839]]},
 {bounds:[937,1143],hands:[[48,1060],[271,1060],[492,1060],[717,1060]]},
 {bounds:[1151,1354],hands:[[48,1275],[271,1276],[493,1276],[716,1275]]},
 {bounds:[1359,1562],hands:[[48,1484],[271,1484],[493,1484],[716,1484]]},
 {bounds:[1575,1774],hands:[[49,1695],[271,1695],[493,1695],[716,1695]]}
];
export function workFrame(character,kind,age){
 const row=Math.max(0,['haru','doyun','narin','soi'].indexOf(character))+(kind==='lock'?4:0),frame=Math.floor(age*7)%4,data=WORK_ROWS[row],left=[18,252,475,688][frame],right=[199,422,643,865][frame],top=data.bounds[0];
 return {sx:left,sy:top,sw:right-left,sh:data.bounds[1]-top,hx:data.hands[frame][0]-left,hy:data.hands[frame][1]-top,gx:data.feet?.[frame][0]-left,gy:data.feet?.[frame][1]-top,scale:kind==='sew'?.248:.252};
}
export function drawLiteratureWork(c,image,character,kind,age,contact,ground){const f=workFrame(character,kind,age),x=ground?ground.x-f.gx*f.scale:contact.x-f.hx*f.scale,y=ground?ground.y-f.gy*f.scale:contact.y-f.hy*f.scale;c.drawImage(image,f.sx,f.sy,f.sw,f.sh,x,y,f.sw*f.scale,f.sh*f.scale);}
