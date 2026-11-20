// Pass through the publisher's RSS so readers can load it from the site's own origin.
module.exports = async function news(req, res) {
  const section = req.query.seccion || 'espana';
  if (!['espana', 'internacional'].includes(section)) return res.status(400).end();
  try {
    const url = 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/' + section + '/portada';
    const feed = await fetch(url, { signal: AbortSignal.timeout(7000) });
    if (!feed.ok) throw new Error('Feed unavailable');
    const xml = await feed.text();
    if (!/<item[\s>]/i.test(xml)) throw new Error('Empty feed');
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.status(200).send(xml);
  } catch {
    res.status(503).end();
  }
};
