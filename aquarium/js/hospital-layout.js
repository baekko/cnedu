export const HOSPITAL_VIEW = Object.freeze({width:390,height:500,top:170});

// X and Y refer to foot positions on the floor, with facing walls at each room's far edge.
const rooms = [
  {id:'lobby',name:'접수·대기실',x:24,y:616,w:395,h:333,row:0,column:0,wall:'#e6ddd0',floor:'#ddc5a8',accent:'#789387'},
  {id:'exam',name:'진료실',x:35,y:157,w:280,h:315,row:0,column:1,wall:'#dbe4dd',floor:'#d5dad0',accent:'#78978e'},
  {id:'therapy',name:'재활실',x:432,y:142,w:320,h:379,row:1,column:0,wall:'#ebdec9',floor:'#ddcbbb',accent:'#af9478'},
  {id:'rest',name:'회복실',x:493,y:667,w:260,h:282,row:1,column:1,wall:'#e9e0dc',floor:'#dcd2ca',accent:'#ae9193'},
];

const horizontal = (y,left,right,kind,room) => ({x:left,y:y-7,w:right-left,h:8,kind,room});
const vertical = (x,top,bottom,kind,room) => ({x:x-5,y:top,w:9,h:bottom-top,kind,room});

const walls = [
  horizontal(142,24,432,'edge'), horizontal(142,432,753,'face','therapy'),
  horizontal(157,35,315,'face','exam'),
  vertical(28,142,949,'side'), vertical(751,142,949,'side'), horizontal(950,24,753,'rim'),
  vertical(315,157,302,'side','exam'), vertical(315,389,471,'side','exam'),
  horizontal(472,35,95,'rim','exam'), horizontal(472,176,315,'rim','exam'),
  vertical(432,142,255,'side','therapy'), vertical(432,337,521,'side','therapy'),
  horizontal(521,432,548,'rim','therapy'), horizontal(521,636,752,'rim','therapy'),
  horizontal(616,24,160,'face','lobby'), horizontal(616,246,419,'face','lobby'),
  vertical(419,616,744,'side','lobby'), vertical(419,831,949,'side','lobby'),
  horizontal(667,493,574,'face','rest'), horizontal(667,654,753,'face','rest'),
  vertical(493,667,795,'side','rest'), vertical(493,875,949,'side','rest'),
];

const doors = [
  {x:160,y:616,w:86,room:'lobby',face:true}, {x:574,y:667,w:80,room:'rest',face:true},
  {x:95,y:472,w:81,room:'exam'}, {x:548,y:521,w:88,room:'therapy'},
  {x:315,y:302,h:87,room:'exam'}, {x:432,y:255,h:82,room:'therapy'},
  {x:419,y:744,h:87,room:'lobby'}, {x:493,y:795,h:80,room:'rest'},
];

const fixture = (kind,x,y,width,depth,room,extra={}) => ({kind,x,y,width,depth,room,...extra,
  footprint:{x:x-width*.38,y:y-depth,w:width*.76,h:depth},
});

const fixtures = [
  fixture('desk', 319, 688, 137, 43, 'lobby'),
  fixture('sofa', 80, 696, 102, 33, 'lobby'),
  fixture('sofa', 95, 880, 106, 33, 'lobby'),
  fixture('plant', 380, 932, 36, 18, 'lobby'),
  fixture('plant', 62, 928, 36, 17, 'lobby'),
  fixture('sink', 104, 229, 84, 23, 'exam'),
  fixture('exam', 174, 320, 111, 37, 'exam'),
  fixture('table', 250, 438, 62, 22, 'exam'),
  fixture('treadmill', 507, 259, 103, 32, 'therapy'),
  fixture('ramp', 667, 229, 100, 36, 'therapy'),
  fixture('markers', 593, 344, 104, 43, 'therapy',{passable:true}),
  fixture('plant', 704, 483, 35, 18, 'therapy'),
  fixture('bed', 535, 741, 67, 25, 'rest',{passable:true}),
  fixture('bed', 682, 854, 81, 29, 'rest',{passable:true}),
  fixture('bed', 556, 912, 73, 28, 'rest',{passable:true}),
  fixture('tree', 703, 769, 70, 32, 'rest'),
  fixture('plant', 714, 918, 38, 20, 'rest'),
  fixture('plant', 372, 213, 34, 16, 'hall'),
  fixture('plant', 71, 551, 36, 17, 'hall'),
];

const roomStations = {
  lobby:[[61,744],[119,742],[177,705],[234,712],[298,726],[366,750],[343,798],[276,786],
    [179,824],[68,817],[212,884],[279,881],[338,901],[147,930],[232,927]],
  exam:[[57,260],[105,262],[160,250],[212,257],[278,266],[290,319],[230,346],[179,359],
    [52,352],[92,398],[145,405],[188,441],[288,405],[79,422]],
  therapy:[[459,280],[497,286],[545,271],[608,252],[676,274],[731,299],[679,342],[500,331],
    [546,386],[618,405],[697,388],[648,440],[491,455],[568,471],[712,449]],
  rest:[[535,729,'bed'],[589,730],[646,737],[726,799],[687,840,'bed'],[595,807],[539,802],
    [634,878],[555,894,'bed'],[610,933],[741,881],[523,921]],
  hall:[[370,270],[360,323],[384,397],[369,467],[119,531],[212,529],[287,558],
    [402,548],[486,558],[558,581],[632,567],[703,571],[460,709],[454,839]],
};

function stationPoints() {
  return Object.entries(roomStations).flatMap(([room,points])=>
    points.map(([x,y,feature],index)=>({id:`${room}-${index+1}`,x,y,room,feature})),
  );
}

export const HOSPITAL_FLOOR = Object.freeze({
  width:780,height:1000,start:{x:201,y:783},bounds:{left:33,right:746,top:143,bottom:949},
  rooms,walls,doors,fixtures,stations:stationPoints(),
  solids:[...walls,...fixtures.filter(f=>!f.passable).map(f=>f.footprint)],
  perches:[
    {kind:'desk',x:345,y:688,height:58,depth:689,approach:{x:337,y:721}},
    {kind:'table',x:258,y:438,height:32,depth:439,approach:{x:273,y:457}},
    {kind:'tree',x:694,y:769,height:52,depth:770,approach:{x:675,y:810}},
  ],
});
