// Three different finishing gestures, shared by the live game and its demonstrations.
export const FRUITS=['딸기','블루베리','키위'];
export function createFinishing(kind,round=0){return {kind,round,step:0,age:0,cursor:0,holding:false,amount:0,wait:0,marks:[],note:'',noteLeft:0,pattern:[round%3,(round+2)%3,(round+1)%3]};}
export const stampTarget=t=>[.45,.7,.35][(t.step+t.round)%3];
export function advanceFinishing(t,dt){
 t.age+=dt;t.wait=Math.max(0,t.wait-dt);t.noteLeft=Math.max(0,t.noteLeft-dt);
 if(t.kind==='cookie')t.cursor=1-Math.abs(1-(t.age*.58)%2);
 if(t.kind==='muffin'&&t.holding){t.amount+=dt*.38;if(t.amount>1.04){t.holding=false;t.amount=0;t.note='넘쳤어요! 이 머핀만 다시 짜요';t.noteLeft=1.5;}}
}
export function finishInput(t,action,value){
 if(t.step>=3||t.wait>1e-8)return false;
 let success=false;
 if(t.kind==='cookie'&&action==='stamp')success=Math.abs(t.cursor-stampTarget(t))<=.13;
 else if(t.kind==='muffin'&&action==='press'){t.holding=true;return true;}
 else if(t.kind==='muffin'&&action==='release'){if(!t.holding)return false;t.holding=false;success=t.amount>=.6&&t.amount<=.84;t.amount=0;}
 else if(t.kind==='tart'&&action==='fruit')success=Number(value)===t.pattern[t.step];
 else return false;
 if(success){t.marks.push(t.kind==='tart'?Number(value):true);t.step++;t.wait=.4;t.note='좋아요!';t.noteLeft=.6;if(t.kind==='cookie')t.age=t.cursor=0;}
 else{t.wait=.25;t.note=t.kind==='cookie'?'초록 원에 겹칠 때 찍어요':t.kind==='muffin'?'초록 높이에서 손을 떼요':'견본의 다음 과일을 골라요';t.noteLeft=1.4;}
 return success;
}
