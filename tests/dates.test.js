import test from 'node:test';import assert from 'node:assert/strict';
import {daySchema,nextDue,monthDays,shiftMonth} from '../server/src/domain/dates.js';
import {monthlySummary} from '../server/src/planning/summary.js';
import {projectRecurring} from '../server/src/planning/projection.js';
test('calendar validates leap days and rejects rollover dates',()=>{assert.equal(daySchema.parse('2024-02-29'),'2024-02-29');for(const d of ['2025-02-29','2026-04-31','2026-13-01','1999-12-31'])assert.throws(()=>daySchema.parse(d));assert.equal(monthDays('2024-02'),29);});
test('month and recurring arithmetic cross years and clamp short months',()=>{assert.equal(shiftMonth('2026-01',-1),'2025-12');assert.equal(nextDue('2026-01-31','monthly'),'2026-02-28');assert.equal(nextDue('2024-02-29','yearly'),'2025-02-28');assert.equal(nextDue('2026-12-28','weekly'),'2027-01-04');});
test('monthly summaries never combine the same month across different years',()=>{const rows=[{date:'2025-10-01',kind:'expense',amount:100},{date:'2026-10-01',kind:'expense',amount:200}];assert.equal(monthlySummary(rows,'2026-10').expenses,200);});
test('projection respects active state and requested window',()=>{const r=projectRecurring([{id:'x',name:'Plan',amount:100,frequency:'monthly',nextDate:'2026-01-01',active:true},{id:'y',name:'Paused',amount:500,frequency:'weekly',nextDate:'2026-01-01',active:false}],'2026-03-01','2026-04-30');assert.deepEqual(r.map(x=>x.date),['2026-03-01','2026-04-01']);});
