import {CHARACTERS} from './config.js';
import {normalizePlayerName} from './journey.js?v243';

const storageKeys=new Map([
 ['escape','ptb_aquarium_character_escape_v1'],
 ['arcade','ptb_aquarium_character_arcade_v1'],
]);

function validProfile(mode,player){
 if(!CHARACTERS.some(character=>character.id===player?.character)||typeof player.name!=='string')return null;
 const name=normalizePlayerName(player.name);
 if(!name)return null;
 const profile={character:player.character,name};
 if(mode==='arcade'&&typeof player.registrationKey==='string')profile.registrationKey=player.registrationKey;
 return profile;
}

export class ModeCharacters{
 constructor(storage,onUnavailable=()=>{}){
  this.storage=storage;
  this.onUnavailable=onUnavailable;
  this.profiles=new Map();
 }

 get(mode){
  const key=storageKeys.get(mode);
  if(!key)return null;
  try{
   const saved=validProfile(mode,JSON.parse(this.storage.getItem(key)));
   if(saved)this.profiles.set(mode,saved);
  }catch{}
  const profile=this.profiles.get(mode);
  return profile?{...profile}:null;
 }

 register(mode,player){
  const key=storageKeys.get(mode);
  if(!key)return null;
  const existing=this.get(mode);
  if(existing)return existing;
  const profile=validProfile(mode,player);
  if(!profile)return null;
  this.profiles.set(mode,profile);
  try{this.storage.setItem(key,JSON.stringify(profile));}
  catch{this.onUnavailable();}
  return {...profile};
 }
}
