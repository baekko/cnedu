// Keep the final game scene visible before opening results. No countdown UI.
export class FinishTransition{
 constructor(seconds=1){this.seconds=seconds;this.reset();}
 reset(){this.pending=null;this.elapsed=0;}
 start(result){if(this.pending)return false;this.pending={...result,found:[...(result.found||[])]};this.elapsed=0;return true;}
 update(dt){if(!this.pending)return null;this.elapsed+=Math.max(0,dt);if(this.elapsed+1e-9<this.seconds)return null;const result=this.pending;this.reset();return result;}
}

// Every finished expedition keeps its clues, including death and timeout.
// Leaving voluntarily still follows the separate stop/replay flow.
export function keepsClues(place,result,reason=null){return result.survived===true||reason!=='leave';}
// Solving depends on reaching the collection, never on surviving the minigame.
export function canSolveCollection(place,record){return record?.phase==='result';}
