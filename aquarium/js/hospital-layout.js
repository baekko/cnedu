export const HOSPITAL_VIEW = Object.freeze({width:390,height:500,top:170});
export const HOSPITAL_WALL_HEIGHT = 121;

// Coordinates describe the floor and wall footprints before camera projection.
const left = 24;
const right = 753;
const upperSplit = 348;
const lowerSplit = 419;
const bottom = 949;
const hall = {id:'hall',x:left,y:523,w:right-left,h:107,bottom:630};

const rooms = [
  {id:'lobby',name:'접수·대기실',x:left,y:hall.bottom,w:lowerSplit-left,h:bottom-hall.bottom,row:0,column:0,
    wall:'#e6ddd0',floor:'#ddc5a8',accent:'#789387'},
  {id:'exam',name:'진료실',x:left,y:153,w:upperSplit-left,h:hall.y-153,row:0,column:1,
    wall:'#dbe4dd',floor:'#d5dad0',accent:'#78978e'},
  {id:'therapy',name:'재활실',x:upperSplit,y:141,w:right-upperSplit,h:hall.y-141,row:1,column:0,
    wall:'#ebdec9',floor:'#ddcbbb',accent:'#af9478'},
  {id:'rest',name:'회복실',x:lowerSplit,y:hall.bottom,w:right-lowerSplit,h:bottom-hall.bottom,row:1,column:1,
    wall:'#e9e0dc',floor:'#dcd2ca',accent:'#ae9193'},
];

const doors = [
  {x:160,y:hall.bottom,w:86,room:'lobby',face:true,edge:'rear',connects:'hall'},
  {x:95,y:hall.y,w:81,room:'exam',face:true,edge:'front',connects:'hall'},
  {x:548,y:hall.y,w:88,room:'therapy',face:true,edge:'front',connects:'hall'},
  {x:574,y:hall.bottom,w:80,room:'rest',face:true,edge:'rear',connects:'hall'},
];

const horizontal = (y,x,end,kind,room,edge,segment) => ({
  x,y:y-4,w:end-x,h:9,lineY:y,kind,room,edge,segment,height:HOSPITAL_WALL_HEIGHT,
});
const vertical = (x,y,end,room,side,neighbor) => ({
  x:x-4,y,w:9,h:end-y,lineX:x,kind:'side',room,side,neighbor,height:HOSPITAL_WALL_HEIGHT,
});

function roomWalls(room) {
  const door = doors.find(door=>door.room===room.id);
  const {x,y,w,h,id} = room;
  const right = x+w;
  const front = y+h;
  const shared = (side,line) => rooms.find(other=>other!==room && (side==='left'?other.x+other.w:other.x)===line
    && other.y<front && other.y+other.h>y)?.id;
  const horizontalWall = (edge,line) => edge===door.edge
    ? [horizontal(line,x,door.x,'face',id,edge,'left'),
      horizontal(line,door.x+door.w,right,'face',id,edge,'right')]
    : [horizontal(line,x,right,edge==='front'?'boundary':'face',id,edge)];
  return [...horizontalWall('rear',y),...horizontalWall('front',front),
    vertical(x,y,front,id,'left',shared('left',x)),vertical(right,y,front,id,'right',shared('right',right))];
}

const walls = [
  ...rooms.flatMap(roomWalls),
  vertical(left,hall.y,hall.bottom,'hall','left'),
  vertical(right,hall.y,hall.bottom,'hall','right'),
];

const fixture = (kind,x,y,width,depth,room,extra={}) => ({kind,x,y,width,depth,room,...extra,
  footprint:{x:x-width*.44,y:y-depth,w:width*.88,h:depth},
});

const fixtures = [
  fixture('desk',333,826,137,43,'lobby'),
  fixture('sofa',88,715,106,33,'lobby'),
  fixture('sofa',319,715,106,33,'lobby'),
  fixture('plant',377,920,36,18,'lobby'),
  fixture('plant',52,932,36,17,'lobby'),
  fixture('sink',104,229,84,23,'exam'),
  fixture('exam',174,320,111,37,'exam'),
  fixture('table',265,438,62,22,'exam'),
  fixture('plant',303,190,34,16,'exam'),
  fixture('treadmill',447,252,103,32,'therapy'),
  fixture('ramp',660,231,100,36,'therapy'),
  fixture('markers',593,344,104,43,'therapy',{passable:true}),
  fixture('plant',710,475,35,18,'therapy'),
  fixture('bed',485,731,67,25,'rest',{passable:true}),
  fixture('bed',682,853,81,29,'rest',{passable:true}),
  fixture('bed',556,912,73,28,'rest',{passable:true}),
  fixture('tree',703,769,70,32,'rest'),
  fixture('plant',714,918,38,20,'rest'),
];

const roomStations = {
  lobby:[[61,754],[119,752],[177,713],[232,738],[298,741],[365,757],[339,859],[266,786],
    [179,824],[64,804],[212,884],[279,879],[338,901],[147,927],[228,922]],
  exam:[[57,263],[105,264],[154,243],[212,239],[280,260],[298,320],[230,347],[178,360],
    [52,352],[92,399],[145,414],[187,451],[306,397],[78,463]],
  therapy:[[380,271],[438,279],[504,278],[564,256],[648,267],[721,288],[675,341],[500,327],
    [546,391],[618,405],[694,392],[649,440],[476,455],[534,465],[705,429]],
  rest:[[485,719,'bed'],[557,713],[641,711],[724,801],[687,840,'bed'],[593,807],[496,800],
    [630,880],[555,894,'bed'],[609,928],[732,879],[469,916]],
  hall:[[69,565],[143,588],[236,559],[299,599],[379,567],[469,605],[536,567],[623,590],[706,563]],
};

const stations = Object.entries(roomStations).flatMap(([room,points])=>
  points.map(([x,y,feature],index)=>({id:`${room}-${index+1}`,x,y,room,feature})),
);

export const HOSPITAL_FLOOR = Object.freeze({
  width:780,height:1000,start:{x:201,y:783},bounds:{left,right,top:141,bottom},
  rooms,hall,walls,doors,fixtures,stations,walkable:[...rooms,hall],
  solids:[...walls,...fixtures.filter(fixture=>!fixture.passable).map(fixture=>fixture.footprint)],
  playerSolids:[...walls,...fixtures.map(fixture=>fixture.footprint)],
  perches:[
    {kind:'desk',x:345,y:826,height:58,depth:827,approach:{x:337,y:859}},
    {kind:'table',x:273,y:438,height:32,depth:439,approach:{x:285,y:461}},
    {kind:'tree',x:694,y:769,height:52,depth:770,approach:{x:675,y:811}},
  ],
});
