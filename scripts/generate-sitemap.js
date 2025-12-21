import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOMAIN = 'https://payload-cool.vercel.app';

const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

const generateSitemap = () => {
  const postsDir = path.join(__dirname, '../src/posts');
  const publicDir = path.join(__dirname, '../public');
  
  // Get all markdown files
  const files = fs.readdirSync(postsDir).filter(file => file.endsWith('.md'));
  
  const urls = [
    {
      url: '/',
      changefreq: 'daily',
      priority: 1.0
    },
    {
      url: '/blog',
      changefreq: 'daily',
      priority: 0.8
    }
  ];

  // Add blog posts
  files.forEach(file => {
    const slug = file.replace('.md', '');
    urls.push({
      url: `/blog/${slug}`,
      changefreq: 'weekly',
      priority: 0.7
    });
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(({ url, changefreq, priority }) => `  <url>
    <loc>${DOMAIN}${url}</loc>
    <lastmod>${formatDate(new Date())}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
  console.log('✅ Sitemap generated successfully!');
};

generateSitemap();
