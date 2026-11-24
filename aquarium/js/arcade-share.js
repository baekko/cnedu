const registrationStorageKey='ptb_aquarium_arcade_registration_v1';
const recordsOrigin='https://aquarium-challenge-records.navycarp20.chatgpt.site';

async function request(path,payload){
 const controller=new AbortController();
 const timeout=setTimeout(()=>controller.abort(),8000);
 try{
  const options={credentials:'omit',signal:controller.signal};
  if(payload!==undefined)Object.assign(options,{
   method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),
  });
  const response=await fetch(recordsOrigin+path,options);
  const data=await response.json();
  if(!response.ok)throw Object.assign(new Error('기록실에 연결할 수 없어요.'),{code:data?.error,registeredName:data?.name});
  return data;
 }finally{clearTimeout(timeout);}
}
export async function registerArcadePlayer(storage,player){
 let registrationKey;
 try{
  registrationKey=storage.getItem(registrationStorageKey);
  if(!registrationKey){
   registrationKey=globalThis.crypto.randomUUID();
   storage.setItem(registrationStorageKey,registrationKey);
  }
 }catch{
  throw Object.assign(new Error('캐릭터 저장 공간을 사용할 수 없어요.'),{code:'storage_unavailable'});
 }
 const {player:registered}=await request('/api/players',{player,registrationKey});
 return {...registered,registrationKey};
}

export const loadSharedArcadeRecords=()=>request('/api/records');
export async function getArcadeTicket(id){
 const {ticket}=await request('/api/runs',{id});
 return ticket;
}
export async function shareArcadeRecord(record){
 const ticket=record.ticket||await getArcadeTicket(record.id);
 return request('/api/records',{id:record.id,ticket,player:record.player,games:record.games,registrationKey:record.registrationKey});
}
