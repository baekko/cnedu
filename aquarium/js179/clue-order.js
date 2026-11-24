// Rewards depend on how many cards were earned, independently of objective order.
export const CLUE_ORDER=Object.freeze([1,3,7,9,2,4,6,8,5]);
export function orderedClues(count){return CLUE_ORDER.slice(0,Math.max(0,Math.min(9,Math.floor(count)||0)));}
export function normalizeClueRewards(values){return orderedClues(new Set((Array.isArray(values)?values:[]).filter(id=>Number.isInteger(id)&&id>=1&&id<=9)).size);}
export function hasSource(game,source){return game.clueSources?.has(source)||false;}
export function awardClue(game,source){
 game.clueSources ||= new Set();
 if(game.clueSources.has(source)||game.banked.size>=9)return null;
 const id=CLUE_ORDER[game.banked.size];
 game.clueSources.add(source);game.banked.add(id);game.found.add(id);return id;
}
export function nextClue(game){return CLUE_ORDER[game.banked.size]??5;}
export function legacySources(record={}){return [...new Set((Array.isArray(record.clues)?record.clues:[]).filter(id=>Number.isInteger(id)&&id>=1&&id<=9))].map(id=>CLUE_ORDER.indexOf(id)+1);}
export function restoreSources(record={}){return new Set((Array.isArray(record.clueSources)?record.clueSources:legacySources(record)).filter(s=>(Number.isInteger(s)&&s>=0&&s<=9)||(typeof s==='string'&&/^dessert-box-[1-9]$/.test(s))));}
