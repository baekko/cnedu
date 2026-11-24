export function arcadeCharacterSetupId(data){
 const run=data?.run;
 if(!run?.player)return null;
 const games=run.games??{};
 if(Array.isArray(run.places)&&run.places.length&&run.places.every(place=>games[place]&&!games[place].abandoned))return run.id;

 // Recover rematches that v252 started with the previous character.
 const previous=data.records?.[0];
 const attempts=Object.keys(games).length+Number(Boolean(run.active));
 if(previous?.id&&previous.id!==run.id&&attempts<=1&&previous.player?.name===run.player.name
   &&previous.player.character===run.player.character)return previous.id;
 return null;
}

export function canResumeArcade(data){
 const run=data?.run;
 return !!run?.player&&Array.isArray(run.places)&&!arcadeCharacterSetupId(data)
  &&run.places.some(place=>!run.games?.[place]);
}
