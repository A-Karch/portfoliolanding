const fs = require('fs');
const path = require('path');

const root = __dirname;
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
let failed = 0;

function test(name, condition) {
  if (condition) {
    console.log(`PASS ${name}`);
    return;
  }
  failed += 1;
  console.error(`FAIL ${name}`);
}

const localLinks = [...html.matchAll(/href="((?:products|demos)\/[^"#?]+)"/g)].map((match) => match[1]);

test('three focused case-study links are present', localLinks.length === 3);
test('every case-study link resolves to a local index', localLinks.every((link) => fs.existsSync(path.join(root, link, 'index.html'))));
test('fixed starter and mini-tool prices are explicit', html.includes('€99') && html.includes('€199'));
test('contact links prefill a useful project brief', html.includes('Website%20URL%3A') && html.includes('What%20needs%20to%20change%3A'));
test('English and French language controls are present', html.includes('data-lang="en"') && html.includes('data-lang="fr"'));
test('portfolio contains no ChatGPT-hosted URL', !/chatgpt\.site/i.test(html));
test('portfolio does not claim testimonials or client counts', !/testimonial|happy clients?|trusted by/i.test(html));
test('mobile and reduced-motion styles are present', /@media\(max-width:620px\)/.test(html) && /prefers-reduced-motion/.test(html));

if (failed) process.exit(1);
console.log('8 portfolio checks passed.');
