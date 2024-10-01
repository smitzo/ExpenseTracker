export async function readiness(req, res) { await req.db.command({ ping: 1 }); res.json({ status: 'ready', database: 'connected' }); }
