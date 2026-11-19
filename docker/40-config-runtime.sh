#!/bin/sh
# Genere la configuration de l'app a chaque demarrage du conteneur, depuis les
# variables d'environnement : la meme image sert tous les environnements ET
# tous les restaurants (marque blanche). Execute par l'entrypoint de l'image
# nginx (/docker-entrypoint.d/).
#
#   /config.js               lu par src/config/runtime.js (API, support, marque)
#   /index.html              titre, description, couleur du navigateur
#   /manifest.webmanifest    nom, nom court, description et couleur de l'app installee (PWA)
#   /icons/icon.svg          monogramme sur la couleur de marque (ou /marque/favicon.svg)
#   /marque/...              fichiers du restaurant (logo, bannieres, icones) montes en /marque
#
# Les variables MARQUE_* sont produites par l'outil de personnalisation
# (Backend_RestoApp : npm run client -- <restaurant>, voir
# PERSONNALISER-UN-RESTAURANT.md). Vides : marque SenYummies.
#
# CONFIG_HTML, CONFIG_MODELES, CONFIG_MARQUE : dossiers (tests uniquement).
set -eu

HTML="${CONFIG_HTML:-/usr/share/nginx/html}"
MODELES="${CONFIG_MODELES:-/usr/share/nginx/modeles}"
MARQUE_DOSSIER="${CONFIG_MARQUE:-/marque}"

# Echappe \ et " pour une chaine JavaScript ou JSON valide.
echapper() {
  printf '%s' "$1" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g'
}
# Texte insere dans du HTML / SVG.
echapper_html() {
  printf '%s' "$1" | sed -e 's/&/\&amp;/g' -e 's/</\&lt;/g' -e 's/>/\&gt;/g' -e 's/"/\&quot;/g'
}
# Partie droite d'un s|...|...| de sed.
echapper_sed() {
  printf '%s' "$1" | sed -e 's/[\\&|]/\\&/g'
}

# --- Marque du restaurant (valeurs par defaut : SenYummies) -----------------
NOM="${MARQUE_NOM:-SenYummies}"
NOM_COURT="${MARQUE_NOM_COURT:-$NOM}"
COULEUR="${MARQUE_COULEUR:-#A6192E}"
case "$COULEUR" in
  \#[0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f]) ;;
  *) echo "config-runtime: MARQUE_COULEUR invalide ($COULEUR), couleur par defaut"; COULEUR="#A6192E" ;;
esac
if [ -n "${MARQUE_INITIALES:-}" ]; then
  INITIALES="$MARQUE_INITIALES"
else
  # Majuscules du nom (SenYummies -> SY), sinon 2 premieres lettres.
  INITIALES=$(printf '%s' "$NOM" | tr -cd 'A-Z' | cut -c1-2)
  [ ${#INITIALES} -ge 2 ] || INITIALES=$(printf '%s' "$NOM" | cut -c1-2 | tr 'a-z' 'A-Z')
fi

# Toutes les variables lues par le navigateur (src/config/marque.js, support.js).
VARIABLES="API_BASE_URL SUPPORT_TELEPHONE SUPPORT_EMAIL MARQUE_NOM MARQUE_NOM_COURT MARQUE_NOM_ACCENT
  MARQUE_INITIALES MARQUE_LOGO_URL MARQUE_SLOGAN MARQUE_SOUS_TITRE MARQUE_DESCRIPTION MARQUE_COULEUR
  MARQUE_COULEUR_FONCEE MARQUE_COULEUR_CLAIRE MARQUE_BANNIERE_URL MARQUE_SPLASH_URL MARQUE_ACCUEIL_BADGE
  MARQUE_ACCUEIL_TEXTE MARQUE_ADRESSE MARQUE_RESEAUX MARQUE_HORAIRES MARQUE_PAIEMENTS MARQUE_MODES"
{
  echo "// Genere au demarrage du conteneur (docker/40-config-runtime.sh)."
  echo "window.__SENYUMMIES_CONFIG__ = {"
  for v in $VARIABLES; do
    eval "valeur=\${$v:-}"
    printf '  %s: "%s",\n' "$v" "$(echapper "$valeur")"
  done
  echo "};"
} > "$HTML/config.js"

# Pages statiques : repartent toujours des modeles de l'image (redemarrage
# idempotent), le nom et la couleur par defaut y sont remplaces.
NOM_HTML=$(echapper_sed "$(echapper_html "$NOM")")
NOM_JSON=$(echapper_sed "$(echapper "$NOM")")
COURT_HTML=$(echapper_sed "$(echapper_html "$NOM_COURT")")
COURT_JSON=$(echapper_sed "$(echapper "$NOM_COURT")")
INITIALES_SVG=$(echapper_sed "$(echapper_html "$INITIALES")")
DESCRIPTION_HTML=''
DESCRIPTION_JSON=''
if [ -n "${MARQUE_DESCRIPTION:-}" ]; then
  DESCRIPTION_HTML="s|<meta name=\"description\" content=\"[^\"]*\"|<meta name=\"description\" content=\"$(echapper_sed "$(echapper_html "$MARQUE_DESCRIPTION")")\"|"
  DESCRIPTION_JSON="s|\"description\": \"[^\"]*\"|\"description\": \"$(echapper_sed "$(echapper "$MARQUE_DESCRIPTION")")\"|"
fi
sed -e "s|name=\"apple-mobile-web-app-title\" content=\"SenYummies\"|name=\"apple-mobile-web-app-title\" content=\"$COURT_HTML\"|" \
    -e "${DESCRIPTION_HTML:-s|^\$||}" \
    -e "s|SenYummies|$NOM_HTML|g" -e "s|#A6192E|$COULEUR|g" "$MODELES/index.html" > "$HTML/index.html"
sed -e "s|\"short_name\": \"SenYummies\"|\"short_name\": \"$COURT_JSON\"|" \
    -e "${DESCRIPTION_JSON:-s|^\$||}" \
    -e "s|SenYummies|$NOM_JSON|g" -e "s|#A6192E|$COULEUR|g" "$MODELES/manifest.webmanifest" > "$HTML/manifest.webmanifest"
for icone in icon.svg maskable.svg; do
  sed -e "s|#A6192E|$COULEUR|g" -e "s|>SY<|>$INITIALES_SVG<|" "$MODELES/$icone" > "$HTML/icons/$icone"
done

# Fichiers propres au restaurant, montes en lecture seule sur /marque :
#   /marque/logo.svg, banniere.jpg...  -> servis en /marque/... (MARQUE_*_URL)
#   /marque/icons/*.png                -> remplacent les icones de l'app (memes noms)
#   /marque/favicon.svg                -> remplace l'icone SVG (onglet, PWA)
if [ -d "$MARQUE_DOSSIER" ]; then
  cp -R "$MARQUE_DOSSIER/." "$HTML/marque/"
  if [ -d "$MARQUE_DOSSIER/icons" ]; then
    cp "$MARQUE_DOSSIER"/icons/* "$HTML/icons/"
  fi
  if [ -f "$MARQUE_DOSSIER/favicon.svg" ]; then
    cp "$MARQUE_DOSSIER/favicon.svg" "$HTML/icons/icon.svg"
  fi
fi

echo "config-runtime: API_BASE_URL=${API_BASE_URL:-(defaut)} marque=$NOM couleur=$COULEUR"
