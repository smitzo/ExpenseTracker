import test from 'node:test';import assert from 'node:assert/strict';
import {toMinor,sumMoney} from '../server/src/domain/money.js';
import {minorInput} from '../client/ui/lib/format.js';
test('decimal inputs preserve cents without floating-point drift',()=>{assert.equal(toMinor('0.29'),29);assert.equal(toMinor('10.01'),1001);assert.equal(sumMoney([toMinor('0.1'),toMinor('0.2')]),30);assert.equal(minorInput('0.29'),29);});
test('money rejects exponents, negatives, zero, excess precision and unsafe totals',()=>{for(const v of ['1e4','-1','0','1.001','Infinity','10000000000'])assert.throws(()=>toMinor(v));assert.throws(()=>sumMoney([Number.MAX_SAFE_INTEGER,1]));});
