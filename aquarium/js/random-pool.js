// Pick once at the start of a run. A saved plan contains pool indexes, not rewards.
export function samplePool(pool,count,random=Math.random){
 const values=[...pool];
 for(let i=values.length-1;i>0;i--){const j=Math.min(i,Math.max(0,Math.floor(random()*(i+1))));[values[i],values[j]]=[values[j],values[i]];}
 return values.slice(0,count);
}
export const poolIndexes=pool=>pool.map((_,i)=>i);
export const validPlan=(plan,pool,count=9)=>Array.isArray(plan)&&plan.length===count&&plan.every(i=>Number.isInteger(i)&&i>=0&&i<pool.length)&&new Set(plan).size===count;
