import { cp, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const output = 'dist';

// Hide the Blog tab only in navigation; preserve blog.html and its articles.
function withoutBlogNavigation(html) {
  return html.replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi, (nav) =>
    nav
      .replace(/<li\b[^>]*>\s*<a\b[^>]*href\s*=\s*["'](?:\.\/|\/)?blog\.html(?:[?#][^"']*)?["'][^>]*>[\s\S]*?<\/a>\s*<\/li>/gi, '')
      .replace(/<a\b[^>]*href\s*=\s*["'](?:\.\/|\/)?blog\.html(?:[?#][^"']*)?["'][^>]*>[\s\S]*?<\/a>/gi, '')
  );
}


function enhanceHomePage(html) {
  // An editorial hub rather than another book-feature section.
  const section = `
<section class="ag-home-signature" aria-labelledby="ag-home-signature-heading">
  <div class="ag-home-signature-shell">
    <div class="ag-home-signature-top">
      <div>
        <p class="ag-home-signature-kicker">EL UNIVERSO DE ARIS GÓMEZ</p>
        <h2 id="ag-home-signature-heading">Historias que se escriben.<br><em>Voces que permanecen.</em></h2>
      </div>
      <p class="ag-home-signature-intro">Literatura, música y una trayectoria personal que encuentra nuevas formas de expresión. Descubre los proyectos, las publicaciones y la faceta artística de Aris Gómez.</p>
    </div>
    <div class="ag-home-signature-grid">
      <a href="/biografia.html" class="ag-home-signature-tile">
        <span class="ag-home-signature-index">01 / IDENTIDAD</span>
        <strong>La autora</strong>
        <span>Una trayectoria con voz propia.</span>
        <span class="ag-home-signature-arrow" aria-hidden="true">↗</span>
      </a>
      <a href="/musica.html" class="ag-home-signature-tile">
        <span class="ag-home-signature-index">02 / CREACIÓN</span>
        <strong>La música</strong>
        <span>Palabras que encuentran su ritmo.</span>
        <span class="ag-home-signature-arrow" aria-hidden="true">↗</span>
      </a>
      <a href="/prensa.html" class="ag-home-signature-tile">
        <span class="ag-home-signature-index">03 / PROYECCIÓN</span>
        <strong>En los medios</strong>
        <span>Entrevistas, publicaciones y actualidad.</span>
        <span class="ag-home-signature-arrow" aria-hidden="true">↗</span>
      </a>
    </div>
    <div class="ag-home-signature-note">
      <span class="ag-home-signature-note-label">UNA COLABORACIÓN EDITORIAL</span>
      <p>La cineasta y escritora <strong>Mabel Lozano</strong> firma el prólogo de <a href="/aris-de-la-oscuridad-a-la-libertad.html">ARIS: De la oscuridad a la libertad</a>, obra autobiográfica de Aris Gómez narrada en tercera persona.</p>
    </div>
  </div>
</section>`;
  const css = `<style id="ag-home-signature-design">
.ag-home-signature,.ag-home-signature *{box-sizing:border-box}
.ag-home-signature{position:relative;overflow:hidden;isolation:isolate;background:radial-gradient(ellipse at 0% 0%,rgba(101,61,120,.17),transparent 45%),linear-gradient(145deg,#09060d,#110b18 65%,#09060d);border-block:1px solid rgba(233,208,154,.2);padding:clamp(58px,8vw,108px) 24px 70px;color:#f4eadb;font-family:'Cormorant Garamond',Georgia,serif}
.ag-home-signature-shell{width:min(1140px,100%);margin:auto}
.ag-home-signature-top{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,.75fr);align-items:end;gap:clamp(24px,6vw,85px);padding-bottom:44px}
.ag-home-signature-kicker{font:600 11px/1.5 system-ui,sans-serif!important;letter-spacing:.22em;color:#d6b77d!important;margin:0 0 22px!important}
.ag-home-signature h2{margin:0!important;font:400 clamp(42px,5.4vw,74px)/1.04 'Cormorant Garamond',Georgia,serif!important;letter-spacing:-.025em;color:#fff3d7!important}
.ag-home-signature h2 em{color:#d9ba84;font-weight:400}
.ag-home-signature-intro{max-width:390px;margin:0 0 5px!important;font:400 clamp(20px,2.1vw,25px)/1.5 'Cormorant Garamond',Georgia,serif!important;color:#cdbfae!important}
.ag-home-signature-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
.ag-home-signature-tile{position:relative;display:flex;flex-direction:column;min-height:235px;padding:30px 30px 27px;border:1px solid rgba(233,208,154,.24);border-radius:3px;background:linear-gradient(135deg,rgba(255,255,255,.045),rgba(255,255,255,.01));color:#eee2cf!important;text-decoration:none!important;transition:background .2s,border-color .2s,transform .2s}
.ag-home-signature-tile:hover,.ag-home-signature-tile:focus-visible{background:rgba(233,208,154,.08);border-color:#d9ba84;transform:translateY(-3px)}
.ag-home-signature-index{font:600 10px/1.6 system-ui,sans-serif;letter-spacing:.17em;color:#c8aa77}
.ag-home-signature-tile strong{margin-top:auto;margin-bottom:7px;font:500 clamp(29px,3vw,41px)/1.1 'Cormorant Garamond',Georgia,serif;color:#fff3d7}
.ag-home-signature-tile>span:nth-last-child(2){font:400 19px/1.35 'Cormorant Garamond',Georgia,serif;color:#cdbfae}
.ag-home-signature-arrow{position:absolute;right:27px;top:25px;font:400 22px/1 sans-serif;color:#d9ba84}
.ag-home-signature-note{display:grid;grid-template-columns:220px 1fr;gap:30px;align-items:start;padding:34px 0 0;margin-top:38px;border-top:1px solid rgba(233,208,154,.2)}
.ag-home-signature-note-label{font:600 10px/1.7 system-ui,sans-serif;letter-spacing:.19em;color:#c8aa77}
.ag-home-signature-note p{max-width:750px;margin:0!important;font:400 clamp(18px,2vw,23px)/1.5 'Cormorant Garamond',Georgia,serif!important;color:#d4c6b5!important}
.ag-home-signature-note strong{font-weight:600;color:#fff3d7}
.ag-home-signature-note a{color:#e7ce9f!important;text-underline-offset:5px}
@media(max-width:850px){.ag-home-signature-top{grid-template-columns:1fr}.ag-home-signature-intro{max-width:700px}.ag-home-signature-note{grid-template-columns:1fr;gap:12px}}
@media(max-width:650px){.ag-home-signature{padding:58px 18px 50px}.ag-home-signature h2{font-size:clamp(37px,10vw,52px)}.ag-home-signature-grid{grid-template-columns:1fr;gap:10px}.ag-home-signature-tile{min-height:168px;padding:22px 25px}.ag-home-signature-note{margin-top:30px;padding-top:25px}.ag-home-signature-top{padding-bottom:32px}}
@media(prefers-reduced-motion:reduce){.ag-home-signature-tile{transition:none}}
</style>`;
  // Keep the homepage's existing hero and original book section: no second book card.
  const closingMain = html.toLowerCase().lastIndexOf('</main>');
  const footer = /<footer\b/i.exec(html);
  const at = closingMain !== -1 ? closingMain : (footer ? footer.index : -1);
  if (at === -1) throw new Error('Cannot find the homepage content insertion point');
  let result = html.slice(0, at) + section + html.slice(at);
  result = result.replace(/<\/head>/i, css + '</head>');
  const seo = 'Aris Gómez, autora y artista: libros, música y trayectoria. Su obra ARIS: De la oscuridad a la libertad cuenta con prólogo de Mabel Lozano.';
  if (/<meta\s+name=["']description["']/i.test(result)) {
    result = result.replace(/<meta\s+name=["']description["'][^>]*>/i, '<meta name="description" content="' + seo + '">');
  } else {
    result = result.replace(/<\/head>/i, '<meta name="description" content="' + seo + '"></head>');
  }
  return result;
}


function enhanceBiography(html) {
  // Reuse the existing original portrait embedded in the biography.
  const portrait = html.match(/<figure class="portrait">[\s\S]*?<\/figure>/i)?.[0] || '<figure class="portrait"><img src="/autora.png" alt="Retrato de Aris Gómez Olalla" loading="eager"></figure>';
  const page = String.raw\`
<main id="contenido" class="ag-bio">
  <section class="ag-bio-hero" aria-labelledby="ag-bio-title">
    <div class="ag-bio-hero-copy">
      <p class="ag-bio-eyebrow">BIOGRAFÍA OFICIAL <span aria-hidden="true"> / </span> ARIS GÓMEZ OLALLA</p>
      <h1 id="ag-bio-title">Una vida.<br><em>Muchas formas de contarla.</em></h1>
      <p class="ag-bio-intro">Escritora, autora de letras y creadora musical. Una trayectoria que une palabra, identidad y libertad de expresión.</p>
      <p class="ag-bio-about">Nacida en Madrid, Aris Gómez Olalla desarrolla su trabajo creativo entre la literatura y la música. A través de sus obras, transforma experiencias y reflexiones en historias con voz propia.</p>
      <div class="ag-bio-actions">
        <a href="/libros.html" class="ag-bio-btn ag-bio-btn-solid">Explorar mis libros <span aria-hidden="true">↗</span></a>
        <a href="/aris-g.html" class="ag-bio-btn">Descubrir ARIS G <span aria-hidden="true">↗</span></a>
      </div>
      <div class="ag-bio-identities"><span>LITERATURA</span><span>COMPOSICIÓN</span><span>PROYECTOS ARTÍSTICOS</span></div>
    </div>
    <div class="ag-bio-photo">
      \${portrait}
      <div class="ag-bio-photo-caption"><span>ARIS GÓMEZ</span><span>Autora y artista</span></div>
    </div>
  </section>
  <section class="ag-bio-statement" aria-labelledby="ag-bio-vision">
    <p class="ag-bio-eyebrow">LA VOZ DETRÁS DE LAS OBRAS</p>
    <h2 id="ag-bio-vision">Escribir para comprender.<br><em>Crear para seguir adelante.</em></h2>
    <div class="ag-bio-statement-text">
      <p>Mi camino como autora nace del deseo de contar historias que importan. La escritura me permite abordar la memoria, las emociones y la capacidad humana para reconstruirse, siempre desde una mirada personal.</p>
      <p>Con el tiempo, esa necesidad de expresión ha encontrado nuevos lenguajes. La composición y la música amplían mi universo creativo, donde las palabras pueden convertirse también en canciones.</p>
    </div>
  </section>
  <section class="ag-bio-path" aria-labelledby="ag-bio-path-title">
    <div class="ag-bio-section-head">
      <div><p class="ag-bio-eyebrow">TRAYECTORIA CREATIVA</p><h2 id="ag-bio-path-title">Tres formas de dejar huella</h2></div>
      <p>Libros, canciones y presencia en medios se conectan a través de una misma identidad artística.</p>
    </div>
    <div class="ag-bio-path-grid">
      <article class="ag-bio-path-item">
        <span class="ag-bio-number">01 / LITERATURA</span>
        <h3>La palabra escrita</h3>
        <p>Autora de <cite>ARIS: De la oscuridad a la libertad</cite>, autobiografía narrada en tercera persona publicada por Círculo Rojo, y de <cite>La vida psicológica es un SUGUS</cite>, obra dedicada a explorar las emociones.</p>
        <a href="/libros.html">Ver publicaciones <span aria-hidden="true">↗</span></a>
      </article>
      <article class="ag-bio-path-item">
        <span class="ag-bio-number">02 / MÚSICA</span>
        <h3>La palabra que suena</h3>
        <p>Bajo el nombre artístico <strong>ARIS G</strong>, desarrolla canciones y letras originales, acercando su voz a nuevos públicos a través de plataformas musicales.</p>
        <a href="/musica.html">Escuchar música <span aria-hidden="true">↗</span></a>
      </article>
      <article class="ag-bio-path-item">
        <span class="ag-bio-number">03 / COMUNICACIÓN</span>
        <h3>Más allá de las páginas</h3>
        <p>Entrevistas, prensa y proyectos audiovisuales completan una trayectoria donde la escritura y la creación se abren al diálogo con otras audiencias.</p>
        <a href="/prensa.html">Ver prensa <span aria-hidden="true">↗</span></a>
      </article>
    </div>
  </section>
  <aside class="ag-bio-editorial" aria-label="Colaboración editorial">
    <div><span class="ag-bio-eyebrow">UNA VOZ EN EL PRÓLOGO</span><h2>Una obra acompañada por Mabel Lozano</h2></div>
    <div><p>La cineasta y escritora <strong>Mabel Lozano</strong> firma el prólogo de <cite>ARIS: De la oscuridad a la libertad</cite>. Su aportación acompaña este testimonio autobiográfico de Aris Gómez, narrado en tercera persona.</p><a href="/aris-de-la-oscuridad-a-la-libertad.html">Conocer la obra <span aria-hidden="true">↗</span></a></div>
  </aside>
  <section class="ag-bio-outro" aria-labelledby="ag-bio-outro-title">
    <p class="ag-bio-eyebrow">EL SIGUIENTE CAPÍTULO</p>
    <h2 id="ag-bio-outro-title">Las historias continúan.</h2>
    <p>Para conocer mis proyectos, publicaciones y propuestas de colaboración.</p>
    <a class="ag-bio-btn ag-bio-btn-solid" href="/contacto.html">Contactar <span aria-hidden="true">↗</span></a>
  </section>
</main>\`;
  const css = String.raw\`<style id="ag-bio-premium">
.ag-bio{--ag-gold:#dec395;--ag-text:#eee3d4;--ag-muted:#cdbfae;--ag-stroke:rgba(225,196,143,.25);font-family:'Cormorant Garamond',Georgia,serif;color:var(--ag-text);width:min(1200px,calc(100% - 72px));margin:0 auto}
.ag-bio *{box-sizing:border-box}.ag-bio a:focus-visible{outline:2px solid #fff2d0;outline-offset:5px}
.ag-bio-eyebrow{font:600 11px/1.6 system-ui,sans-serif!important;letter-spacing:.2em;color:var(--ag-gold)!important;margin:0 0 20px!important}
.ag-bio h1,.ag-bio h2,.ag-bio h3{font-family:'Cormorant Garamond',Georgia,serif!important;font-weight:400!important;letter-spacing:-.02em;color:#fff1da!important}
.ag-bio h1{font-size:clamp(51px,6vw,91px)!important;line-height:1.02!important;margin:0 0 28px!important}
.ag-bio h1 em,.ag-bio h2 em{font-weight:400;color:var(--ag-gold)}
.ag-bio h2{font-size:clamp(38px,4.5vw,62px)!important;line-height:1.08!important;margin:0!important}
.ag-bio h3{font-size:clamp(30px,3vw,42px)!important;line-height:1.12!important;margin:18px 0!important}
.ag-bio p{color:var(--ag-muted)}.ag-bio a{color:#f5dba9}
.ag-bio-hero{display:grid;grid-template-columns:minmax(0,1.14fr) minmax(0,.86fr);gap:clamp(40px,6vw,105px);align-items:center;padding:clamp(60px,8vw,108px) 0 100px}
.ag-bio-intro{max-width:630px;font-size:clamp(24px,2.6vw,32px);line-height:1.35;color:#f7ecda!important;margin:0 0 24px!important}
.ag-bio-about{font-size:21px;line-height:1.6;max-width:580px;margin:0 0 30px!important}
.ag-bio-actions{display:flex;flex-wrap:wrap;gap:12px;margin:28px 0 44px}
.ag-bio-btn{display:inline-flex;align-items:center;justify-content:center;gap:16px;min-height:52px;padding:12px 25px;border:1px solid var(--ag-gold);border-radius:100px;text-decoration:none!important;color:#f3d7a4!important;background:transparent;font:600 15px/1.4 system-ui,sans-serif;transition:background .2s,color .2s}
.ag-bio-btn-solid{background:var(--ag-gold);color:#1a1019!important}
.ag-bio-btn:hover{background:#fff0c9;color:#1a1019!important}
.ag-bio-identities{display:flex;flex-wrap:wrap;gap:10px 23px;padding-top:22px;border-top:1px solid var(--ag-stroke)}
.ag-bio-identities span{font:500 10px/1.6 system-ui,sans-serif;letter-spacing:.1em;color:#bca98f}
.ag-bio-photo{position:relative;max-width:470px;width:100%;justify-self:end;padding:0 0 22px 20px}
.ag-bio-photo::before{content:'';position:absolute;inset:22px 0 0 0;border:1px solid rgba(225,196,143,.43);pointer-events:none}
.ag-bio-photo .portrait{position:relative;z-index:1;width:100%;max-width:none;margin:0;display:block}
.ag-bio-photo .portrait img{display:block;width:100%;height:auto;max-height:690px;object-fit:cover;object-position:center top;aspect-ratio:3/4;border:0;border-radius:0;box-shadow:0 25px 75px rgba(0,0,0,.4)}
.ag-bio-photo-caption{display:flex;justify-content:space-between;gap:12px;padding:13px 8px 0 0;font:500 10px/1.5 system-ui,sans-serif;letter-spacing:.13em;color:#c6b194}
.ag-bio-statement{border-top:1px solid var(--ag-stroke);padding:80px 0 90px}
.ag-bio-statement h2{max-width:900px}
.ag-bio-statement-text{display:grid;grid-template-columns:1fr 1fr;gap:70px;margin-top:45px}
.ag-bio-statement-text p{font-size:clamp(21px,2vw,25px);line-height:1.55;margin:0}
.ag-bio-path{padding:80px 0 90px;border-top:1px solid var(--ag-stroke)}
.ag-bio-section-head{display:grid;grid-template-columns:1.4fr .6fr;gap:40px;align-items:end;margin-bottom:43px}
.ag-bio-section-head>p{font-size:21px;line-height:1.45;margin:0}
.ag-bio-path-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
.ag-bio-path-item{display:flex;flex-direction:column;min-height:400px;padding:32px 27px;border:1px solid var(--ag-stroke);background:linear-gradient(140deg,rgba(255,255,255,.045),rgba(117,78,112,.055))}
.ag-bio-number{font:600 11px/1.4 system-ui,sans-serif;letter-spacing:.14em;color:var(--ag-gold)}
.ag-bio-path-item p{font-size:20px;line-height:1.6;margin:0 0 32px}
.ag-bio-path-item a,.ag-bio-editorial a{margin-top:auto;display:inline-flex;align-items:center;gap:9px;font:600 14px/1.5 system-ui,sans-serif;text-decoration:none;border-bottom:1px solid currentColor;width:max-content;max-width:100%;padding-bottom:6px}
.ag-bio-editorial{display:grid;grid-template-columns:1fr 1fr;gap:65px;align-items:start;padding:60px 50px;margin:5px 0 90px;border:1px solid var(--ag-stroke);background:radial-gradient(ellipse at 100% 5%,rgba(104,66,117,.25),transparent 65%),#120c19}
.ag-bio-editorial h2{font-size:clamp(35px,4vw,50px)!important}
.ag-bio-editorial p{font-size:23px;line-height:1.55;margin:0 0 23px}
.ag-bio-editorial strong{color:#fff1da}
.ag-bio-outro{text-align:center;padding:70px 15px 100px;border-top:1px solid var(--ag-stroke)}
.ag-bio-outro p:not(.ag-bio-eyebrow){font-size:23px;line-height:1.5;margin:20px 0 30px}
@media(max-width:900px){.ag-bio{width:min(100% - 42px,1200px)}.ag-bio-hero{gap:36px}.ag-bio-path-grid{grid-template-columns:1fr 1fr}.ag-bio-path-item{min-height:340px}.ag-bio-editorial{gap:35px;padding:42px 35px}}
@media(max-width:680px){.ag-bio{width:calc(100% - 36px)}.ag-bio-hero{grid-template-columns:1fr;padding:52px 0 65px}.ag-bio h1{font-size:clamp(48px,11vw,65px)!important}.ag-bio-photo{max-width:420px;justify-self:center;padding-left:14px}.ag-bio-statement,.ag-bio-path{padding:55px 0}.ag-bio-statement-text,.ag-bio-section-head,.ag-bio-path-grid,.ag-bio-editorial{grid-template-columns:1fr}.ag-bio-statement-text{gap:20px;margin-top:30px}.ag-bio-path-item{min-height:290px}.ag-bio-section-head{gap:18px}.ag-bio-editorial{margin-bottom:45px;padding:30px 23px;gap:20px}.ag-bio-outro{padding:55px 0 75px}}
@media(prefers-reduced-motion:reduce){.ag-bio-btn{transition:none}}
</style>\`;
  let result = html.replace(/<main\b[^>]*>[\s\S]*?<\/main>/i, page);
  if (result === html) throw new Error('Biography main content not found');
  result = result.replace(/<\/head>/i, css + '</head>');
  const description = 'Biografía oficial de Aris Gómez Olalla, escritora madrileña y artista ARIS G. Trayectoria literaria, libros, composición musical, prensa y colaboraciones.';
  result = result.replace(/<meta\s+name=["']description["'][^>]*>/i, '<meta name="description" content="' + description + '">');
  return result;
}

async function build(directory = '.') {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || ['dist', 'scripts', 'node_modules', 'vercel.json'].includes(entry.name)) continue;
    const file = path.join(directory, entry.name);
    const target = path.join(output, file);
    if (entry.isDirectory()) {
      await mkdir(target, { recursive: true });
      await build(file);
    } else if (/\.html$/i.test(entry.name)) {
      const html = await readFile(file, 'utf8');
      let page = withoutBlogNavigation(html);
      if (directory === '.' && entry.name === 'index.html') page = enhanceHomePage(page);
      if (directory === '.' && entry.name === 'biografia.html') page = enhanceBiography(page);
      await writeFile(target, page);
    } else {
      await cp(file, target);
    }
  }
}

await mkdir(output, { recursive: true });
await build();
