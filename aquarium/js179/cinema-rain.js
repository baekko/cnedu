// Stable pixel rain fields: only the drop positions depend on playback time.
const hash=n=>{n=Math.imul(n^n>>>16,0x45d9f3b);n=Math.imul(n^n>>>16,0x45d9f3b);return (n^n>>>16)>>>0;};
const fields=Object.freeze(Object.fromEntries(['back','front'].map((layer,index)=>[layer,
 Object.freeze(Array.from({length:index?56:160},(_,i)=>{
  const seed=hash(i+1+index*211);
  return Object.freeze({x:seed%340,y:hash(seed)%220,cycles:(index?6:4)+seed%3,length:(index?11:7)+seed%6});
 }))
])));
export function drawCinemaRain(c,age,seconds,layer='back'){
 const time=Math.max(0,Number.isFinite(age)?age:0),phase=(time%seconds)/seconds;
 c.save();c.fillStyle=layer==='front'?'#c4dfef':'#a5c2d9';c.globalAlpha=layer==='front'?.46:.32;
 for(const drop of fields[layer]){
  // Each complete fall wraps while its head AND tail are outside the picture.
  // Integer cycles make the weather continuous across the movie's own loop.
  const y=(drop.y+phase*220*drop.cycles)%220-20;
  const x=((drop.x-y*.34)%340+340)%340-10;
  for(let tail=0;tail<drop.length;tail+=2)c.fillRect(Math.floor(x+tail*.34),Math.floor(y-tail),1,Math.min(2,drop.length-tail));
 }
 c.restore();
}
