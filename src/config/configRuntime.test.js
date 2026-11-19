// Script de demarrage du conteneur (docker/40-config-runtime.sh) : la meme
// image applique la marque du restaurant au demarrage (titre, couleur, logo,
// manifeste PWA, favicon), et sans configuration reste SenYummies.
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

const racine = resolve(__dirname, '../..');
const script = join(racine, 'docker/40-config-runtime.sh');

let shDisponible = true;
try {
  execFileSync('sh', ['-c', 'exit 0']);
} catch {
  shDisponible = false;
}

const dossiers = [];
afterEach(() => dossiers.splice(0).forEach((d) => rmSync(d, { recursive: true, force: true })));

/** Prepare une copie du site (modeles intacts + dossier servi) et lance le script. */
function demarrer(env, marque) {
  const base = mkdtempSync(join(tmpdir(), 'config-runtime-'));
  dossiers.push(base);
  const html = join(base, 'html');
  const modeles = join(base, 'modeles');
  mkdirSync(join(html, 'icons'), { recursive: true });
  mkdirSync(join(html, 'marque'), { recursive: true });
  mkdirSync(modeles, { recursive: true });
  copyFileSync(join(racine, 'index.html'), join(modeles, 'index.html'));
  copyFileSync(join(racine, 'public/manifest.webmanifest'), join(modeles, 'manifest.webmanifest'));
  copyFileSync(join(racine, 'public/icons/icon.svg'), join(modeles, 'icon.svg'));
  copyFileSync(join(racine, 'public/icons/maskable.svg'), join(modeles, 'maskable.svg'));
  const dossierMarque = join(base, 'marque');
  if (marque) {
    mkdirSync(join(dossierMarque, 'icons'), { recursive: true });
    Object.entries(marque).forEach(([nom, contenu]) => writeFileSync(join(dossierMarque, nom), contenu));
  }
  // Script tel qu'il est copie dans l'image (fins de ligne Unix).
  const copie = join(base, 'config.sh');
  writeFileSync(copie, readFileSync(script, 'utf8').replace(/\r\n/g, '\n'));
  execFileSync('sh', [copie], {
    env: { PATH: process.env.PATH, CONFIG_HTML: html, CONFIG_MODELES: modeles, CONFIG_MARQUE: dossierMarque, ...env },
  });
  const lire = (f) => readFileSync(join(html, f), 'utf8');
  const config = {};
  // eslint-disable-next-line no-new-func
  new Function('window', lire('config.js'))(config);
  return { lire, config: config.__SENYUMMIES_CONFIG__ };
}

// sh est lent sous Windows (Git Bash) : delai large.
describe.skipIf(!shDisponible)('demarrage du conteneur (40-config-runtime.sh)', { timeout: 30000 }, () => {
  it('sans configuration : SenYummies, rouge #A6192E', () => {
    const { lire, config } = demarrer({});
    expect(lire('index.html')).toContain('<title>SenYummies</title>');
    expect(lire('index.html')).toContain('content="#A6192E"');
    const manifeste = JSON.parse(lire('manifest.webmanifest'));
    expect(manifeste.short_name).toBe('SenYummies');
    expect(manifeste.theme_color).toBe('#A6192E');
    expect(lire('icons/icon.svg')).toContain('>SY<');
    expect(config.MARQUE_NOM).toBe('');
  });

  it('restaurant configure : titre, couleur, manifeste, logo et favicon', () => {
    const favicon = '<svg xmlns="http://www.w3.org/2000/svg"><title>favicon du restaurant</title></svg>';
    const { lire, config } = demarrer({
      MARQUE_NOM: 'Kër Saveurs',
      MARQUE_NOM_COURT: 'Kër',
      MARQUE_COULEUR: '#1F7A4D',
      MARQUE_DESCRIPTION: 'Grillades à Thiès, "braisées" & livrées.',
      MARQUE_LOGO_URL: '/marque/logo.svg',
      MARQUE_RESEAUX: '{"whatsapp":"+221770000000"}',
      MARQUE_PAIEMENTS: 'wave,orange-money',
    }, { 'logo.svg': '<svg/>', 'favicon.svg': favicon, 'icons/icon-192.png': 'png' });

    const index = lire('index.html');
    expect(index).toContain('<title>Kër Saveurs</title>');
    expect(index).toContain('<meta name="theme-color" content="#1F7A4D" />');
    expect(index).toContain('name="apple-mobile-web-app-title" content="Kër"');
    expect(index).toContain('content="Grillades à Thiès, &quot;braisées&quot; &amp; livrées."');
    expect(index).not.toContain('SenYummies');

    const manifeste = JSON.parse(lire('manifest.webmanifest'));
    expect(manifeste.name).toBe('Kër Saveurs — Commande en ligne');
    expect(manifeste.short_name).toBe('Kër');
    expect(manifeste.description).toBe('Grillades à Thiès, "braisées" & livrées.');
    expect(manifeste.theme_color).toBe('#1F7A4D');

    // Logo et icones du restaurant servis par l'app.
    expect(lire('marque/logo.svg')).toBe('<svg/>');
    expect(lire('icons/icon-192.png')).toBe('png');
    expect(lire('icons/icon.svg')).toBe(favicon);

    // config.js : valeurs transmises telles quelles au navigateur (JSON compris).
    expect(config.MARQUE_NOM).toBe('Kër Saveurs');
    expect(JSON.parse(config.MARQUE_RESEAUX).whatsapp).toBe('+221770000000');
    expect(config.MARQUE_PAIEMENTS).toBe('wave,orange-money');
  });

  it('couleur invalide : couleur par defaut, le conteneur demarre quand meme', () => {
    const { lire } = demarrer({ MARQUE_COULEUR: 'vert' });
    expect(lire('index.html')).toContain('content="#A6192E"');
  });
});
