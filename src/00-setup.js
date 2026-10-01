(()=>{
const LIMB={sets:new Map(),chars:new Set(),m4:new THREE.Matrix4(),offs:new Map(),MAX:360};   // batched arms & legs (see limbsTick)

const KEY='tiny-fresh-market-v2',KEY1='tiny-fresh-market-v1';
const WING_GOODS=['soda','cookies','noodles','chocolate','tissue','shampoo','icecream','canned'];
const F2_GOODS=['tshirt','book','ball','umbrella','teddy','headphones'];
const SELL=['tomato','egg','milk','carrot','jam','bread','cheese','juice',...WING_GOODS,...F2_GOODS];
const F2X=55;const floorOf=x=>x>F2X?2:1;const floorY=x=>x>F2X?6:0;
const ITEM={tomato:{e:'🍅',price:4},egg:{e:'🥚',price:7},milk:{e:'🥛',price:11},wheat:{e:'🌾'},apple:{e:'🍏'},strawberry:{e:'🍓'},
  carrot:{e:'🥕',price:6},jam:{e:'🍯',price:18},bread:{e:'🍞',price:16},cheese:{e:'🧀',price:22},juice:{e:'🧃',price:19},
  soda:{e:'🥤',price:9},cookies:{e:'🍪',price:10},noodles:{e:'🍜',price:12},chocolate:{e:'🍫',price:14},
  tissue:{e:'🧻',price:13},shampoo:{e:'🧴',price:20},icecream:{e:'🍦',price:18},canned:{e:'🥫',price:15},
  tshirt:{e:'👕',price:28},book:{e:'📚',price:22},ball:{e:'⚽',price:24},umbrella:{e:'🌂',price:26},teddy:{e:'🧸',price:35},headphones:{e:'🎧',price:45},
  burger:{e:'🍔',price:30},soup:{e:'🍲',price:34},drink:{e:'🍹',price:26},
  hongbao:{e:'🧧',price:40},candybox:{e:'🍬',price:32},mooncake:{e:'🥮',price:38},oillamp:{e:'🪔',price:30},gift:{e:'🎁',price:45},
  corn:{e:'🌽',price:24},shrimp:{e:'🦐',price:34},cocoa:{e:'☕',price:30},dango:{e:'🍡',price:32}};
const FESTS=[{k:'cny',n:'春节',e:'🧧',item:'hongbao',c1:0xe53935,c2:0xffc107},{k:'raya',n:'开斋节',e:'🌙',item:'candybox',c1:0x2ec27e,c2:0xffd54f},{k:'moon',n:'中秋节',e:'🥮',item:'mooncake',c1:0xff8f00,c2:0xfff176},{k:'diwali',n:'屠妖节',e:'🪔',item:'oillamp',c1:0xff6d00,c2:0xab47bc},{k:'xmas',n:'圣诞节',e:'🎄',item:'gift',c1:0x2e7d32,c2:0xe53935}];
const FEST_ITEMS=FESTS.map(f=>f.item);
/* each town (branch theme) has its own specialty, sold at an outdoor stall west of the shop */
const SIG_ITEMS=['corn','shrimp','cocoa','dango'];
