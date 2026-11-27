/* LAB-001 · Seguro-desemprego (estimativa). Tabela MTE vigente desde 11/01/2026 (reajuste INPC 3,90%).
   Parcelas: Lei 7.998/1990, arts. 3º e 4º (redação da Lei 13.134/2015). Piso = salário mínimo R$ 1.621,00. */
(function (root) {
  const T = { faixa1: 2222.17, faixa2: 3703.99, base2: 1777.74, teto: 2518.65, piso: 1621.00 };
  const r2 = v => Math.round(Number(v.toFixed(6)) * 100) / 100;
  function media(salarios) {
    const s = (salarios || []).filter(x => x > 0);
    if (!s.length) return 0;
    return r2(s.reduce((a, b) => a + b, 0) / s.length);
  }
  function valorParcela(m) {
    if (!(m > 0)) return 0;
    let v;
    if (m <= T.faixa1) v = m * 0.8;
    else if (m <= T.faixa2) v = (m - T.faixa1) * 0.5 + T.base2;
    else v = T.teto;
    return r2(Math.min(T.teto, Math.max(T.piso, v)));
  }
  // meses = meses trabalhados nos 36 meses antes da dispensa; pedido = 1, 2 ou 3 (3 = terceiro em diante)
  function numeroParcelas(meses, pedido) {
    const minimo = pedido === 1 ? 12 : pedido === 2 ? 9 : 6;
    if (!(meses >= minimo)) return 0;
    if (meses >= 24) return 5;
    if (meses >= 12) return 4;
    return 3;
  }
  function calcular({ salarios, meses, pedido, motivo, requisitoRecente }) {
    const m = media(salarios), p = Number(pedido) || 1;
    const motivoOk = motivo === 'semJusta' || motivo === 'indireta';
    const n = numeroParcelas(Number(meses), p);
    const direito = motivoOk && requisitoRecente !== false && n > 0;
    const parcela = direito ? valorParcela(m) : 0;
    let motivoSem = '';
    if (!motivoOk) motivoSem = 'motivo';
    else if (requisitoRecente === false) motivoSem = 'recente';
    else if (n === 0) motivoSem = 'meses';
    return { media: m, parcela, parcelas: direito ? n : 0, total: r2(parcela * (direito ? n : 0)), direito, motivoSem };
  }
  const api = { calcular, valorParcela, numeroParcelas, media, TABELA: T };
  if (typeof module !== 'undefined') module.exports = api; else root.LabSeguro = api;
})(this);
