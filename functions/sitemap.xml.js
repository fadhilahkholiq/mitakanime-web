export async function onRequest({ request }) {
    const url = new URL(request.url);
    const baseUrl = url.origin; 
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    const staticPages = ['/home', '/az', '/ongoing', '/jadwal', '/katalog', '/genre', '/genre/action', '/genre/adventure', '/genre/comedy', '/genre/demons', '/genre/drama', '/genre/ecchi', '/genre/fantasy', '/genre/game', '/genre/harem', '/genre/historical', '/genre/horror', '/genre/josei', '/genre/magic', '/genre/martial-arts', '/genre/mecha', '/genre/military', '/genre/music', '/genre/mystery', '/genre/psychological', '/genre/parody', '/genre/police', '/genre/romance', '/genre/samurai', '/genre/school', '/genre/sci-fi', '/genre/seinen', '/genre/shoujo', '/genre/shoujo-ai', '/genre/shounen', '/genre/slice-of-life', '/genre/sports', '/genre/space', '/genre/super-power', '/genre/supernatural', '/genre/thriller', '/genre/vampire'];
    for (const page of staticPages) {
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}${page}</loc>\n`;
        xml += `    <changefreq>daily</changefreq>\n`;
        xml += `    <priority>0.9</priority>\n`;
        xml += `  </url>\n`;
    }
    try {
        const res = await fetch('https://api.mitaka.mom/anime/unlimited');
        const result = await res.json();
        if (result.status === 'success' && result.data && result.data.list) {
            for (const group of result.data.list) {
                if (group.animeList && group.animeList.length > 0) {
                    for (const anime of group.animeList) {
                        const routeId = anime.animeId || anime.href.split('/').pop();
                        const cleanRouteId = routeId.replace(/&/g, '&amp;');
                        xml += `  <url>\n`;
                        xml += `    <loc>${baseUrl}/anime/${cleanRouteId}</loc>\n`;
                        xml += `    <changefreq>weekly</changefreq>\n`;
                        xml += `    <priority>0.6</priority>\n`;
                        xml += `  </url>\n`;
                    }
                }
            }
        }
    } catch (e) {
        console.error("Gagal mengambil data sitemap:", e);
    }
    xml += `</urlset>`;
    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml;charset=UTF-8',
            'Cache-Control': 'public, max-age=43200' 
        },
    });
}