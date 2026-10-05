async function check() {
  const res = await fetch('http://localhost:3000/');
  const html = await res.text();
  const metas = html.match(/<meta[^>]+>/g) || [];
  const ogMetas = metas.filter(m => m.includes('og:') || m.includes('twitter:') || m.includes('image'));
  console.log(ogMetas.join('\n'));
}
check().catch(console.error);
