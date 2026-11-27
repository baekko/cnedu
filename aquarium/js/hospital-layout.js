export const HOSPITAL_VIEW = Object.freeze({width: 390, height: 500, top: 170});

// Coordinates are floor-plane units. Wall art rises above these footprints.
const rooms = [
  {id:'lobby',name:'접수·대기실',x:20,y:54,w:328,h:359,wall:'#d8e6df',floor:'#e9e2cd',accent:'#5c9086'},
  {id:'exam',name:'진료실',x:432,y:54,w:328,h:359,wall:'#d4e6eb',floor:'#dce9e6',accent:'#568594'},
  {id:'therapy',name:'재활실',x:20,y:574,w:328,h:372,wall:'#efe1ce',floor:'#ece3cf',accent:'#ab785f'},
  {id:'rest',name:'회복실',x:432,y:574,w:328,h:372,wall:'#e7dfea',floor:'#e9e1e8',accent:'#8d7896'},
];

const walls = [
  {x:20,y:53,w:740,h:9,type:'back'},
  {x:20,y:53,w:13,h:897,type:'edge'},
  {x:747,y:53,w:13,h:897,type:'edge'},
  {x:20,y:946,w:740,h:10,type:'south'},
  {x:336,y:62,w:12,h:137,type:'partition'}, {x:336,y:281,w:12,h:132,type:'partition'},
  {x:432,y:62,w:12,h:137,type:'partition'}, {x:432,y:281,w:12,h:132,type:'partition'},
  {x:336,y:574,w:12,h:135,type:'partition'}, {x:336,y:791,w:12,h:155,type:'partition'},
  {x:432,y:574,w:12,h:135,type:'partition'}, {x:432,y:791,w:12,h:155,type:'partition'},
  {x:32,y:410,w:106,h:10,type:'front'}, {x:225,y:410,w:122,h:10,type:'front'},
  {x:432,y:410,w:116,h:10,type:'front'}, {x:635,y:410,w:113,h:10,type:'front'},
  {x:32,y:522,w:106,h:56,type:'interior'}, {x:225,y:522,w:122,h:56,type:'interior'},
  {x:432,y:522,w:116,h:56,type:'interior'}, {x:635,y:522,w:113,h:56,type:'interior'},
];

const fixture = (kind, x, y, width, depth, room, extra={}) => ({
  kind,x,y,width,depth,room,...extra,
  footprint: {x:x-width*.40,y:y-depth,w:width*.80,h:depth},
});
const fixtures = [
  fixture('desk', 229, 133, 142, 40, 'lobby'),
  fixture('sofa', 90, 151, 95, 30, 'lobby'),
  fixture('table', 112, 308, 57, 23, 'lobby'),
  fixture('plant', 303, 396, 38, 18, 'lobby'),
  fixture('exam', 586, 239, 114, 41, 'exam'),
  fixture('cabinet', 533, 127, 101, 26, 'exam'),
  fixture('sink', 683, 132, 90, 26, 'exam'),
  fixture('plant', 710, 386, 32, 17, 'exam'),
  fixture('treadmill', 101, 670, 112, 35, 'therapy'),
  fixture('ramp', 255, 678, 109, 38, 'therapy'),
  fixture('markers', 177, 823, 110, 40, 'therapy', {passable:true}),
  fixture('plant', 81, 905, 40, 18, 'therapy'),
  fixture('sofa', 303, 941, 79, 27, 'therapy'),
  fixture('tree', 694, 675, 76, 32, 'rest'),
  fixture('bed', 516, 684, 71, 24, 'rest', {passable:true}),
  fixture('bed', 523, 898, 82, 29, 'rest', {passable:true}),
  fixture('bed', 689, 875, 72, 29, 'rest', {passable:true}),
  fixture('table', 602, 763, 64, 23, 'rest'),
  fixture('plant', 701, 934, 37, 17, 'rest'),
  fixture('plant', 50, 504, 30, 16, 'hall'),
  fixture('plant', 729, 504, 30, 16, 'hall'),
];

const roomStations = {
  lobby:[[58,197],[110,222],[158,178],[221,185],[290,183],[287,239],[228,267],[173,267],
    [68,305],[51,363],[116,373],[182,367],[248,359]],
  exam:[[475,136],[465,202],[484,260],[534,170],[603,171],[680,185],[713,232],[633,274],
    [567,295],[482,323],[535,376],[596,374],[659,351],[718,322]],
  therapy:[[54,726],[105,748],[157,715],[202,754],[268,731],[292,782],[247,821],[191,846],
    [105,816],[53,857],[130,894],[200,906],[252,886],[311,846]],
  rest:[[475,633],[521,671,'bed'],[582,674],[649,644],[688,690,'tree'],[725,734],[641,729],
    [566,742],[481,770],[527,826],[590,834],[650,810],[702,849],[687,864,'bed'],[606,903],[523,884,'bed']],
  hall:[[77,469],[219,476],[299,498],[482,474],[555,519],[688,473],[382,339],[382,649]],
};

const stations = Object.entries(roomStations).flatMap(([room, points]) =>
  points.map(([x,y,feature],index) => ({id:`${room}-${index+1}`,x,y,room,feature})),
);

export const HOSPITAL_FLOOR = Object.freeze({
  width:780,height:1000,start:{x:390,y:479},
  rooms,walls,fixtures,stations,
  solids:[...walls,...fixtures.filter(f=>!f.passable).map(f=>f.footprint)],
  perches:[
    {x:90,y:151,height:19,depth:152,approach:{x:111,y:181}},
    {x:685,y:675,height:58,depth:676,approach:{x:670,y:710}},
  ],
});
