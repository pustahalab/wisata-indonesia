// Uji KB Squad 1 dengan mesin forward-chaining yang sama seperti simulasi P11.
// Prasyarat: rules.json (hasil merge-rules.js), kb-squad1.json, scenario-1.json, scenario-2-3.json
// Jalankan: node test-inferensi.js
const RULES = require('./rules.json');
const KB = require('./kb-squad1.json');
const SCEN = { ...require('./scenario-1.json'), ...require('./scenario-2-3.json') };
const CONCL = KB.conclusions;

function forwardChain(facts) {
  const wm = new Set(facts);
  const trace = [];
  let cycle = 0, fired = true;
  while (fired && cycle < 10) {
    fired = false; cycle++;
    for (const r of RULES) {
      if (wm.has(r.then)) continue;
      if (r.if.every(c => wm.has(c))) {
        wm.add(r.then);
        trace.push({ cycle, rule: r.id, concl: r.then });
        fired = true;
      }
    }
  }
  return { wm, trace };
}

let allOk = true;
for (const [name, sc] of Object.entries(SCEN)) {
  const { wm, trace } = forwardChain(sc.facts);
  const goals = Object.keys(CONCL).filter(k => CONCL[k].goal && wm.has(k));
  const final = goals[goals.length - 1];
  const ok = final === sc.expected;
  allOk = allOk && ok;
  console.log(`\n${ok ? 'LULUS' : 'GAGAL'}  ${name}`);
  console.log('  fakta     :', sc.facts.join(', '));
  trace.forEach(t => console.log(`  Siklus ${t.cycle} · ${t.rule} -> ${CONCL[t.concl].label}`));
  console.log('  kandidat  :', goals.map(g => CONCL[g].label).join(' | '));
  console.log('  KEPUTUSAN :', final ? CONCL[final].label : '(tidak ada)');
}

const known = new Set([...KB.facts.flatMap(g => g.items.map(i => i.id)), ...Object.keys(CONCL)]);
RULES.forEach(r => [...r.if, r.then].forEach(f => { if (!known.has(f)) { console.log('FAKTA TIDAK DIKENAL:', r.id, f); allOk = false; } }));
console.log('\n' + (allOk ? 'SEMUA SKENARIO & VALIDASI LULUS' : 'ADA YANG GAGAL'));
process.exit(allOk ? 0 : 1);
