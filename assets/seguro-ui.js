(function(){
  const $ = id => document.getElementById(id);
  const brl = v => v.toLocaleString('pt-BR', {style:'currency', currency:'BRL'});
  const num = s => { s = (s||'').trim().replace(/[R$\s]/g,''); if (s.includes(',')) s = s.replace(/\./g,'').replace(',', '.'); return parseFloat(s); };
  const rotulos = {1:'Trabalhou com carteira em 12 dos últimos 18 meses?', 2:'Trabalhou com carteira em 9 dos últimos 12 meses?', 3:'Recebeu salário em cada um dos 6 meses antes da demissão?'};
  const ajusta = () => { $('recenteLabel').textContent = rotulos[$('pedido').value]; };
  $('pedido').addEventListener('change', ajusta); ajusta();
  const porque = { motivo: 'O seguro-desemprego é para quem foi demitido sem justa causa ou teve a rescisão indireta reconhecida. Pedido de demissão, acordo e justa causa não dão direito.',
    recente: 'Pelo que você informou, falta o tempo mínimo de trabalho recente exigido para este pedido (Lei 7.998/1990, art. 3º).',
    meses: 'Pelo que você informou, os meses trabalhados não chegam ao mínimo para este pedido (1º: 12 meses; 2º: 9; 3º em diante: 6).' };
  $('f').addEventListener('submit', e => {
    e.preventDefault(); $('erro').textContent = '';
    const salarios = ['s1','s2','s3'].map(k => num($(k).value)).filter(v => v > 0);
    const meses = parseInt($('meses').value, 10);
    if (!salarios.length || !(meses >= 0 && meses <= 36)) { $('erro').textContent = 'Informe pelo menos o último salário e os meses trabalhados (0 a 36).'; return; }
    const r = LabSeguro.calcular({ salarios, meses, pedido: Number($('pedido').value), motivo: $('motivo').value, requisitoRecente: $('recente').value === 'sim' });
    if (!r.direito) {
      $('res').innerHTML = `<div class="big">Resultado<strong>Sem direito, pelo informado</strong></div><p>${porque[r.motivoSem]}</p><p class="hint">Na dúvida, confira na Carteira de Trabalho Digital ou no gov.br.</p>`;
    } else {
      $('res').innerHTML = `<div class="big">Cada parcela, estimada<strong>${brl(r.parcela)}</strong><span class="hint">${r.parcelas} parcelas · total de ${brl(r.total)}</span></div>
      <table><tr><td>Média dos salários informados</td><td>${brl(r.media)}</td></tr><tr><td>Número de parcelas</td><td>${r.parcelas}</td></tr><tr class="total"><td>Total estimado</td><td>${brl(r.total)}</td></tr></table>
      <p class="hint">Peça do 7º ao 120º dia depois da demissão. Se arrumar outro emprego, as parcelas seguintes são suspensas.</p>`;
    }
    $('res').hidden = false; $('res').scrollIntoView({behavior:'smooth', block:'start'});
  });
})();
