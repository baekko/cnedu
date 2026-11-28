// One logical-width column: the scene and every game UI layer share its scale.
export function shellMetrics(width,height,stage='aquarium',safeTop=0,safeBottom=0){
 const base=stage==='aquarium'?536:500,usable=Math.max(1,height-safeTop-safeBottom);
 const scrollable=width>height&&usable<560;
 const scale=Math.min(width/390,Math.max(usable,scrollable?650:0)/(base+210));
 return {scale,width:390*scale,logicalHeight:height/scale,base,scrollable,left:(width-390*scale)/2,safeTop:safeTop/scale,safeBottom:safeBottom/scale};
}
export function collectionShellMetrics(width,height,stage,safeTop=0,safeBottom=0,referenceHeight=height){
 const fit=shellMetrics(width,referenceHeight,stage,safeTop,safeBottom);
 return {...fit,logicalHeight:height/fit.scale};
}
export function cameraRect(width,height,focusY,stage='aquarium',scrollable=false){
 const sourceY=stage==='aquarium'?142:170,sourceHeight=stage==='aquarium'?536:500;
 const scale=Math.min(width/390,Math.max(height,scrollable?360:0)/sourceHeight);
 return {scale,sourceY,sourceHeight,width:390*scale,height:sourceHeight*scale,
  offsetX:(width-390*scale)/2,offsetY:Math.max(0,(height-sourceHeight*scale)/2),cropped:false};
}
export function sceneGeometry(height,stage='aquarium'){
 const top=stage==='aquarium'?142:170,base=stage==='hospital'?height:stage==='aquarium'?536:500;
 const header=stage==='history'?100:stage==='exchange'?220:0;
 const headerScale=header?Math.min(1,height/(header+180)):1;
 const fixed=header*headerScale,ratio=(height-fixed)/(base-header);
 return {top,height,base,header,fixed,headerScale,ratio,offset:top+fixed-(top+header)*ratio,
  y:y=>top+fixed+(y-top-header)*ratio};
}
export function beginScene(c){
 const s=c.canvas.scene||sceneGeometry(536,'aquarium');c.setTransform(2,0,0,2*s.ratio,0,2*s.offset);return s;
}
// Establish a local coordinate system at an object's mapped position, with equal
// horizontal/vertical scales. Nested sprites (pilot inside machine) stay uniform.
export function spriteAnchor(c,x,y){
 c.translate(x,y);const m=c.getTransform(),sx=Math.hypot(m.a,m.b),sy=Math.hypot(m.c,m.d);if(sy)c.scale(1,sx/sy);
}
export function sceneText(c,text,x,y){c.save();spriteAnchor(c,x,y);c.fillText(text,0,0);c.restore();}
// Existing room art is never stretched. Its architecture stays at the top; floor
// and side displays continue in full-width bands when the usable floor is taller.
export function drawRoom(c,img){
 const s=c.canvas.scene||sceneGeometry(500,'history');c.save();c.setTransform(2,0,0,2,0,0);
 c.beginPath();c.rect(0,s.top,390,s.height);c.clip();
 const sourceScale=img.width/390,band=150;
 for(let y=0;y<s.height;y+=band){const h=Math.min(band,s.height-y);c.drawImage(img,0,350*img.height/500,img.width,h*img.height/500,0,s.top+y,390,h);}
 // Preserve the original 390:500 room composition at native aspect; only the
 // lower empty floor is cropped on short displays. No gameplay is cropped.
 if(s.headerScale===1)c.drawImage(img,0,s.top,390,500);
 else{const k=s.headerScale;c.drawImage(img,(390-390*k)/2,s.top,390*k,500*k);}
 c.restore();
}
export class GameLayout{
 constructor({app,viewport,canvas}){
  Object.assign(this,{app,viewport,canvas});this.world=document.createElement('canvas');this.world.width=780;this.world.height=1688;this.ctx=canvas.getContext('2d');this.cameraY=null;this.lastStage=null;
  this.refresh=()=>{
   const vv=window.visualViewport,height=Math.round(Math.min(window.innerHeight,vv?.height||window.innerHeight));
   const width=viewport.clientWidth,answerFocused=document.activeElement?.id==='answer-input';
   if(this.answerAnchor&&Math.abs(width-this.answerAnchor.width)>2)this.answerAnchor=null;
   if(answerFocused&&!this.answerAnchor)this.answerAnchor={width,height:this.lastVisibleHeight||height};
   if(this.answerAnchor&&!answerFocused&&(height>=this.answerAnchor.height-2||!['result','feedback'].includes(app.dataset.screen)))this.answerAnchor=null;
   if(!this.answerAnchor)this.lastVisibleHeight=height;
   viewport.style.height=height+'px';viewport.style.top=(vv?.offsetTop||0)+'px';app.style.setProperty('--visible-height',height+'px');
   app.classList.toggle('keyboard-open',answerFocused&&height<(this.answerAnchor?.height||window.innerHeight)-80);
   this.measure();requestAnimationFrame(()=>this.revealAnswer());
  };
  this.revealAnswer=()=>{
   if(document.activeElement?.id!=='answer-input')return;
   const body=document.getElementById('result-content'),form=document.getElementById('answer-form');
   const m=body.getBoundingClientRect(),f=form.getBoundingClientRect(),scale=this.uiScale||1;
   if(f.bottom>m.bottom-12*scale)body.scrollTop+=(f.bottom-m.bottom+12*scale)/scale;
   else if(f.top<m.top+12*scale)body.scrollTop-=(m.top+12*scale-f.top)/scale;
  };
  window.addEventListener('resize',this.refresh);window.visualViewport?.addEventListener('resize',this.refresh);window.visualViewport?.addEventListener('scroll',this.refresh);document.addEventListener('focusin',this.refresh);document.addEventListener('focusout',this.refresh);this.refresh();
  this.observer=new ResizeObserver(()=>this.measure());this.observer.observe(viewport);this.measure();
 }
 measure(stage=this.stage||'aquarium'){
  this.stage=stage;const rootStyle=getComputedStyle(document.documentElement),safeTop=parseFloat(rootStyle.getPropertyValue('--safe-top'))||0,safeBottom=parseFloat(rootStyle.getPropertyValue('--safe-bottom'))||0;
  const w=this.viewport.clientWidth,h=this.viewport.clientHeight;
  const aligned=!['title','select','naming','welcome','stage','loading'].includes(this.app.dataset.screen);
  const referenceHeight=this.answerAnchor?.height||h;
  const fit=collectionShellMetrics(w,h,stage,safeTop,safeBottom,referenceHeight),scale=aligned?fit.scale:1;this.uiScale=scale;
  this.app.classList.toggle('aligned-layout',aligned);this.app.style.setProperty('--ui-scale',scale);
  this.app.style.width=aligned?'390px':'100%';this.app.style.height=h/scale+'px';this.app.style.left=aligned?fit.left+'px':'0';
  this.app.style.setProperty('--safe-top',safeTop/scale+'px');this.app.style.setProperty('--safe-bottom',safeBottom/scale+'px');
  this.width=aligned?390:w;this.height=h/scale;this.top=70+safeTop/scale;this.bottom=140+safeBottom/scale;this.viewHeight=Math.max(1,this.height-this.top-this.bottom);
  this.app.style.setProperty('--scene-top',this.top+'px');this.app.style.setProperty('--scene-height',this.viewHeight+'px');this.app.style.setProperty('--dock-height',this.bottom+'px');
  this.app.style.setProperty('--room-origin-y',(this.top+Math.max(0,(this.viewHeight-500)/2))+'px');
  this.scrollable=aligned&&fit.scrollable;this.app.classList.toggle('game-scrollable',this.scrollable);
  this.dpr=Math.min((window.devicePixelRatio||1)*scale,3);this.lastTarget=null;
  this.measureKey=[w,h,stage,aligned].join(':');
 }
 prepare(game,stage){
  const aligned=!['title','select','naming','welcome','stage','loading'].includes(this.app.dataset.screen);
  const key=[this.viewport.clientWidth,this.viewport.clientHeight,stage,aligned].join(':');if(key!==this.measureKey)this.measure(stage);
  const sourceY=stage==='aquarium'?142:170;
  const sourceHeight=stage==='hospital'&&!this.scrollable
   ?Math.max(500,Math.ceil(this.viewHeight)):stage==='aquarium'?536:500;
  const target={sourceY,sourceHeight,width:390,height:sourceHeight},drawKey=[this.dpr,stage,this.measureKey].join(':');
  if(drawKey!==this.lastTarget){
   this.lastTarget=drawKey;this.canvas.style.width='390px';this.canvas.style.height=sourceHeight+'px';
   this.canvas.width=Math.round(390*this.dpr);this.canvas.height=Math.round(sourceHeight*this.dpr);
   const worldHeight=Math.max(1688,(sourceY+sourceHeight)*2);
   if(this.world.height!==worldHeight)this.world.height=worldHeight;
   const viewport=document.getElementById('game-viewport');if(viewport)viewport.scrollTop=0;
  }
  this.target=target;this.world.scene=sceneGeometry(sourceHeight,stage);if(game){game.sceneRatio=1;game.sceneSpriteScale=1;}
 }
 present(game,stage){
  const target=this.target,c=this.ctx;
  c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,this.canvas.width,this.canvas.height);
  c.drawImage(this.world,0,target.sourceY*2,780,target.sourceHeight*2,0,0,this.canvas.width,this.canvas.height);
  this.canvas.dataset.camera=this.scrollable?'fixed-scroll':'fixed-fit';
 }
}
