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
  const section = `
<section class="ag-home-book" aria-labelledby="ag-home-book-title">
  <div class="ag-home-book-inner">
    <p class="ag-home-book-eyebrow">LITERATURA · TESTIMONIO · LIBERTAD</p>
    <h2 id="ag-home-book-title">Una historia real que invita a recuperar la voz</h2>
    <p class="ag-home-book-lead">En <cite>ARIS: De la oscuridad a la libertad</cite>, Aris Gómez reconstruye en tercera persona un recorrido vital de supervivencia, valentía y transformación.</p>
    <p>La obra cuenta con un <strong>prólogo de Mabel Lozano</strong>, cineasta y escritora comprometida con dar visibilidad a historias de mujeres. Su participación acompaña un relato que invita a reflexionar sobre la dignidad, la resiliencia y el camino hacia la libertad.</p>
    <a class="ag-home-book-link" href="/aris-de-la-oscuridad-a-la-libertad.html">Descubre el libro <span aria-hidden="true">→</span></a>
  </div>
</section>`;
  const css = `<style id="ag-home-book-design">
.ag-home-book{box-sizing:border-box;position:relative;isolation:isolate;padding:clamp(55px,8vw,110px) 24px;background:radial-gradient(ellipse at 85% 10%,rgba(143,89,133,.19),transparent 55%),linear-gradient(140deg,#08050e,#190d21 55%,#08050e);border-top:1px solid rgba(232,211,154,.24);border-bottom:1px solid rgba(232,211,154,.24);color:#f6ead2;font-family:'Cormorant Garamond',Georgia,serif;text-align:center}
.ag-home-book *{box-sizing:border-box}
.ag-home-book-inner{max-width:790px;margin:0 auto}
.ag-home-book-eyebrow{margin:0 0 18px;color:#e8d39a;font:600 12px/1.6 system-ui,sans-serif;letter-spacing:.19em}
.ag-home-book h2{margin:0 auto 24px;max-width:750px;color:#fff3b0;font:500 clamp(36px,5vw,61px)/1.1 'Cormorant Garamond',Georgia,serif;letter-spacing:-.018em}
.ag-home-book p:not(.ag-home-book-eyebrow){margin:0 auto 20px;max-width:730px;font:400 clamp(19px,2.2vw,24px)/1.6 'Cormorant Garamond',Georgia,serif;color:#e3d7ca}
.ag-home-book p.ag-home-book-lead{color:#f6ead2;font-size:clamp(22px,2.6vw,29px);line-height:1.45}
.ag-home-book strong{color:#fff3b0;font-weight:600}
.ag-home-book cite{font-style:italic}
.ag-home-book-link{display:inline-flex;align-items:center;justify-content:center;gap:14px;min-height:49px;margin-top:17px;padding:11px 28px;border:1px solid #e8d39a;border-radius:99px;color:#fff3b0!important;background:transparent;text-decoration:none!important;font:600 17px/1.4 system-ui,sans-serif;transition:background .2s,color .2s}
.ag-home-book-link:hover,.ag-home-book-link:focus-visible{background:#e8d39a;color:#170c1d!important}
@media(max-width:650px){.ag-home-book{padding:56px 19px}.ag-home-book-eyebrow{font-size:10px;letter-spacing:.13em}.ag-home-book h2{font-size:38px}}
@media(prefers-reduced-motion:reduce){.ag-home-book-link{transition:none}}
</style>`;
  // Insert before the final main closing tag, keeping the footer untouched.
  const closingMain = html.toLowerCase().lastIndexOf('</main>');
  const footer = /<footer\b/i.exec(html);
  const at = closingMain !== -1 ? closingMain : (footer ? footer.index : -1);
  if (at === -1) throw new Error('Cannot find the homepage content insertion point');
  let result = html.slice(0, at) + section + html.slice(at);
  result = result.replace(/<\/head>/i, css + '</head>');
  // Only the homepage receives this additional editorial SEO summary.
  const seo = 'Aris Gómez presenta ARIS: De la oscuridad a la libertad, un testimonio narrado en tercera persona con prólogo de Mabel Lozano. Libros, música y trayectoria.';
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
