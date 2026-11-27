import sys; sys.path.insert(0,'.'); from render import *
P="/home/claude/midia/lote02"; os.makedirs(P,exist_ok=True)
CTA="Link na bio"
V={
"D8_video_T04_acordo_484A":[("v",None,None,"Fez acordo para sair?","Veja o que você recebe e o que perde.",None,3.2),
 ("c","½",VERDE,"Metade do aviso","Se o aviso for indenizado, você recebe metade dele.",None,4.0),
 ("c","20%",VERDE,"Multa do FGTS","A multa cai de 40% para 20%.",None,3.8),
 ("c","80%",VERDE,"Saque do FGTS","Você pode sacar até 80% do saldo.","CLT, art. 484-A",4.0),
 ("c","✗",VERM,"Sem seguro-desemprego","No acordo não há direito ao seguro.",None,3.8),
 ("c","✓",VERDE,"O resto é inteiro","Saldo de salário, 13º e férias + 1/3 continuam integrais.",None,4.0),
 ("v",None,None,"Compare antes de assinar","Calculadora grátis",CTA,3.5)],
"D9_video_T11_experiencia_90":[("v","90",MINT,"dias no máximo","Contrato de experiência pode passar disso?",None,3.4),
 ("c","90",VERDE,"dias é o limite","O contrato de experiência não pode passar de 90 dias.","CLT, art. 445",4.2),
 ("c","1x",VERDE,"só uma prorrogação","Pode ser prorrogado uma única vez, dentro dos 90 dias.",None,4.0),
 ("c","!",OURO,"Passou disso?","Vira contrato por prazo indeterminado, com todos os direitos.","CLT, art. 451",4.4),
 ("v",None,None,"Saiu do emprego?","Calcule sua rescisão grátis",CTA,3.5)],
}
C={
"D8_carrossel_T30_saque_aniversario":[("v",None,None,None,"Fez saque-aniversário?","Cuidado se você for demitido.","Arraste para o lado →"),
 ("c","DEMITIDO SEM JUSTA CAUSA",VERDE,"40%","a multa você saca","A multa paga pela empresa fica liberada.",None),
 ("c","O SALDO",VERM,"✗","fica na conta","O saldo do FGTS não é liberado pela demissão.","fgts.gov.br"),
 ("c","DEPOIS",VERDE,"1x","por ano","O saldo sai aos poucos, nos próximos saques-aniversário, ou em outros casos da lei.",None),
 ("c","QUER VOLTAR?",OURO,"25","meses de espera","A volta ao saque-rescisão só vale no 1º dia do 25º mês após o pedido.","Lei 8.036/90, art. 20-C"),
 ("v",None,None,None,"Seus outros direitos continuam","Saldo, aviso, 13º e férias não mudam. Confira na calculadora.","Link na bio · @calculatrabalho")],
}
I={
"D8_imagem_T43_adicional_noturno":("c","TRABALHO NOTURNO",VERDE,"+20%","das 22h às 5h","No trabalho urbano, a hora noturna vale 20% a mais e tem 52min30s. Siga @calculatrabalho.","CLT, art. 73"),
}
for n,c in V.items(): print(n, video(P,n,c),"s")
for n,s in C.items(): carrossel(f"{P}/{n}",s); print(n,len(s),"telas")
for n,a in I.items(): slide(f"{P}/{n}.png",*a); print(n)
