import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';

const html=fs.readFileSync('public/app.html','utf8');
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
const script=scripts.at(-1)?.[1];
assert(script,'inline script missing');
new Function(script);
for(const helper of ['field','select','owners']) assert.match(script,new RegExp(`const ${helper}=`),`${helper} helper missing`);
assert.match(html,/\.empty>\.icon\{/,'empty-state icon selector must not resize the button icon');
assert.doesNotMatch(script,/prices:\['Где дешевле\?'/,'price comparison must not be a sidebar page');
assert.match(script,/data-action="shopping-mode"/,'shopping mode switch is missing');
assert.match(html,/@keyframes view-enter/,'page transition is missing');
assert.match(html,/@keyframes dialog-in/,'dialog transition is missing');
assert.match(html,/prefers-reduced-motion:reduce[^}]*\{[^}]*animation:none!important/,'reduced-motion override is missing');
assert.match(script,/const motionAllowed=/,'motion preference helper is missing');
assert.match(script,/classList\.add\('item-leave'\)/,'delete transition is missing');
assert.match(script,/render\(true\)/,'animated view rendering is missing');

const pick=(name,next)=>script.slice(script.indexOf(`  ${name}`),script.indexOf(`  ${next}`,script.indexOf(`  ${name}`)));
const code=pick("const UNIT_META=","function renderPrices");
const validateStart=script.indexOf('  function validateState(');
const validateEnd=script.indexOf('  async function importData',validateStart);
const context={structuredClone,URL,emptyState:()=>({version:1,names:['',''],wishes:[],shopping:[],tasks:[],movies:[],stores:[],products:[]}),safeUrl:value=>{try{return ['http:','https:'].includes(new URL(value).protocol)}catch{return false}}};
vm.createContext(context);
vm.runInContext(code+"const units=['шт.','г','кг','мл','л','уп.'],DATA_UNITS=units,DATA_UNIT_KIND={'шт.':'count','уп.':'pack','г':'weight','кг':'weight','мл':'volume','л':'volume'};"+script.slice(validateStart,validateEnd)+';globalThis.calculatePlan=calculatePlan;globalThis.validateState=validateState;',context);
const sampleStart=script.indexOf('  const sampleState=');
const sampleEnd=script.indexOf('  let state=',sampleStart);
vm.runInContext(script.slice(sampleStart,sampleEnd)+';globalThis.sampleState=sampleState;',context);
assert.doesNotThrow(()=>context.validateState(context.sampleState()));

const stores=[{id:'a',name:'A'},{id:'b',name:'B'}];
const milk={id:'milk',title:'Молоко',qty:1,unit:'л',prices:{a:{price:100,size:1,unit:'л'},b:{price:40,size:500,unit:'мл'}}};
const plan=context.calculatePlan({stores,products:[milk]});
assert.equal(plan.groups[0].store.id,'b');
assert.equal(plan.groups[0].items[0].unitPrice,80);
assert.equal(plan.total,80);

const base={version:1,names:['Я','Ты'],wishes:[],shopping:[],tasks:[],stores,products:[{...milk,prices:{a:100}}],movies:[{id:'m',title:'Фильм',done:true,contentType:'film',genre:'Драма',watchedDate:'',ratingMe:9,ratingPartner:8}]};
const migrated=context.validateState(base);
assert.deepEqual(JSON.parse(JSON.stringify(migrated.products[0].prices.a)),{price:100,size:1,unit:'л'});
assert.equal(migrated.movies[0].ratingMe,9);
assert.throws(()=>context.validateState({...base,movies:[{...base.movies[0],ratingMe:11}]}));

const legacyShopping=context.validateState({...base,products:[],shopping:[{id:'buy',title:'Сок',done:false,qty:2,unit:'л',price:90,store:'Магазин',category:'Продукты'}]});
assert.equal(legacyShopping.shopping[0].qty,1);
assert.equal(legacyShopping.shopping[0].unit,'шт.');
assert.equal(legacyShopping.shopping[0].price,180);

const draft=context.validateState({...base,products:[{...milk,prices:{a:{price:'',size:900,unit:'мл'}}}]});
assert.equal(draft.products[0].prices.a.price,'');
assert.equal(draft.products[0].prices.a.size,900);

const transferred=context.sampleState();
let transferIndex=0;
for(const group of context.calculatePlan(transferred).groups) for(const item of group.items) transferred.shopping.push({id:`transfer${++transferIndex}`,title:item.product.title,qty:1,unit:'шт.',price:item.total,store:group.store.name,category:'Продукты',done:false,sample:false,sourceProduct:item.product.id});
assert.doesNotThrow(()=>context.validateState(transferred));
console.log('app verification passed');

