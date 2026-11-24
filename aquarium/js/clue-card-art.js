// One numberless card back for world pickups, reward effects and DOM cards.
export const CLUE_CARD_WIDTH=40,CLUE_CARD_HEIGHT=52;
const KEY_RING='M19 17a6 6 0 1 1-12 0a6 6 0 0 1 12 0Z';
const KEY_STEM='M17 21l13 13m-7-7 4-4m0 8 4-4';
export function clueCardSVG(){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 52"><rect x="1" y="1" width="38" height="50" rx="5" fill="#fff3d8" stroke="#447f7b" stroke-width="2"/><rect x="4.5" y="4.5" width="31" height="43" rx="3" fill="none" stroke="#d8be86" stroke-width=".8"/><g fill="none" stroke="#bb8a36" stroke-width="3.7" stroke-linecap="round" stroke-linejoin="round"><path d="${KEY_RING}"/><path d="${KEY_STEM}"/></g><path d="M8.93 14.46A4.8 4.8 0 0 1 14.81 12.56M18 22l9 9" fill="none" stroke="#f3d993" stroke-width="1.2" stroke-linecap="round"/></svg>`;}
export const CLUE_CARD_URL=new URL('../assets/common/clue-key.svg',import.meta.url).href;
export const clueCardIconShape=()=>`<g transform="translate(6 2) scale(.7)">${clueCardSVG().replace(/<svg[^>]*>|<\/svg>/g,'')}</g>`;
const goldCoin=typeof Image==='undefined'?null:new Image();
if(goldCoin)goldCoin.src=new URL('../assets/common/arcade-gold-coin.webp',import.meta.url).href;
let coinRewards=false;
export function setCoinRewards(enabled){coinRewards=enabled;}
export function drawClueCard(c,x,y,w=24,h=32){
 if(coinRewards){
  const size=Math.min(w,h)*1.14;
  if(goldCoin?.naturalWidth)c.drawImage(goldCoin,x-size/2,y-size/2,size,size);
  else{
   c.save();c.fillStyle='#ffda71';c.strokeStyle='#98601d';c.lineWidth=1;
   c.beginPath();c.ellipse(x,y,size*.34,size*.39,0,0,Math.PI*2);c.fill();c.stroke();c.restore();
  }
  return;
 }
 const scale=Math.min(w/40,h/52);c.save();c.translate(x,y);c.scale(scale,scale);c.translate(-20,-26);
 c.fillStyle='#fff3d8';c.strokeStyle='#447f7b';c.lineWidth=2;c.beginPath();c.roundRect(1,1,38,50,5);c.fill();c.stroke();
 c.strokeStyle='#d8be86';c.lineWidth=.8;c.beginPath();c.roundRect(4.5,4.5,31,43,3);c.stroke();
 c.strokeStyle='#bb8a36';c.lineWidth=3.7;c.lineCap='round';c.lineJoin='round';c.beginPath();c.arc(13,17,6,0,Math.PI*2);c.stroke();c.beginPath();c.moveTo(17,21);c.lineTo(30,34);c.moveTo(23,27);c.lineTo(27,23);c.moveTo(27,31);c.lineTo(31,27);c.stroke();
 c.strokeStyle='#f3d993';c.lineWidth=1.2;c.beginPath();c.arc(13,17,4.8,3.7,5.1);c.moveTo(18,22);c.lineTo(27,31);c.stroke();c.restore();
}
export function cardPositionLabel(id){const row=Math.floor((id-1)/3),col=(id-1)%3;return row===1&&col===1?'가운데 조각':['위쪽','가운데 줄','아래쪽'][row]+' '+['왼쪽','가운데','오른쪽'][col]+' 조각';}
