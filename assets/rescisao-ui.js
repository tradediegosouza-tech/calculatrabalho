(function(){
  const $ = id => document.getElementById(id);
  const brl = v => v.toLocaleString('pt-BR', {style:'currency', currency:'BRL'});
  const num = s => { s = (s||'').trim().replace(/[R$\s]/g,''); if (s.includes(',')) s = s.replace(/\./g,'').replace(',', '.'); return parseFloat(s); };
  const opcoes = {
    semJusta: [['indenizado','Indenizado (não trabalhei)'],['trabalhado','Trabalhado']],
    pedido: [['trabalhado','Vou cumprir / cumpri'],['naoCumprido','Não vou cumprir'],['dispensado','A empresa dispensou']],
    acordo: [['indenizado','Indenizado (metade)'],['trabalhado','Trabalhado']],
    justaCausa: [['dispensado','Não se aplica']],
    indireta: [['indenizado','Indenizado (padrão)'],['trabalhado','Trabalhado']],
    experiencia: [['dispensado','Não se aplica (terminou no prazo)']]
  };
  function preencheAviso(){ const m=$('motivo').value; $('aviso').innerHTML = opcoes[m].map(([v,t])=>`<option value="${v}">${t}</option>`).join('');
    $('avisoHint').textContent = m==='pedido' ? 'Quem pede demissão e não cumpre o aviso pode ter 1 salário descontado.' : ''; }
  $('motivo').addEventListener('change', preencheAviso); preencheAviso();
  $('f').addEventListener('submit', e => {
    e.preventDefault(); $('erro').textContent='';
    const dados = { salario: num($('salario').value), admissao: $('admissao').value, saida: $('saida').value,
      motivo: $('motivo').value, aviso: $('aviso').value, feriasVencidas: $('feriasVencidas').value, saldoFgts: num($('saldoFgts').value) || 0 };
    if (!(dados.salario > 0) || !dados.admissao || !dados.saida) { $('erro').textContent = 'Preencha salário, admissão e último dia de trabalho.'; return; }
    let r; try { r = LabCalc.calcular(dados); } catch (err) { $('erro').textContent = 'A data de saída precisa ser depois da admissão.'; return; }
    const v=r.verbas, d=r.descontos, linha=(t,x,neg)=> x ? `<tr><td>${t}</td><td class="${neg?'neg':''}">${neg?'− ':''}${brl(x)}</td></tr>` : '';
    $('res').innerHTML = `<div class="big">Você recebe, estimado<strong>${brl(r.liquido)}</strong><span class="hint">na rescisão, já com descontos</span></div>
    <table>${linha('Saldo de salário ('+r.info.diasMes+' dias)', v.saldoSalario)}${linha('Aviso prévio indenizado ('+r.info.diasAvisoIndenizado+' dias)', v.avisoIndenizado)}
    ${linha('13º proporcional ('+r.info.meses13+'/12)', v.decimoTerceiro)}${linha('Férias proporcionais ('+r.info.mesesFerias+'/12)', v.feriasProporcionais)}
    ${linha('Férias vencidas', v.feriasVencidas)}${linha('1/3 de férias', v.tercoFerias)}
    ${linha('INSS', d.inssSalario + d.inss13, true)}${linha('Imposto de Renda', d.irSalario + d.ir13, true)}${linha('Desconto do aviso não cumprido', d.avisoNaoCumprido, true)}
    <tr class="total"><td>Total líquido estimado</td><td>${brl(r.liquido)}</td></tr></table>
    <h3>FGTS</h3><table>${linha('Multa do FGTS (paga pela empresa)', r.fgts.multa)}${linha('Saque liberado do FGTS', r.fgts.saque)}</table>
    <p class="hint">${r.fgts.estimado ? 'Saldo do FGTS estimado em '+brl(r.fgts.saldo)+' (8% do salário por mês, sem rendimentos). Informe o saldo real para um valor melhor. ' : ''}${r.fgts.saque===0 && r.fgts.multa===0 ? 'Nesse tipo de saída não há multa nem saque do FGTS. ' : ''}${r.seguroDesemprego ? 'Você pode ter direito ao seguro-desemprego.' : ''}</p>`;
    $('res').hidden = false; $('res').scrollIntoView({behavior:'smooth', block:'start'});
  });
})();
