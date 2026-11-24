const bound=t=>Math.max(0,Math.min(8,Number.isFinite(t)?t:0));
export class CinemaMovies179{
 constructor(records,{createVideo=()=>document.createElement('video'),url=p=>new URL('../assets/'+p,import.meta.url).href,maxLoaded=3}={}){this.records=records;this.createVideo=createVideo;this.url=url;this.maxLoaded=maxLoaded;this.items=new Map();this.pending=new Map();this.recent=[];this.active=null;this.owner=null;this.error='';}
 touch(id){this.recent=this.recent.filter(x=>x!==id);this.recent.push(id);}
 prune(keep=new Set(this.active?[this.active]:[])){for(const id of [...this.recent]){if(this.items.size<=this.maxLoaded)break;if(!keep.has(id))this.release(id);}}
 release(id){const item=this.items.get(id);if(item){item.video.pause();item.video.removeAttribute?.('src');item.video.load?.();this.items.delete(id);}this.recent=this.recent.filter(x=>x!==id);}
 async ensure(id){
  if(this.items.has(id)){this.touch(id);return this.items.get(id);}if(this.pending.has(id))return this.pending.get(id);const record=this.records[id];if(!record)throw Error('이 영화의 수정 영상을 찾지 못했습니다.');if(record.status==='pending')throw Error(record.unavailableReason||'새 장면을 준비하고 있습니다.');
  const task=(async()=>{const video=this.createVideo();Object.assign(video,{muted:true,defaultMuted:true,playsInline:true,loop:false,preload:'auto',playbackRate:1});video.setAttribute?.('playsinline','');video.setAttribute?.('muted','');const item={id,record,video,ready:false,playPromise:null};
   await new Promise((resolve,reject)=>{let timeout;const cleanup=()=>{clearTimeout(timeout);video.removeEventListener('loadeddata',ready);video.removeEventListener('error',failed);};const ready=()=>{cleanup();if(video.videoWidth<960||video.videoHeight<540){reject(Error('영화 영상의 화질 정보를 확인하지 못했습니다.'));return;}if(Number.isFinite(video.duration)&&Math.abs(video.duration-8)>.08){reject(Error('영화 영상의 길이를 확인하지 못했습니다.'));return;}resolve();};const failed=()=>{cleanup();reject(Error('영화 영상을 불러오지 못했습니다. 다시 열어 주세요.'));};video.addEventListener('loadeddata',ready,{once:true});video.addEventListener('error',failed,{once:true});timeout=setTimeout(failed,25000);video.src=this.url(record.movie);video.load?.();if(video.readyState>=2)ready();});
   item.ready=true;video.pause();video.currentTime=0;this.items.set(id,item);this.touch(id);this.prune(new Set([id,...(this.active?[this.active]:[])]));return item;
  })().catch(error=>{this.error=error.message;throw error;}).finally(()=>this.pending.delete(id));this.pending.set(id,task);return task;
 }
 ready(id){return this.items.get(id)?.ready===true;}
 time(id){const v=this.items.get(id);return v?.ready?bound(v.video.currentTime):null;}
 pause(id=this.active){this.items.get(id)?.video.pause();}
 async play(id){const item=await this.ensure(id);this.active=id;this.touch(id);this.prune();for(const[other,q]of this.items)if(other!==id)q.video.pause();if(item.video.ended||item.video.currentTime>=7.999||!item.video.paused)return;if(!item.playPromise)item.playPromise=Promise.resolve(item.video.play()).catch(error=>{this.error='영화 재생을 시작하지 못했습니다. 다시 열어 주세요.';throw error;}).finally(()=>item.playPromise=null);await item.playPromise;}
 seek(id,t){const q=this.items.get(id);if(!q?.ready)return false;q.video.pause();q.video.currentTime=bound(t);return true;}
 reset(){for(const q of this.items.values()){q.video.pause();if(q.ready)q.video.currentTime=0;}this.active=null;this.owner=null;this.error='';}
 sync(id,playing,age,owner=null){
  if(owner&&this.owner!==owner){this.pause();this.owner=owner;this.active=null;}
  const q=this.items.get(id);if(!q){this.ensure(id).catch(()=>{});return false;}
  if(this.active!==id){this.pause();this.active=id;if(Math.abs(q.video.currentTime-age)>.05)this.seek(id,age);}
  if(playing&&age<8)this.play(id).catch(()=>{});else q.video.pause();return q.ready;
 }
 draw(c,id,screen){const q=this.items.get(id);if(!q?.ready||q.video.readyState<2)return false;c.drawImage(q.video,screen.x,screen.y,screen.w,screen.h);return true;}
}
