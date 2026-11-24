// This is the public origin of the separately deployed record service.
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
  if(!response.ok)throw new Error('기록실에 연결할 수 없어요.');
  return await response.json();
 }finally{clearTimeout(timeout);}
}
export const loadSharedArcadeRecords=()=>request('/api/records');
export async function getArcadeTicket(id){
 const {ticket}=await request('/api/runs',{id});
 return ticket;
}
export async function shareArcadeRecord(record){
 const ticket=record.ticket||await getArcadeTicket(record.id);
 return request('/api/records',{id:record.id,ticket,player:record.player,games:record.games});
}
