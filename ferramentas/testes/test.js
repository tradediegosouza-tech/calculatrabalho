const C = require(process.argv[2]);
let ok = 0, fail = 0;
const eq = (name, got, exp) => { if (Math.abs(got - exp) < 0.011) ok++; else { fail++; console.log('FALHA', name, 'got', got, 'exp', exp); } };
// INSS: 3000 -> 1621*7.5% + (2902.84-1621)*9% + (3000-2902.84)*12%
eq('inss 3000', C.inss(3000), Math.round((121.575 + 115.3656 + 11.6592) * 100) / 100);
eq('inss teto', C.inss(20000), Math.round((121.575 + 1281.84*0.09 + 1451.43*0.12 + 4121.28*0.14) * 100) / 100);
eq('inss 1000', C.inss(1000), 75);
// IR: exemplo oficial gov.br 5250 -> base 4642.80, imp 369.14, redutor 978.62-0.133145*5250=279.61 -> 89.53
eq('ir 5250 simplificado', C.irrf(5250, 0), 369.14 - (978.62 - 0.133145 * 5250));
eq('ir 5000 zera', C.irrf(5000, 0), 0);
eq('ir 2000', C.irrf(2000, 150), 0);
eq('ir 10000 sem redutor', C.irrf(10000, 988.09), (10000 - 988.09) * 0.275 - 908.73);
// Caso A: sem justa causa, aviso indenizado, sal 3000, adm 2023-03-10, saída 2026-11-20
let r = C.calcular({ salario: 3000, admissao: '2023-03-10', saida: '2026-11-20', motivo: 'semJusta', aviso: 'indenizado', feriasVencidas: 0, saldoFgts: 10000 });
eq('A anos', r.info.anos, 3); eq('A aviso dias', r.info.diasAvisoCheio, 39);
eq('A saldo', r.verbas.saldoSalario, 2000); eq('A aviso', r.verbas.avisoIndenizado, 3900);
// projeção: 2026-11-20 + 39 = 2026-12-29 -> 12 meses de 13º
eq('A meses13', r.info.meses13, 12); eq('A 13', r.verbas.decimoTerceiro, 3000);
// férias: período desde 2026-03-10 até 2026-12-29 -> 9 meses cheios (até 12-09) + resto 20 dias -> 10
eq('A mesesFerias', r.info.mesesFerias, 10); eq('A ferias', r.verbas.feriasProporcionais, 2500);
eq('A terco', r.verbas.tercoFerias, 833.33); eq('A multa', r.fgts.multa, 4000); eq('A saque', r.fgts.saque, 10000);
// Caso B: pedido de demissão, não cumpriu aviso
r = C.calcular({ salario: 2000, admissao: '2025-06-01', saida: '2026-11-10', motivo: 'pedido', aviso: 'naoCumprido', feriasVencidas: 0, saldoFgts: 3000 });
eq('B saldo', r.verbas.saldoSalario, 666.67); eq('B desc aviso', r.descontos.avisoNaoCumprido, 2000);
eq('B meses13', r.info.meses13, 10); eq('B multa', r.fgts.multa, 0); eq('B saque', r.fgts.saque, 0);
// férias: período desde 2026-06-01 até 2026-11-10 -> 5 meses + 10 dias -> 5
eq('B mesesFerias', r.info.mesesFerias, 5);
// Caso C: justa causa com 1 férias vencida
r = C.calcular({ salario: 2400, admissao: '2022-01-01', saida: '2026-05-15', motivo: 'justaCausa', aviso: 'dispensado', feriasVencidas: 1, saldoFgts: 5000 });
eq('C 13', r.verbas.decimoTerceiro, 0); eq('C fprop', r.verbas.feriasProporcionais, 0);
eq('C venc', r.verbas.feriasVencidas, 2400); eq('C terco', r.verbas.tercoFerias, 800); eq('C saque', r.fgts.saque, 0);
// Caso D: acordo, aviso indenizado metade, sal 4000, 5 anos
r = C.calcular({ salario: 4000, admissao: '2021-02-01', saida: '2026-08-31', motivo: 'acordo', aviso: 'indenizado', feriasVencidas: 0, saldoFgts: 20000 });
eq('D aviso cheio', r.info.diasAvisoCheio, 45); eq('D aviso ind', r.info.diasAvisoIndenizado, 23);
eq('D aviso valor', r.verbas.avisoIndenizado, Math.round(4000/30*23*100)/100);
eq('D multa', r.fgts.multa, 4000); eq('D saque', r.fgts.saque, 16000);
// Caso E: aviso máximo 90 dias (25 anos)
r = C.calcular({ salario: 5000, admissao: '2000-01-01', saida: '2026-06-30', motivo: 'semJusta', aviso: 'trabalhado', feriasVencidas: 0, saldoFgts: 1 });
eq('E aviso cheio', r.info.diasAvisoCheio, 90); eq('E aviso ind (trabalhado)', r.verbas.avisoIndenizado, 0);
eq('E saldo dia 30', r.verbas.saldoSalario, 5000);
// Caso F: experiência 90 dias
r = C.calcular({ salario: 1800, admissao: '2026-07-01', saida: '2026-09-28', motivo: 'experiencia', aviso: 'dispensado', feriasVencidas: 0, saldoFgts: 0 });
eq('F meses13', r.info.meses13, 3); eq('F mesesFerias', r.info.mesesFerias, 3); eq('F multa', r.fgts.multa, 0);
console.log('fgts estimado F', r.fgts.estimado, r.fgts.saldo);
// erro de datas
try { C.calcular({ salario: 1000, admissao: '2026-05-01', saida: '2026-01-01', motivo: 'pedido' }); fail++; } catch (e) { ok++; }
console.log(`OK ${ok} · FALHAS ${fail}`);
// ===== Rodada 2: cenários de regra (valores calculados à mão, independentes do código) =====
let ok2=0, f2=0; const eq2=(n,g,e)=>{ if(Math.abs(g-e)<0.011) ok2++; else { f2++; console.log('FALHA2',n,'got',g,'exp',e);} };
// G: admitido e demitido no mesmo mês (dia 10 a 25 = 16 dias) — FURO corrigido
r=C.calcular({salario:3000,admissao:'2026-03-10',saida:'2026-03-25',motivo:'semJusta',aviso:'trabalhado',feriasVencidas:0,saldoFgts:0});
eq2('G dias mes',r.info.diasMes,16); eq2('G saldo',r.verbas.saldoSalario,1600);
// H: saída no último dia de fevereiro = mês cheio (30)
r=C.calcular({salario:3000,admissao:'2024-01-10',saida:'2026-02-28',motivo:'pedido',aviso:'trabalhado',feriasVencidas:0,saldoFgts:0});
eq2('H fev mes cheio',r.info.diasMes,30); eq2('H saldo',r.verbas.saldoSalario,3000);
// H2: saída dia 31 = 30 dias
r=C.calcular({salario:3100,admissao:'2024-01-10',saida:'2026-03-31',motivo:'pedido',aviso:'trabalhado',feriasVencidas:0,saldoFgts:0});
eq2('H2 dia 31',r.verbas.saldoSalario,3100);
// I: 13º — mês com menos de 15 dias não conta. Saída 2026-05-10, adm 2025 -> jan..abr = 4 (maio só 10 dias)
r=C.calcular({salario:1200,admissao:'2025-01-01',saida:'2026-05-10',motivo:'pedido',aviso:'trabalhado',feriasVencidas:0,saldoFgts:0});
eq2('I meses13',r.info.meses13,4); eq2('I 13',r.verbas.decimoTerceiro,400);
// J: 13º com exatamente 15 dias conta. Saída 2026-05-15 -> 5
r=C.calcular({salario:1200,admissao:'2025-01-01',saida:'2026-05-15',motivo:'pedido',aviso:'trabalhado',feriasVencidas:0,saldoFgts:0});
eq2('J meses13',r.info.meses13,5);
// K: admissão no meio do ano: adm 2026-08-20, saída 2026-12-10 (sem aviso): ago 12 dias(não), set,out,nov(3), dez 10 (não) = 3
r=C.calcular({salario:2400,admissao:'2026-08-20',saida:'2026-12-10',motivo:'pedido',aviso:'trabalhado',feriasVencidas:0,saldoFgts:0});
eq2('K meses13',r.info.meses13,3);
// L: 2 férias vencidas: 2 × (sal + 1/3)
r=C.calcular({salario:3000,admissao:'2020-01-01',saida:'2026-06-30',motivo:'pedido',aviso:'trabalhado',feriasVencidas:2,saldoFgts:0});
eq2('L venc',r.verbas.feriasVencidas,6000);
// M: salário acima do teto: INSS do saldo limitado ao teto. Teto 2026: 121,575+115,3656+174,1716+576,9792 = 988,09
eq2('M inss teto', C.inss(15000), 988.09);
// N: IR na faixa do redutor parcial: saldo de 6000 com INSS
const inss6000=C.inss(6000); // 121,575+115,3656+174,1716+229,9622=641,07
eq2('N inss 6000',inss6000,641.51);
// base = 6000-641,07=5358,93 -> 27,5% -> 1473,71-908,73=564,98; redutor=978,62-798,87=179,75 -> 385,23
eq2('N ir 6000',C.irrf(6000,inss6000),385.10);
// O: sem justa causa com aviso TRABALHADO: não paga aviso e não projeta
r=C.calcular({salario:2000,admissao:'2025-02-01',saida:'2026-11-30',motivo:'semJusta',aviso:'trabalhado',feriasVencidas:0,saldoFgts:4000});
eq2('O aviso',r.verbas.avisoIndenizado,0); eq2('O meses13',r.info.meses13,11); eq2('O multa',r.fgts.multa,1600);
// P: justa causa sem férias vencidas -> só saldo
r=C.calcular({salario:2000,admissao:'2025-02-01',saida:'2026-11-15',motivo:'justaCausa',aviso:'dispensado',feriasVencidas:0,saldoFgts:4000});
eq2('P bruto',r.bruto,1000); eq2('P multa',r.fgts.multa,0);
console.log(`RODADA 2 · OK ${ok2} · FALHAS ${f2}`);
// Rodada 3: rescisão indireta = mesmas verbas da sem justa causa
let a=C.calcular({salario:3000,admissao:'2023-03-10',saida:'2026-11-20',motivo:'indireta',aviso:'indenizado',feriasVencidas:0,saldoFgts:10000});
let b=C.calcular({salario:3000,admissao:'2023-03-10',saida:'2026-11-20',motivo:'semJusta',aviso:'indenizado',feriasVencidas:0,saldoFgts:10000});
console.log('RODADA 3 indireta = semJusta:', a.liquido===b.liquido && a.fgts.multa===b.fgts.multa && a.seguroDesemprego===true ? 'OK' : 'FALHA', a.liquido);
