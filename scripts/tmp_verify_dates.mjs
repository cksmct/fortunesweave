import fs from 'node:fs';
const s = fs.readFileSync('src/data/pageDates.ts', 'utf8');
const want = ['/', '/materials', '/activities', '/locations', '/postgame', '/sidequests', '/characters'];
for (const k of want) {
  const m = s.match(new RegExp(`'${k.replace(/\//g, '\\/')}': '([^']+)'`));
  console.log(k, '=', m && m[1]);
}
// 计数路由总数
const all = [...s.matchAll(/'[^']+': '[^']+'/g)];
console.log('TOTAL ROUTES =', all.length);
