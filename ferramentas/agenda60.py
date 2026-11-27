import sys, datetime as dt; sys.path.insert(0,'.'); from temas import T
D0=dt.date(2026,12,7)
VID=[1,2,3,5,6,8,9,4,11,12,13,14,15,16,7,60,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,33,61]
CAR=[4,60,18,48,34,5,20,30,12,38,39,19,13,47,25,35,52,42,43,6,14,22,36,29,49,56,26,8,41,40,46,44,45,15,28,32,31,24,21,51,50,55,58,57,53,54,16,17,23,27,37,59,7,9,11,1,2,3]
IMG=[3,25,21,42,43,45,41,40,51,35,18,38,39,52,29,14,13,11,48,50,46,22,19,33,36,10,2,8,16,20,26,47,55,56,58,24,32,34]
LONGO=["Rescisão completa: o guia de tudo o que você recebe","Férias: direitos, prazos e como calcular","13º salário: datas, descontos e proporcional","FGTS: depósitos, multa, saque e saque-aniversário","Seguro-desemprego: quem tem direito, prazo e parcelas","Salário líquido 2026: INSS e a nova isenção do IR"]
print(len(VID),'videos', len(set(VID)))
vday={t:i for i,t in enumerate(VID)}
last={}; rows=[]; ci=0; ii=0; li=0
def pick(lst,idx,day):
    j=idx
    while j<len(lst):
        t=lst[j]
        if day-last.get(t,-99)>=10 and abs(vday.get(t,-99)-day)>=10: lst.pop(j); return t
        j+=1
    return None
car=CAR[:]; img=IMG[:]
for k in range(60):
    day=D0+dt.timedelta(days=k); dia=k+1; wd=day.weekday(); lote=(k//7)+1
    tv=VID[k]; last[tv]=k
    rows.append(dict(dia=dia,data=day,lote=lote,formato="Vídeo curto",canal="IG Reels + YT Shorts",tema_id=tv))
    if wd<5:
        tc=pick(car,0,k)
        if tc: last[tc]=k; rows.append(dict(dia=dia,data=day,lote=lote,formato="Carrossel",canal="Instagram",tema_id=tc))
    if wd in (0,2,4):
        ti=pick(img,0,k)
        if ti: last[ti]=k; rows.append(dict(dia=dia,data=day,lote=lote,formato="Imagem",canal="Instagram",tema_id=ti))
    if wd==5 and dia>=14 and li<len(LONGO):
        rows.append(dict(dia=dia,data=day,lote=lote,formato="Vídeo completo",canal="YouTube",tema_id=None,longo=LONGO[li])); li+=1
import collections; c=collections.Counter(r['formato'] for r in rows); print(c)
for r in rows:
    if r['lote']==1: print(r['dia'],r['data'],r['formato'],r['tema_id'],T[r['tema_id']][1] if r['tema_id'] else r.get('longo'))
import pickle; pickle.dump(rows,open('rows.pkl','wb'))
