// Preserve the icon, emphasis and hand-authored <br> nodes. Re-opening Help is idempotent.
export function breakBriefSentences(root){
 if(!root)return;for(const line of root.querySelectorAll('.modal-kicker,h2,.modal-lead,.instruction-list b,.instruction-list small,.desktop-keys')){
  const doc=line.ownerDocument,walk=doc.createTreeWalker(line,NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT),parts=[];
  while(walk.nextNode()){const n=walk.currentNode;if(n.nodeType===3||n.tagName==='BR')parts.push(n);}
  for(let i=0;i<parts.length;i++){const node=parts[i];if(node.nodeType!==3||!/[.。]/u.test(node.data))continue;
   const value=node.data,frag=doc.createDocumentFragment();let start=0,made=false;
   for(let j=0;j<value.length;j++){if(value[j]!=='.'&&value[j]!=='。')continue;
    if(value[j]==='.'&&/\d/.test(value[j-1]||'')&&/\d/.test(value[j+1]||''))continue;
    let more=value.slice(j+1).trim().length>0;
    if(!more){let k=i+1;while(parts[k]?.nodeType===3&&!parts[k].data.trim())k++;more=!!parts[k]&&parts[k].nodeType===3;}
    if(more){frag.append(doc.createTextNode(value.slice(start,j+1)),doc.createElement('br'));start=j+1;made=true;}
   }
   if(made){frag.append(doc.createTextNode(value.slice(start)));node.replaceWith(frag);}
  }
 }
}
