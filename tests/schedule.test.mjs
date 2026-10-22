import {test} from 'node:test';
import assert from 'node:assert/strict';
import {weekDays,suggestedDays,dateKey,blankState} from '../public/data.js';
test('schedule produces unique dates for whole weeks and bounded availability',()=>{for(const offset of [-52,-1,0,1,52]){const days=weekDays(offset);assert.equal(new Set(days.map(d=>d.key)).size,7);assert.equal(new Date(days[0].key+'T12:00:00').getDay(),1);assert.equal(new Date(days[6].key+'T12:00:00').getDay(),0);}for(const f of [3,4,5,6]){const days=suggestedDays(f);assert.equal(days.length,f);assert.equal(new Set(days).size,f);assert.ok(days.every(d=>d>=0&&d<7));}assert.equal(dateKey(new Date(2026,0,2,23,59)),'2026-01-02');});
test('each member starts with independent empty records',()=>{const a=blankState(),b=blankState();a.completed.push({id:'test'});assert.equal(b.completed.length,0);assert.equal(b.meals.length,0);assert.equal(b.profile.waterGoal,0);});
