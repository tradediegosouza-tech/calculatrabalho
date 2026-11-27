import sys; sys.path.insert(0,'.'); from render import *
P="/home/claude/midia/lote03"; os.makedirs(P,exist_ok=True)
V={
"D10_video_T12_experiencia_antes":[("v",None,None,"A empresa encerrou sua experiência antes da data?","Você pode ter uma indenização.",None,3.0),
 ("c","½",VERDE,"Metade do que faltava","A empresa paga metade da remuneração dos dias que faltavam até o fim do contrato.","CLT, art. 479",4.4),
 ("c","Ex.",VERDE,"20 dias antes do fim","Recebe como indenização metade de 20 dias de salário: 10 dias.",None,4.0),
 ("c","!",OURO,"Se foi você que saiu antes","Pode ter que indenizar o prejuízo, até esse mesmo limite.","CLT, art. 480",4.0),
 ("c","?",OURO,"Contrato com cláusula de rescisão antecipada?","Aí valem as regras do aviso prévio.","CLT, art. 481",3.8),
 ("v",None,None,"Calcule o seu grátis","link na bio","@calculatrabalho",3.5)],
}
C={
"D9_carrossel_T38_inss_2026":[("v",None,None,None,"Quanto o INSS desconta do seu salário em 2026?","A tabela nova, faixa por faixa.","Arraste para o lado →"),
 ("c","ATÉ R$ 1.621,00",VERDE,"7,5%","1ª faixa","Quem ganha 1 salário mínimo desconta R$ 121,58.","Portaria MPS/MF nº 13/2026"),
 ("c","R$ 1.621,01 A R$ 2.902,84",VERDE,"9%","2ª faixa","Só sobre a parte do salário dentro desta faixa.","Portaria MPS/MF nº 13/2026"),
 ("c","R$ 2.902,85 A R$ 4.354,27",VERDE,"12%","3ª faixa",None,"Portaria MPS/MF nº 13/2026"),
 ("c","R$ 4.354,28 A R$ 8.475,55",OURO,"14%","4ª faixa","R$ 8.475,55 é o teto: acima dele o desconto não sobe.","Portaria MPS/MF nº 13/2026"),
 ("c","EXEMPLO",VERDE,"R$ 200,69","de INSS em R$ 2.500","7,5% sobre R$ 1.621,00 + 9% sobre R$ 879,00. Desconto real: 8,03%.","Tabela do INSS (gov.br)"),
 ("v",None,None,None,"Quanto sobra no seu caso?","Calcule o seu grátis: link na bio.","@calculatrabalho")],
}
I={
"D10_imagem_T45_periculosidade":("c","PERICULOSIDADE",VERDE,"+30%","sobre o salário-base","Para quem trabalha exposto a risco, como inflamáveis, explosivos, energia elétrica ou segurança. Siga @calculatrabalho.","CLT, art. 193, § 1º"),
}
if __name__=="__main__":
    for n,c in V.items(): print(n, video(P,n,c),"s")
    for n,s in C.items(): carrossel(f"{P}/{n}",s); print(n,len(s),"telas")
    for n,a in I.items(): slide(f"{P}/{n}.png",*a); print(n)
