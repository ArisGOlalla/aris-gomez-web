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
      await writeFile(target, entry.name === 'index.html' && directory === '.' ? enhanceHomePage(withoutBlogNavigation(html)) : withoutBlogNavigation(html));
    } else {
      await cp(file, target);
    }
  }
}

await mkdir(output, { recursive: true });
await build();
