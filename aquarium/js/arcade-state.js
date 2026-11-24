export function arcadeCharacterSetupId(data){
 const run=data?.run;
 if(!run?.player)return null;
 const games=run.games??{};
 if(Array.isArray(run.places)&&run.places.length&&run.places.every(place=>games[place]&&!games[place].abandoned))return run.id;

 // v252 started an empty rematch with the previous character.
 const previous=data.records?.[0];
 if(previous?.id&&!run.active&&!Object.keys(games).length&&previous.player?.name===run.player.name
   &&previous.player.character===run.player.character)return previous.id;
 return null;
}

export function canResumeArcade(data){
 const run=data?.run;
 return !!run?.player&&Array.isArray(run.places)&&!arcadeCharacterSetupId(data)
  &&run.places.some(place=>!run.games?.[place]);
}
