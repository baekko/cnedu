// Keep each touch independently so lifting one finger never releases another.
export class DirectionPadState{
 constructor(){this.pointers=new Map();}
 get size(){return this.pointers.size;}
 has(id){return this.pointers.has(id);}
 press(id,direction){this.pointers.set(id,{direction:{...direction},advanced:false});}
 move(id,direction){const p=this.pointers.get(id);if(p)p.direction={...direction};}
 release(id){const p=this.pointers.get(id);this.pointers.delete(id);return p;}
 clear(){this.pointers.clear();}
 advance(){for(const p of this.pointers.values())p.advanced=true;}
 get value(){let x=0,y=0;for(const p of this.pointers.values()){x+=p.direction.x;y+=p.direction.y;}return {x:Math.sign(x),y:Math.sign(y)};}
}
export function padDirection(clientX,clientY,rect){
 const x=(clientX-rect.left)/rect.width*131-65.5,y=(clientY-rect.top)/rect.height*131-65.5;
 const angle=Math.atan2(y,x),radius=Math.hypot(x,y);
 return radius<12?{x:0,y:0}:{x:Math.abs(Math.cos(angle))>.38?Math.sign(x):0,y:Math.abs(Math.sin(angle))>.38?Math.sign(y):0};
}
