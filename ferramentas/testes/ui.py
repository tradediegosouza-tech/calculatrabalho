import asyncio, re
from playwright.async_api import async_playwright
BASE="http://localhost:8765/"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
        errs=[]; bad=[]
        for name,vp in [("desktop",{"width":1280,"height":900}),("celular",{"width":375,"height":740})]:
            pg = await b.new_page(viewport=vp)
            pg.on("console", lambda m: errs.append(m.text) if m.type=="error" else None)
            pg.on("pageerror", lambda e: errs.append(str(e)))
            pg.on("response", lambda r: bad.append((r.status,r.url)) if r.status>=400 else None)
            for path in ["", "sobre.html", "privacidade.html", "rescisao/"]:
                await pg.goto(BASE+path)
                for a in await pg.eval_on_selector_all("a[href]", "els=>els.map(e=>e.href)"):
                    if a.startswith(BASE):
                        r = await pg.request.get(a)
                        if r.status>=400: bad.append((r.status,a))
            await pg.goto(BASE+"rescisao/")
            await pg.click("button[type=submit]")
            print(name, "erro vazio ->", await pg.text_content("#erro"))
            await pg.fill("#salario","3.000,00"); await pg.fill("#admissao","2023-03-10"); await pg.fill("#saida","2026-11-20")
            await pg.select_option("#motivo","semJusta"); await pg.fill("#saldoFgts","10000")
            await pg.click("button[type=submit]")
            await pg.wait_for_selector("#res:not([hidden])")
            print(name, "resultado ->", (await pg.text_content("#res .big strong")))
            sw = await pg.evaluate("document.documentElement.scrollWidth"); print(name,"largura",sw,"viewport",vp["width"])
            await pg.select_option("#motivo","pedido"); await pg.select_option("#aviso","naoCumprido"); await pg.click("button[type=submit]")
            t = await pg.text_content("#res"); print(name,"pedido desconto aviso presente:", "aviso não cumprido" in t)
            await pg.screenshot(path=f"/home/claude/lab001-tests/{name}.png", full_page=False)
        print("ERROS JS:", errs); print("LINKS RUINS:", bad)
        await b.close()
asyncio.run(main())
