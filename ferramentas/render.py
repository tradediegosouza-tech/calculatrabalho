from PIL import Image, ImageDraw, ImageFont
import subprocess, os
import os
F=os.path.join(os.path.dirname(os.path.abspath(__file__)),"fonts")+"/"
X=lambda s: ImageFont.truetype(F+"Inter-ExtraBold.otf", s); B=lambda s: ImageFont.truetype(F+"Inter-Bold.otf", s); M=lambda s: ImageFont.truetype(F+"Inter-Medium.otf", s)
VERDE=(31,111,92); CLARO=(247,247,245); TINTA=(29,36,51); CINZA=(91,100,117); VERM=(170,51,51); OURO=(176,120,10); MINT=(214,238,229)
def wrap(d,t,f,mw):
    out=[]
    for p in (t or "").split("\n"):
        l=""
        for w in p.split():
            s=(l+" "+w).strip()
            if d.textlength(s,font=f)<=mw: l=s
            else: out.append(l); l=w
        if l: out.append(l)
    return out
def fit(d,txt,start,mw):
    s=start
    while s>60 and d.textlength(txt,font=X(s))>mw: s-=10
    return X(s)
# ---------- slide/imagem 1080x1350 ----------
def slide(path,fd,selo,cs,num,tit,corpo,rod,idx=None,tot=None,W=1080,H=1350):
    bg=VERDE if fd=="v" else CLARO; fg=(255,255,255) if fd=="v" else TINTA; sub=MINT if fd=="v" else CINZA
    im=Image.new("RGB",(W,H),bg); d=ImageDraw.Draw(im)
    d.text((80,72),"CALCULA TRABALHO",font=B(32),fill=sub if fd=="v" else VERDE)
    if idx: d.text((W-80,72),f"{idx}/{tot}",font=B(32),fill=sub,anchor="ra")
    bl=[]
    if selo: bl.append(("selo",selo,90))
    if num: fn=fit(d,num,240,W-160); bl.append(("num",(num,fn),250))
    sz=96 if fd=="v" else 76
    while sz>50 and tit and max(d.textlength(w,font=X(sz)) for w in tit.split())>W-160: sz-=6
    ft=X(sz); lt=wrap(d,tit,ft,W-160); LH=int(sz*1.17)
    if lt: bl.append(("tit",lt,len(lt)*LH+30))
    fc=M(58 if fd=="v" else 56); lc=wrap(d,corpo,fc,W-160)
    if lc: bl.append(("corpo",lc,len(lc)*80))
    total=sum(h for _,_,h in bl)+30*(len(bl)-1); y=(H-total)//2+20
    for tp,c,h in bl:
        if tp=="selo":
            tw=d.textlength(c,font=B(38)); sf=(255,255,255) if fd=="v" else (cs or VERDE); st=VERDE if fd=="v" else (255,255,255)
            d.rounded_rectangle((80,y,80+tw+60,y+70),35,fill=sf); d.text((110,y+14),c,font=B(38),fill=st)
        elif tp=="num": d.text((72,y-30),c[0],font=c[1],fill=cs or (MINT if fd=="v" else VERDE))
        elif tp=="tit":
            for k,ln in enumerate(c): d.text((80,y+k*LH),ln,font=ft,fill=fg)
        else:
            for k,ln in enumerate(c): d.text((80,y+k*80),ln,font=fc,fill=sub if fd=="v" else TINTA)
        y+=h+30
    if rod: d.text((80,H-130),rod,font=B(38),fill=sub)
    im.save(path)
def carrossel(pasta,slides):
    os.makedirs(pasta,exist_ok=True); n=len(slides)
    for i,s in enumerate(slides,1): slide(f"{pasta}/slide{i:02d}.png",*s,idx=i,tot=n)
    th=[Image.open(f"{pasta}/slide{i:02d}.png").resize((270,338)) for i in range(1,n+1)]
    cols=4; rows=(n+cols-1)//cols; sh=Image.new("RGB",(280*cols+10,348*rows+10),(255,255,255))
    for k,t in enumerate(th): sh.paste(t,(10+(k%cols)*280,10+(k//cols)*348))
    sh.save(pasta+"_previa.png")
# ---------- vídeo 1080x1920 ----------
def cena(path,fundo,destaque,cor,titulo,corpo,rodape=None,W=1080,H=1920):
    bg=VERDE if fundo=="v" else CLARO; fg=(255,255,255) if fundo=="v" else TINTA; sub=MINT if fundo=="v" else CINZA
    im=Image.new("RGB",(W,H),bg); d=ImageDraw.Draw(im)
    d.text((W//2,150),"CALCULA TRABALHO",font=B(40),fill=sub if fundo=="v" else VERDE,anchor="mm")
    parts=[]
    if destaque: parts.append(("d",destaque,300))
    ft=X(100); lt=wrap(d,titulo,ft,W-160)
    if lt: parts.append(("t",lt,len(lt)*120))
    fc=M(64); lc=wrap(d,corpo,fc,W-160)
    if lc: parts.append(("c",lc,len(lc)*88))
    tot=sum(h for _,_,h in parts)+50*(len(parts)-1); y=(H-tot)//2
    for k,c,h in parts:
        if k=="d": d.text((W//2,y+150),c,font=fit(d,c,260,W-120),fill=cor or (MINT if fundo=="v" else VERDE),anchor="mm")
        elif k=="t":
            for i,l in enumerate(c): d.text((W//2,y+i*120+60),l,font=ft,fill=fg,anchor="mm")
        else:
            for i,l in enumerate(c): d.text((W//2,y+i*88+44),l,font=fc,fill=sub if fundo=="v" else TINTA,anchor="mm")
        y+=h+50
    if rodape: d.text((W//2,H-260),rodape,font=B(52),fill=sub,anchor="mm")
    im.save(path)
def video(pasta,nome,cenas):
    os.makedirs(f"{pasta}/{nome}",exist_ok=True); segs=[]
    for i,(f_,dst,cor,t,c,rod,dur) in enumerate(cenas):
        p=f"{pasta}/{nome}/c{i}.png"; cena(p,f_,dst,cor,t,c,rod); segs.append((p,dur))
    inp=[]; fl=[]
    for i,(p,dur) in enumerate(segs):
        inp+=["-loop","1","-t",str(dur),"-i",p]
        fl.append(f"[{i}:v]scale=1080:1920,format=yuv420p,fade=t=in:st=0:d=0.25,fade=t=out:st={dur-0.25}:d=0.25,setsar=1[v{i}]")
    fl.append("".join(f"[v{i}]" for i in range(len(segs)))+f"concat=n={len(segs)}:v=1:a=0[out]")
    subprocess.run(["ffmpeg","-y","-loglevel","error",*inp,"-filter_complex",";".join(fl),"-map","[out]","-r","30","-c:v","libx264","-preset","veryfast","-crf","20","-movflags","+faststart",f"{pasta}/{nome}.mp4"],check=True)
    return sum(d for _,d in segs)
