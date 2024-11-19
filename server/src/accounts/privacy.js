import { z } from 'zod';
import { collection } from '../db/connection.js';
import { safeUser } from '../db/users.js';
import { verifyPassword } from '../security/passwords.js';
import { ensure } from '../domain/errors.js';
import { clearSession } from '../security/cookies.js';
export async function exportAccount(req,res){const data={user:safeUser(req.user)};for(const name of ['ledger','categories','budgets','recurring'])data[name]=await collection(req.db,name).find({ownerId:req.user._id},{projection:{ownerId:0}}).limit(100001).toArray();res.set('Content-Disposition','attachment; filename="penny-account.json"').json(data);}
export const deleteAccount=config=>async(req,res)=>{const {password}=z.strictObject({password:z.string().min(1).max(128)}).parse(req.body);ensure(await verifyPassword(password,req.user.passwordHash),401,'CREDENTIALS','Your password is incorrect.');for(const name of ['sessions','ledger','categories','budgets','recurring','batches','audit'])await collection(req.db,name).deleteMany({ownerId:req.user._id});await collection(req.db,'users').deleteOne({_id:req.user._id});clearSession(res,config);res.status(204).end();};
