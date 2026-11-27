const S = require(process.argv[2]);
let ok = 0, fail = 0;
const eq = (n, g, e) => { if ((typeof e === 'number' ? Math.abs(g - e) < 0.005 : g === e)) ok++; else { fail++; console.log('FALHA', n, 'got', g, 'exp', e); } };
// Faixas oficiais MTE 2026 (gov.br, 12/01/2026)
eq('piso 1621', S.valorParcela(1621), 1621);
eq('2000 -> piso', S.valorParcela(2000), 1621);
eq('2026.25 -> 80% = 1621', S.valorParcela(2026.25), 1621);
eq('2222.17', S.valorParcela(2222.17), 1777.74);
eq('2500', S.valorParcela(2500), 1916.66);
eq('3000', S.valorParcela(3000), 2166.66);
eq('3500', S.valorParcela(3500), 2416.66);
eq('3703.99 teto', S.valorParcela(3703.99), 2518.65);
eq('3704', S.valorParcela(3704), 2518.65);
eq('15000 teto', S.valorParcela(15000), 2518.65);
eq('media 3', S.media([3000, 3000, 2700]), 2900);
eq('media 1 so', S.media([2500, 0, 0]), 2500);
// Parcelas (Lei 7.998 art. 4º, § 2º)
eq('1º 11m', S.numeroParcelas(11, 1), 0); eq('1º 12m', S.numeroParcelas(12, 1), 4); eq('1º 23m', S.numeroParcelas(23, 1), 4); eq('1º 24m', S.numeroParcelas(24, 1), 5);
eq('2º 8m', S.numeroParcelas(8, 2), 0); eq('2º 9m', S.numeroParcelas(9, 2), 3); eq('2º 12m', S.numeroParcelas(12, 2), 4); eq('2º 30m', S.numeroParcelas(30, 2), 5);
eq('3º 5m', S.numeroParcelas(5, 3), 0); eq('3º 6m', S.numeroParcelas(6, 3), 3); eq('3º 11m', S.numeroParcelas(11, 3), 3); eq('3º 36m', S.numeroParcelas(36, 3), 5);
// Casos completos
let r = S.calcular({ salarios: [3000, 3000, 3000], meses: 24, pedido: 1, motivo: 'semJusta', requisitoRecente: true });
eq('A parcela', r.parcela, 2166.66); eq('A n', r.parcelas, 5); eq('A total', r.total, 10833.30);
r = S.calcular({ salarios: [1800, 1800, 1800], meses: 24, pedido: 1, motivo: 'semJusta', requisitoRecente: true });
eq('B total', r.total, 8105);
r = S.calcular({ salarios: [3000, 3000, 3000], meses: 24, pedido: 1, motivo: 'pedido', requisitoRecente: true });
eq('C pedido sem direito', r.direito, false); eq('C motivo', r.motivoSem, 'motivo');
r = S.calcular({ salarios: [5000], meses: 18, pedido: 1, motivo: 'indireta', requisitoRecente: true });
eq('D indireta parcela', r.parcela, 2518.65); eq('D n', r.parcelas, 4);
r = S.calcular({ salarios: [2500, 2500, 2500], meses: 20, pedido: 1, motivo: 'semJusta', requisitoRecente: false });
eq('E recente', r.motivoSem, 'recente'); eq('E total', r.total, 0);
console.log(`SEGURO · OK ${ok} · FALHAS ${fail}`); if (fail) process.exit(1);
