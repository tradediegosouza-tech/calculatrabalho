/* LAB-001 · Motor de cálculo trabalhista (estimativa). Tabelas 2026.
   INSS: Portaria Interministerial MPS/MF nº 13/2026. IRRF: tabela progressiva + redução da Lei 15.270/2025. */
(function (root) {
  const INSS_2026 = [[1621.00, 0.075], [2902.84, 0.09], [4354.27, 0.12], [8475.55, 0.14]];
  const IR_2026 = [[2428.80, 0, 0], [2826.65, 0.075, 182.16], [3751.05, 0.15, 394.16], [4664.68, 0.225, 675.49], [Infinity, 0.275, 908.73]];
  const DESCONTO_SIMPLIFICADO = 607.20;
  const r2 = v => Math.round((v + Number.EPSILON) * 100) / 100;

  function inss(base) {
    let total = 0, prev = 0;
    for (const [lim, aliq] of INSS_2026) {
      if (base <= prev) break;
      total += (Math.min(base, lim) - prev) * aliq;
      prev = lim;
    }
    return r2(total);
  }
  function irrf(rendimento, inssDesc) {
    if (rendimento <= 0) return 0;
    const base = rendimento - Math.max(inssDesc, DESCONTO_SIMPLIFICADO);
    let imp = 0;
    for (const [lim, aliq, ded] of IR_2026) { if (base <= lim) { imp = base * aliq - ded; break; } }
    imp = Math.max(0, imp);
    let red = 0;
    if (rendimento <= 5000) red = Math.min(imp, 312.89);
    else if (rendimento <= 7350) red = Math.max(0, 978.62 - 0.133145 * rendimento);
    return r2(Math.max(0, imp - red));
  }
  const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)); };
  const addDays = (dt, n) => new Date(dt.getTime() + n * 86400000);
  const daysInMonth = (y, m) => new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  function fullYears(a, b) {
    let y = b.getUTCFullYear() - a.getUTCFullYear();
    if (b.getUTCMonth() < a.getUTCMonth() || (b.getUTCMonth() === a.getUTCMonth() && b.getUTCDate() < a.getUTCDate())) y--;
    return Math.max(0, y);
  }
  // meses com 15+ dias trabalhados no ano civil do fim
  function meses13(adm, fim) {
    const y = fim.getUTCFullYear(); let n = 0;
    for (let m = 0; m <= fim.getUTCMonth(); m++) {
      const ini = new Date(Date.UTC(y, m, 1)), fimM = new Date(Date.UTC(y, m, daysInMonth(y, m)));
      const a = adm > ini ? adm : ini, b = fim < fimM ? fim : fimM;
      if (b < a) continue;
      if ((b - a) / 86400000 + 1 >= 15) n++;
    }
    return n;
  }
  // meses do período aquisitivo em curso (fração de 15+ dias conta como mês)
  function mesesFerias(adm, fim) {
    const anos = fullYears(adm, fim);
    let ini = new Date(Date.UTC(adm.getUTCFullYear() + anos, adm.getUTCMonth(), adm.getUTCDate()));
    let n = 0, cur = ini;
    while (true) {
      const next = new Date(Date.UTC(cur.getUTCFullYear(), cur.getUTCMonth() + 1, cur.getUTCDate()));
      if (addDays(next, -1) <= fim) { n++; cur = next; } else break;
    }
    const resto = (fim - cur) / 86400000 + 1;
    if (resto >= 15) n++;
    return Math.min(n, 12);
  }

  function calcular(i) {
    const sal = Number(i.salario), adm = parse(i.admissao), saida = parse(i.saida);
    const motivo = i.motivo === 'indireta' ? 'semJusta' : i.motivo; // indireta (CLT art. 483) = mesmas verbas da dispensa sem justa causa
    if (!(sal > 0) || saida < adm) throw new Error('Confira salário e datas.');
    const anos = fullYears(adm, saida);
    const diasAvisoCheio = Math.min(90, 30 + 3 * anos);
    let diasAvisoIndenizado = 0;
    if (motivo === 'semJusta' && i.aviso === 'indenizado') diasAvisoIndenizado = diasAvisoCheio;
    if (motivo === 'acordo' && i.aviso === 'indenizado') diasAvisoIndenizado = Math.round(diasAvisoCheio / 2);
    const fimProjetado = addDays(saida, diasAvisoIndenizado);

    // dias trabalhados no mês da saída: conta da admissão se for o mesmo mês; saída no último dia do mês = 30 (mês comercial)
    const mesmoMes = adm.getUTCFullYear() === saida.getUTCFullYear() && adm.getUTCMonth() === saida.getUTCMonth();
    const ultimoDia = saida.getUTCDate() === daysInMonth(saida.getUTCFullYear(), saida.getUTCMonth());
    let diasMes = mesmoMes ? saida.getUTCDate() - adm.getUTCDate() + 1 : (ultimoDia ? 30 : saida.getUTCDate());
    diasMes = Math.min(30, Math.max(1, diasMes));
    const v = {};
    v.saldoSalario = r2(sal / 30 * diasMes);
    v.avisoIndenizado = r2(sal / 30 * diasAvisoIndenizado);
    const temProp = motivo !== 'justaCausa';
    const m13 = temProp ? meses13(adm, fimProjetado) : 0;
    v.decimoTerceiro = r2(sal / 12 * m13);
    const mf = temProp ? mesesFerias(adm, fimProjetado) : 0;
    v.feriasProporcionais = r2(sal / 12 * mf);
    v.feriasVencidas = r2(sal * (Number(i.feriasVencidas) || 0));
    v.tercoFerias = r2((v.feriasProporcionais + v.feriasVencidas) / 3);

    const d = {};
    d.inssSalario = inss(v.saldoSalario);
    d.inss13 = inss(v.decimoTerceiro);
    d.irSalario = irrf(v.saldoSalario, d.inssSalario);
    d.ir13 = irrf(v.decimoTerceiro, d.inss13);
    d.avisoNaoCumprido = (motivo === 'pedido' && i.aviso === 'naoCumprido') ? r2(sal) : 0;

    const bruto = r2(Object.values(v).reduce((a, b) => a + b, 0));
    const descontos = r2(Object.values(d).reduce((a, b) => a + b, 0));
    const liquido = r2(Math.max(0, bruto - descontos));

    // FGTS
    let saldoFgts = Number(i.saldoFgts) || 0, fgtsEstimado = false;
    if (!saldoFgts) {
      const mesesServ = Math.max(1, Math.round((saida - adm) / 86400000 / 30.4375));
      saldoFgts = r2(sal * 0.08 * mesesServ); fgtsEstimado = true;
    }
    const multaPct = motivo === 'semJusta' ? 0.40 : motivo === 'acordo' ? 0.20 : 0;
    const saquePct = (motivo === 'semJusta' || motivo === 'experiencia') ? 1 : motivo === 'acordo' ? 0.8 : 0;
    const fgts = { saldo: saldoFgts, estimado: fgtsEstimado, multa: r2(saldoFgts * multaPct), saque: r2(saldoFgts * saquePct) };
    const seguroDesemprego = motivo === 'semJusta';
    return { verbas: v, descontos: d, bruto, descontosTotal: descontos, liquido, fgts, seguroDesemprego,
      info: { anos, diasAvisoCheio, diasAvisoIndenizado, meses13: m13, mesesFerias: mf, diasMes } };
  }
  const api = { calcular, inss, irrf, meses13, mesesFerias };
  if (typeof module !== 'undefined') module.exports = api; else root.LabCalc = api;
})(this);
