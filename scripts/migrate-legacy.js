import { createHash } from 'node:crypto';
import { database, collection, disconnect } from '../server/src/db/connection.js';
import { createIndexes } from '../server/src/db/indexes.js';
import { toMinor } from '../server/src/domain/money.js';
import { transactionSchema } from '../server/src/domain/ledger.js';
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error('MONGODB_URI is required');
const id = value => { const b = createHash('sha256').update('penny-legacy:' + value).digest().subarray(0,16); b[6] = (b[6]&15)|64; b[8] = (b[8]&63)|128; const h=b.toString('hex'); return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`; };
try {
 const db=await database(uri);const legacyUsers=await db.collection('users').find({}).limit(10001).toArray();const transactions=await db.collection('transactions').find({}).limit(100001).toArray();
 if(legacyUsers.length>10000||transactions.length>100000)throw new Error('Migration size exceeds reviewed limit');
 const docs={users:[],categories:[],ledger:[]};const owners=new Set();const emails=new Set();const categoryMap=new Map();
 for(const u of legacyUsers){const email=String(u.email||'').trim().toLowerCase();if(!email.includes('@')||emails.has(email)||!/^\$2/.test(u.password||''))throw new Error('Legacy user validation failed; inspect source securely');emails.add(email);const ownerId=id(u._id);owners.add(String(u._id));docs.users.push({_id:ownerId,email,name:[u.firstName,u.lastName].filter(Boolean).join(' ').slice(0,80)||'Account',passwordHash:u.password,preferences:{currency:'INR',monthlyTarget:0,weekStartsOn:'monday'},createdAt:u.createdAt||new Date()});for(const c of u.categories||[]){const categoryId=id(c._id);categoryMap.set(String(u._id)+':'+String(c._id),categoryId);docs.categories.push({_id:categoryId,ownerId,name:String(c.label||'Other').slice(0,40),color:'green',archived:false,createdAt:new Date()});}}
 for(const t of transactions){if(!owners.has(String(t.user_id)))throw new Error('Orphan transaction in legacy data');const fields=transactionSchema.parse({amount:toMinor(t.amount),description:String(t.description||'Imported entry').slice(0,160),date:new Date(t.date).toISOString().slice(0,10),kind:'expense',categoryId:categoryMap.get(String(t.user_id)+':'+String(t.category_id))||null,note:''});docs.ledger.push({_id:id(t._id),ownerId:id(t.user_id),...fields,version:1,archived:false,createdAt:t.createdAt||new Date(),updatedAt:new Date()});}
 console.info(JSON.stringify({mode:process.argv.includes('--apply')?'apply':'dry-run',counts:Object.fromEntries(Object.entries(docs).map(([k,v])=>[k,v.length])),currency:'INR',legacyAmounts:'positive expenses'}));
 if(process.argv.includes('--apply')){if(process.env.LEGACY_CURRENCY!=='INR')throw new Error('Confirm LEGACY_CURRENCY=INR only after reviewing source currency');await createIndexes(db);for(const [name,rows]of Object.entries(docs))if(rows.length)await collection(db,name).bulkWrite(rows.map(doc=>({updateOne:{filter:{_id:doc._id},update:{$setOnInsert:doc},upsert:true}})));}
}finally{await disconnect();}
