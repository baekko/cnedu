// Only an explicit arrow press changes pages. Each page uses a fresh, isolated
// lesson, seeking through prerequisite actions without rendering them.
export class TutorialPlayback{
 constructor(lesson,page=0){
  this.lesson=lesson;this.page=Math.max(0,Math.min(lesson.total-1,Math.trunc(page)||0));this.elapsed=0;this.done=false;this.frameDelta=0;
  this.start=lesson.seq.findIndex(op=>op.s===this.page);this.end=lesson.seq.findIndex((op,i)=>i>this.start&&op.s!==this.page);if(this.end<0)this.end=lesson.seq.length;
  let frames=0;while(lesson.i<this.start&&!lesson.done){lesson.update(1/60);if(++frames>36000)throw Error('Tutorial page could not be reached');}
  // Apply a new scene before displaying its caption, without a transition delay.
  while(lesson.i<this.end&&lesson.seq[lesson.i].cut){const op=lesson.seq[lesson.i];op.cut();op.applied=true;lesson.i++;lesson.ageHere=0;}
  // Remove introductory reading beats when an action follows. Advancing them
  // off-screen preserves the obstacle timing of the validated demonstration.
  const first=lesson.seq[lesson.i];
  if(first?.sec&&!first.input&&!first.still&&!first.fn&&!first.until&&lesson.i+1<this.end){const i=lesson.i;while(lesson.i===i)lesson.update(1/60);}
  lesson.step=this.page;lesson.caption=lesson.seq[this.start].txt;lesson.fade=0;lesson.readingPause=false;
  lesson.inputDisplay.vector={x:0,y:0};lesson.inputDisplay.pressed.clear();lesson.previewPress='';
 }
 update(seconds){
  this.frameDelta=0;let left=Math.min(.2,Math.max(0,seconds));
  while(left>1e-8&&!this.done){const dt=Math.min(left,1/60);left-=dt;this.elapsed+=dt;const before=this.lesson.age;this.lesson.update(dt*.85);this.frameDelta+=this.lesson.age-before;
   if(this.lesson.i>=this.end||this.lesson.done){this.done=true;this.lesson.readingPause=true;}
  }
 }
}
