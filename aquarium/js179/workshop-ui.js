// Both workshops advance automatically. Only paper rotation needs an extra button.
export class WorkshopUI {
 constructor(root,onRotate){
  this.root=root;this.rotate=root.querySelector('#workshop-rotate');
  this.rotate.addEventListener('click',()=>onRotate());
 }
 render(g,active,place){
  const turning=place==='conservation'&&g?.book?.mode===1;
  this.root.querySelector('#workshop-actions').hidden=!turning;
  this.rotate.hidden=!turning;
  this.rotate.disabled=!active||!turning||g.book.pinned||g.book.done;
 }
}
