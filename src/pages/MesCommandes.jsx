import { useEffect, useMemo, useState } from 'react';

import {

  Receipt,

  ShoppingBag,

  ArrowLeft,

  Sparkles,

  Truck,

  Phone,
  Star,

  ChevronRight,

  ChevronDown,

  Clock3,

  CookingPot,

  CheckCircle2,

  PackageCheck,

  UtensilsCrossed,

} from 'lucide-react';

import Header from '../components/Header';

import { commandes as commandesMock } from '../data/commandes';

import { useToast } from '../context/ToastContext';

import { formatPrix } from '../utils/format';

import { tempsRelatif } from '../utils/date';

const CLE_COMMANDE_ACTIVE = 'commande_active_id';

function lireCommandeActiveId() {

  try {

    return localStorage.getItem(CLE_COMMANDE_ACTIVE);

  } catch {

    return null;

  }

}

function sauvegarderCommandeActiveId(id) {

  try {

    localStorage.setItem(CLE_COMMANDE_ACTIVE, String(id));

  } catch {

    // Le suivi reste fonctionnel même si le stockage du navigateur est indisponible.

  }

}

function getStatut(statut = '') {

  const valeur = String(statut).toLowerCase().trim().replaceAll('_', '-').replaceAll(' ', '-');

  if (['en-attente', 'attente', 'pending'].includes(valeur)) {

    return {

      id: 'en-attente',

      label: 'En attente',

      detail: 'Votre commande a bien été reçue. Nous préparons sa prise en charge.',

      Icone: Clock3,

      couleur: 'amber',

    };

  }

  if (['en-preparation', 'preparation', 'preparing'].includes(valeur)) {

    return {

      id: 'en-preparation',

      label: 'En préparation',

      detail: 'Nos équipes préparent votre repas avec soin.',

      Icone: CookingPot,

      couleur: 'orange',

    };

  }

  if (['en-livraison', 'livraison', 'en-route', 'livreur-en-route'].includes(valeur)) {

    return {

      id: 'en-livraison',

      label: 'En livraison',

      detail: 'Votre commande est en route. Vous pouvez contacter le livreur ci-dessous.',

      Icone: Truck,

      couleur: 'sky',

    };

  }

  if (['livree', 'livré', 'livree', 'terminee', 'terminée', 'delivered'].includes(valeur)) {

    return {

      id: 'livree',

      label: 'Livrée',

      detail: 'Votre commande a été livrée. Merci de votre confiance !',

      Icone: PackageCheck,

      couleur: 'emerald',

    };

  }

  return {

    id: 'en-attente',

    label: 'En attente',

    detail: 'Votre commande attend sa prise en charge.',

    Icone: Clock3,

    couleur: 'amber',

  };

}

function couleursStatut(couleur) {

  const classes = {

    amber: {

      texte: 'text-amber-700',

      fond: 'bg-amber-500/10',

      bordure: 'border-amber-500/20',

      point: 'bg-amber-500',

      halo: 'bg-amber-500/15',

    },

    orange: {

      texte: 'text-orange-700',

      fond: 'bg-orange-500/10',

      bordure: 'border-orange-500/20',

      point: 'bg-orange-500',

      halo: 'bg-orange-500/15',

    },

    sky: {

      texte: 'text-sky-700',

      fond: 'bg-sky-500/10',

      bordure: 'border-sky-500/20',

      point: 'bg-sky-500',

      halo: 'bg-sky-500/15',

    },

    emerald: {

      texte: 'text-emerald-700',

      fond: 'bg-emerald-500/10',

      bordure: 'border-emerald-500/20',

      point: 'bg-emerald-500',

      halo: 'bg-emerald-500/15',

    },

  };

  return classes[couleur] || classes.amber;

}

function normaliserTelephone(telephone = '') {

  return String(telephone).replace(/[^\d+]/g, '');

}

function AnimationStatut({ statut, commandeId }) {

  const config = getStatut(statut);

  const palette = couleursStatut(config.couleur);

  return (

    <div className={`status-panel status-panel-${config.id} relative overflow-hidden rounded-3xl border ${palette.bordure} ${palette.fond} p-5 sm:p-6`}>

      <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full border-[22px] border-current opacity-[0.04]" />

      <div className="relative flex flex-col items-center text-center">

        {config.id === 'en-attente' && (

          <div className={`status-orb relative mb-4 flex h-28 w-28 items-center justify-center rounded-full ${palette.halo} ${palette.texte}`}>

            <div className="absolute inset-2 rounded-full border border-current/15" />

            <div className="absolute inset-0 rounded-full border border-current/20 animate-pulse-soft" />

            <div className="hourglass-sway">

              <Clock3 size={43} strokeWidth={1.7} />

            </div>

            <span className={`absolute right-3 top-4 h-2.5 w-2.5 rounded-full ${palette.point} animate-ping-soft`} />

          </div>

        )}

        {config.id === 'en-preparation' && (

          <div className={`status-orb relative mb-4 flex h-28 w-28 items-center justify-center rounded-full ${palette.halo} ${palette.texte}`}>

            <div className="absolute inset-2 rounded-full border border-current/15" />

            <span className="steam steam-one" />

            <span className="steam steam-two" />

            <span className="steam steam-three" />

            <div className="pot-sway relative mt-3">

              <CookingPot size={47} strokeWidth={1.7} />

              <span className="pot-bubble bubble-one" />

              <span className="pot-bubble bubble-two" />

              <span className="pot-bubble bubble-three" />

            </div>

          </div>

        )}

        {config.id === 'en-livraison' && (

          <div className="mb-4 flex w-full flex-col items-center">

            <div className={`relative mb-3 flex h-16 w-16 items-center justify-center rounded-2xl ${palette.halo} ${palette.texte}`}>

              <Truck className="delivery-truck" size={27} strokeWidth={1.8} />

              <span className={`absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-surface ${palette.point}`} />

            </div>

            <div className="rounded-2xl border border-sky-100 bg-white p-2.5 shadow-sm">

              <img

                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`Commande-${commandeId}`)}`}

                alt={`Code QR de la commande ${commandeId}`}

                className="h-32 w-32 rounded-xl object-contain sm:h-36 sm:w-36"

                loading="lazy"

              />

            </div>

            <p className="mt-2 text-[11px] font-medium text-ink-light">Présentez ce code pour vérifier votre commande</p>

          </div>

        )}

        {config.id === 'livree' && (

          <div className={`status-orb relative mb-4 flex h-28 w-28 items-center justify-center rounded-full ${palette.halo} ${palette.texte}`}>

            <div className="absolute inset-2 rounded-full border border-current/15" />

            <CheckCircle2 className="success-pop" size={48} strokeWidth={1.7} />

            <Sparkles className="absolute right-3 top-4" size={16} />

          </div>

        )}

        <span className={`inline-flex items-center gap-2 rounded-full border ${palette.bordure} bg-surface/80 px-3.5 py-1.5 text-xs font-extrabold ${palette.texte}`}>

          <span className={`h-2 w-2 rounded-full ${palette.point}`} />

          {config.label}

        </span>

        <h3 className="mt-3 text-lg font-black tracking-tight text-ink sm:text-xl">

          {config.id === 'en-attente' && 'Commande bien reçue'}

          {config.id === 'en-preparation' && 'Ça mijote en cuisine !'}

          {config.id === 'en-livraison' && 'Votre repas arrive'}

          {config.id === 'livree' && 'Bon appétit !'}

        </h3>

        <p className="mt-1.5 max-w-sm text-sm leading-6 text-ink-light">{config.detail}</p>

        <div className="mt-6 grid w-full max-w-md grid-cols-3 gap-2" aria-label="Étapes de la commande">
          {[
            { id: 'en-attente', label: 'Reçue' },
            { id: 'en-preparation', label: 'Cuisine' },
            { id: 'en-livraison', label: 'Livraison' },
          ].map((etape, index) => {
            const indexActif = config.id === 'en-attente' ? 0 : config.id === 'en-preparation' ? 1 : 2;
            const estTerminee = index < indexActif || config.id === 'livree';
            const estCourante = index === indexActif && config.id !== 'livree';
            return (
              <div key={etape.id} className="relative flex flex-col items-center gap-2 text-center">
                {index < 2 && <span className={`absolute left-[60%] top-3 h-0.5 w-[80%] rounded-full ${index < indexActif || config.id === 'livree' ? 'bg-primary/60' : 'bg-current/15'}`} />}
                <span className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-black ${
                  estTerminee ? 'border-primary bg-primary text-white' : estCourante ? 'border-primary bg-surface text-primary ring-4 ring-primary/10' : 'border-current/20 bg-surface text-ink-light'
                }`}>
                  {estTerminee ? '✓' : index + 1}
                </span>
                <span className={`text-[11px] font-bold ${estCourante || estTerminee ? 'text-ink' : 'text-ink-light'}`}>{etape.label}</span>
              </div>
            );
          })}
        </div>

      </div>

    </div>

  );

}

function CarteLivreur({ livreur }) {
  if (!livreur) {
    return (
      <section className="mt-5 overflow-hidden rounded-3xl border border-sky-500/20 bg-surface shadow-sm">
        <div className="flex items-center gap-3 bg-sky-500/[0.07] px-4 py-3.5 sm:px-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-700">
            <Truck size={20} />
          </span>
          <div>
            <h3 className="text-sm font-extrabold text-ink">Votre livreur</h3>
            <p className="mt-0.5 text-xs text-ink-light">Les informations de livraison</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4 sm:p-5">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
            <Clock3 size={17} />
          </span>
          <div>
            <p className="text-sm font-bold text-ink">Livreur en cours d’attribution</p>
            <p className="mt-1 text-sm leading-5 text-ink-light">Son nom et ses coordonnées apparaîtront ici dès qu’ils seront disponibles.</p>
          </div>
        </div>
      </section>
    );
  }

  const nom = livreur.nom || livreur.name || 'Votre livreur';
  const telephone = livreur.telephone || livreur.phone || '';
  const photo = livreur.photo || livreur.photoUrl || livreur.avatar;
  const note = livreur.note || livreur.rating;
  const vehicule = livreur.vehicule || livreur.vehicle;
  const telephoneNettoye = normaliserTelephone(telephone);

  return (
    <section className="mt-5 overflow-hidden rounded-3xl border border-sky-500/20 bg-surface shadow-[0_16px_40px_-28px_rgba(2,132,199,0.55)] transition-shadow duration-300 hover:shadow-[0_20px_46px_-28px_rgba(2,132,199,0.6)]">
      <div className="flex items-center justify-between gap-3 border-b border-line bg-gradient-to-r from-sky-500/[0.10] via-sky-500/[0.04] to-transparent px-4 py-4 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-700 ring-1 ring-sky-500/10">
            <Truck size={21} />
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-black text-ink sm:text-base">Votre livreur</h3>
            <p className="mt-0.5 text-xs text-ink-light">Votre contact pour la livraison</p>
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1.5 text-[10px] font-extrabold text-emerald-700 sm:text-[11px]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          En route
        </span>
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            {photo ? (
              <img src={photo} alt={`Photo de ${nom}`} className="h-[76px] w-[76px] rounded-[22px] border-2 border-surface object-cover shadow-md ring-1 ring-sky-500/20 sm:h-[88px] sm:w-[88px]" />
            ) : (
              <div className="flex h-[76px] w-[76px] items-center justify-center rounded-[22px] bg-gradient-to-br from-sky-500/15 to-sky-500/5 text-sky-700 ring-1 ring-sky-500/20 sm:h-[88px] sm:w-[88px]">
                <Truck size={31} strokeWidth={1.7} />
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-surface bg-emerald-500 text-white shadow-sm" title="Livreur assigné">
              <CheckCircle2 size={14} />
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-sky-700">Votre coursier</p>
            <h4 className="mt-1 truncate text-lg font-black leading-tight text-ink sm:text-xl">{nom}</h4>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {note && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-extrabold text-amber-700">
                  <Star size={12} className="fill-amber-500 text-amber-500" /> {note}
                </span>
              )}
              {vehicule && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-alt px-2.5 py-1 text-xs font-semibold text-ink-light">
                  <Truck size={12} /> {vehicule}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-line bg-surface-alt/70 p-3.5 sm:flex sm:items-center sm:justify-between sm:gap-4 sm:px-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-700">
              <Phone size={18} />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-ink-light">Contact direct</p>
              {telephone ? (
                <a href={`tel:${telephoneNettoye}`} className="mt-0.5 block truncate text-sm font-extrabold text-ink transition-colors hover:text-sky-700">{telephone}</a>
              ) : (
                <p className="mt-0.5 text-sm font-semibold text-ink-light">Numéro non renseigné</p>
              )}
            </div>
          </div>
          {telephone && (
            <a href={`tel:${telephoneNettoye}`} className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-3 text-sm font-extrabold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-sky-700 hover:shadow-md active:translate-y-0 sm:mt-0 sm:w-auto sm:shrink-0">
              <Phone size={16} /> Appeler
              <ChevronRight size={16} />
            </a>
          )}
        </div>
        <p className="mt-3 text-center text-[11px] leading-5 text-ink-light">Besoin d’une précision sur votre commande ? Vous pouvez contacter directement votre livreur.</p>
      </div>
    </section>
  );
}

function CommandeActive({ commande, onVoirToutes }) {

  const [detailsOuverts, setDetailsOuverts] = useState(false);

  const articles = Array.isArray(commande.articles) ? commande.articles : [];

  const totalArticles = articles.reduce((total, article) => total + Number(article.quantite || 0), 0);

  const statut = getStatut(commande.statut);

  const estEnLivraison = statut.id === 'en-livraison';

  return (

    <article className="commande-card-enter overflow-hidden rounded-[28px] border border-line/80 bg-surface shadow-[0_18px_55px_-28px_rgba(15,23,42,0.28)]">

      <div className="relative overflow-hidden border-b border-line bg-gradient-to-br from-primary/[0.09] via-surface to-surface px-4 py-5 sm:px-6">

        <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-primary/[0.05]" />

        <div className="relative flex items-start justify-between gap-3">

          <div className="flex min-w-0 items-center gap-3">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-md shadow-primary/20"><Receipt size={23} /></div>

            <div className="min-w-0">

              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary">Commande suivie</p>

              <h2 className="mt-1 truncate text-xl font-black tracking-tight text-ink">{estEnLivraison ? `Commande #${commande.id}` : `#${commande.id}`}</h2>

              <p className="mt-1 text-xs text-ink-light">{tempsRelatif(commande.date)}</p>

            </div>

          </div>

          <span className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-extrabold ${couleursStatut(statut.couleur).fond} ${couleursStatut(statut.couleur).texte}`}>

            {statut.label}

          </span>

        </div>

      </div>

      <div className="p-4 sm:p-6">

        <AnimationStatut statut={commande.statut} commandeId={commande.id} />

        {estEnLivraison && <CarteLivreur livreur={commande.livreur} />}

        <div className="mt-6">
          <button type="button" onClick={() => setDetailsOuverts((ouvert) => !ouvert)} aria-expanded={detailsOuverts} className="flex w-full items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/[0.025] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
            <span className="flex min-w-0 items-center gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><UtensilsCrossed size={20} /></span><span className="min-w-0"><span className="block text-sm font-extrabold text-ink">Détails de la commande</span><span className="mt-1 block text-xs text-ink-light">{totalArticles} article{totalArticles === 1 ? '' : 's'} · {articles.length} référence{articles.length === 1 ? '' : 's'}</span></span></span><ChevronDown size={19} className="shrink-0 text-primary" />
          </button>
          {detailsOuverts && (
            <section id="details-commande" className="mt-3 overflow-hidden rounded-2xl border border-line bg-surface animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between gap-3 border-b border-line bg-primary/[0.045] px-4 py-3">
                <div>
                  <h3 className="text-sm font-extrabold text-ink">Récapitulatif de la commande</h3>
                  <p className="mt-1 text-xs text-ink-light">Commande #{commande.id} · {totalArticles} article{totalArticles === 1 ? '' : 's'}</p>
                </div>
                <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">{formatPrix(commande.total)}</span>
              </div>
              <div className="space-y-2 p-3 sm:p-4">
                {articles.length ? articles.map((article, index) => (
                  <div key={article.id || `${article.nom}-${index}`} className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-surface-alt">
                      {(article.photo || article.image || article.imageUrl || article.photoUrl) ? <img src={article.photo || article.image || article.imageUrl || article.photoUrl} alt={article.nom || 'Article commandé'} loading="lazy" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-primary"><UtensilsCrossed size={21} /></div>}
                      <span className="absolute bottom-1 right-1 rounded-md bg-white/95 px-1.5 py-0.5 text-[10px] font-black text-ink">×{article.quantite || 1}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-extrabold text-ink">{article.nom || 'Article'}</p>
                      <p className="mt-1 text-xs text-ink-light">{formatPrix(article.prix)} / unité</p>
                    </div>
                    <p className="shrink-0 text-sm font-black text-ink">{formatPrix(Number(article.prix || 0) * Number(article.quantite || 1))}</p>
                  </div>
                )) : <p className="rounded-xl border border-dashed border-line p-4 text-sm text-ink-light">Le détail des articles n'est pas disponible.</p>}
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-line bg-surface-alt/50 px-4 py-3">
                <span className="text-sm font-semibold text-ink-light">Total à payer</span>
                <span className="text-lg font-black text-primary">{formatPrix(commande.total)}</span>
              </div>
            </section>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-primary/[0.06] p-4">

          <div>

            <p className="text-xs font-semibold text-ink-light">Total de la commande</p>

            <p className="mt-1 text-2xl font-black tracking-tight text-primary">{formatPrix(commande.total)}</p>

          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">

            <ShoppingBag size={21} />

          </div>

        </div>

      </div>

      <button

        type="button"

        onClick={onVoirToutes}

        className="group flex min-h-14 w-full items-center justify-between border-t border-line bg-surface px-4 py-4 text-left transition hover:bg-primary/[0.04] sm:px-6"

      >

        <span>

          <span className="block text-sm font-extrabold text-ink">Voir toutes mes commandes</span>

          <span className="mt-0.5 block text-xs text-ink-light">Retrouver une autre commande</span>

        </span>

        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:translate-x-1">

          <ChevronRight size={19} />

        </span>

      </button>

    </article>

  );

}

function LigneCommande({ commande, estActive, onSelectionner }) {

  const statut = getStatut(commande.statut);

  const palette = couleursStatut(statut.couleur);

  const articles = Array.isArray(commande.articles) ? commande.articles : [];

  const totalArticles = articles.reduce((total, article) => total + Number(article.quantite || 0), 0);

  return (

    <button

      type="button"

      onClick={() => onSelectionner(commande)}

      className={`group w-full rounded-2xl border p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99] ${

        estActive ? 'border-primary/40 bg-primary/[0.035] shadow-sm ring-1 ring-primary/10' : 'border-line bg-surface hover:border-primary/25'

      }`}

    >

      <div className="flex items-start gap-3">

        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${palette.fond} ${palette.texte}`}>

          <statut.Icone size={20} />

        </div>

        <div className="min-w-0 flex-1">

          <div className="flex flex-wrap items-center gap-2">

            <p className="text-sm font-extrabold text-ink">Commande #{commande.id}</p>

            {estActive && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-extrabold text-primary">Affichée</span>}

          </div>

          <p className="mt-1 text-xs text-ink-light">{tempsRelatif(commande.date)} · {totalArticles} article{totalArticles === 1 ? '' : 's'}</p>

          <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-extrabold ${palette.fond} ${palette.texte}`}>

            {statut.label}

          </span>

        </div>

        <div className="flex shrink-0 items-center gap-1 text-right">

          <span className="text-sm font-black text-primary">{formatPrix(commande.total)}</span>

          <ChevronRight size={16} className="text-ink-light transition group-hover:translate-x-0.5 group-hover:text-primary" />

        </div>

      </div>

    </button>

  );

}

export default function MesCommandes() {

  const { showToast } = useToast();

  const [vueToutes, setVueToutes] = useState(false);

  const [activeId, setActiveId] = useState(() => lireCommandeActiveId());

  const commandesTriees = useMemo(() => {

    return [...commandesMock].sort((a, b) => {

      const aDate = new Date(a.date || 0).getTime();

      const bDate = new Date(b.date || 0).getTime();

      return bDate - aDate;

    });

  }, []);

  const commandeActive = useMemo(() => {

    return commandesTriees.find((commande) => String(commande.id) === String(activeId)) || commandesTriees[0] || null;

  }, [commandesTriees, activeId]);

  useEffect(() => {

    if (commandeActive && String(commandeActive.id) !== String(activeId)) {

      setActiveId(String(commandeActive.id));

      sauvegarderCommandeActiveId(commandeActive.id);

    }

  }, [commandeActive, activeId]);

  const autresCommandes = commandesTriees.filter(

    (commande) => String(commande.id) !== String(commandeActive?.id)

  );

  const selectionnerCommande = (commande) => {

    setActiveId(String(commande.id));

    sauvegarderCommandeActiveId(commande.id);

    setVueToutes(false);

    showToast(`La commande #${commande.id} est maintenant affichée en priorité.`);

    window.scrollTo({ top: 0, behavior: 'smooth' });

  };

  return (

    <main className="commandes-page min-h-screen overflow-x-hidden bg-surface-alt pb-28 text-ink" style={{ backgroundImage: "radial-gradient(ellipse at top, rgba(14, 116, 144, 0.055), transparent 48%)" }}>

      <style>{`

        @keyframes page-enter { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }

        @keyframes pulse-soft { 0%,100% { transform: scale(1); opacity: .65; } 50% { transform: scale(1.06); opacity: 1; } }

        @keyframes ping-soft { 0% { transform: scale(.8); opacity: .85; } 80%,100% { transform: scale(1.8); opacity: 0; } }

        @keyframes hourglass-sway { 0%,42%,100% { transform: rotate(0deg); } 48%,88% { transform: rotate(12deg); } }

        @keyframes pot-sway { 0%,100% { transform: translateY(0) rotate(-2deg); } 50% { transform: translateY(-3px) rotate(2deg); } }

        @keyframes steam-rise { 0% { opacity: 0; transform: translateY(8px) scale(.7); } 35% { opacity: .75; } 100% { opacity: 0; transform: translateY(-15px) scale(1.15); } }

        @keyframes bubble-rise { 0% { opacity: 0; transform: translateY(4px) scale(.65); } 45% { opacity: .9; } 100% { opacity: 0; transform: translateY(-13px) scale(1.15); } }

        @keyframes truck-drive { 0%,100% { transform: translateX(-3px); } 50% { transform: translateX(4px); } }

        @keyframes road-move { from { transform: translateX(-8px); opacity: .25; } to { transform: translateX(8px); opacity: .75; } }

        @keyframes success-pop { 0% { transform: scale(.7); opacity: 0; } 65% { transform: scale(1.12); opacity: 1; } 100% { transform: scale(1); } }

        .commande-card-enter { animation: page-enter .48s cubic-bezier(.2,.75,.25,1) both; }

        .animate-pulse-soft { animation: pulse-soft 2.2s ease-in-out infinite; }

        .animate-ping-soft { animation: ping-soft 2s ease-out infinite; }

        .hourglass-sway { animation: hourglass-sway 4s ease-in-out infinite; }

        .pot-sway { animation: pot-sway 1.8s ease-in-out infinite; }

        .steam { position: absolute; top: 18px; width: 5px; height: 16px; border-radius: 999px; background: currentColor; opacity: 0; filter: blur(.3px); animation: steam-rise 1.6s ease-in infinite; }

        .steam-one { left: calc(50% - 14px); animation-delay: 0s; }

        .steam-two { left: 50%; animation-delay: .35s; }

        .steam-three { left: calc(50% + 14px); animation-delay: .7s; }

        .pot-bubble { position: absolute; bottom: 9px; width: 5px; height: 5px; border-radius: 999px; background: currentColor; opacity: 0; animation: bubble-rise 1.4s ease-out infinite; }

        .bubble-one { left: 10px; animation-delay: .1s; }

        .bubble-two { left: 22px; width: 4px; height: 4px; animation-delay: .55s; }

        .bubble-three { right: 10px; width: 6px; height: 6px; animation-delay: .85s; }

        .delivery-truck { animation: truck-drive 1.5s ease-in-out infinite; }

        .road-line { position: absolute; bottom: 30px; left: 22px; width: 84px; border-top: 2px dashed currentColor; opacity: .35; animation: road-move 1.2s linear infinite alternate; }

        .success-pop { animation: success-pop .55s cubic-bezier(.2,.8,.2,1) both; }
        .commande-card-enter { will-change: transform, opacity; }
        .commandes-page button:focus-visible, .commandes-page a:focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }

        @media (prefers-reduced-motion: reduce) {

          .commandes-page *, .commandes-page *::before, .commandes-page *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; scroll-behavior: auto !important; transition-duration: .01ms !important; }

        }

      `}</style>

      <div className="mx-auto max-w-4xl px-4 pt-5 sm:px-6 sm:pt-8 lg:px-8">

        {vueToutes ? (

          <>

            <div className="mb-5 flex items-center gap-3">

              <button

                type="button"

                onClick={() => setVueToutes(false)}

                aria-label="Retour à la commande suivie"

                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-line bg-surface text-ink shadow-sm transition hover:border-primary hover:text-primary active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"

              >

                <ArrowLeft size={19} />

              </button>

              <div className="min-w-0 flex-1">

                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary">Votre historique</p>

                <h1 className="text-xl font-black tracking-tight text-ink sm:text-2xl">Toutes mes commandes</h1>

                <p className="mt-0.5 text-xs text-ink-light">{commandesTriees.length} commande{commandesTriees.length === 1 ? '' : 's'} au total</p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">

                <Receipt size={21} />

              </div>

            </div>

            {commandesTriees.length ? (

              <div className="space-y-3">

                {commandesTriees.map((commande, index) => (

                  <div key={commande.id} className="commande-card-enter" style={{ animationDelay: `${Math.min(index * 45, 300)}ms` }}>

                    <LigneCommande

                      commande={commande}

                      estActive={String(commande.id) === String(commandeActive?.id)}

                      onSelectionner={selectionnerCommande}

                    />

                  </div>

                ))}

              </div>

            ) : (

              <EtatVide />

            )}

          </>

        ) : (

          <>

            <Header titre="Mes commandes" sousTitre="Suivez votre commande, de la cuisine à votre porte." />

            <section className="commande-card-enter relative mt-5 overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-br from-primary via-primary to-primary-dark p-5 text-white shadow-[0_22px_55px_-24px_rgba(15,23,42,0.48)] sm:p-7">

              <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full border-[24px] border-white/[0.07]" />

              <div className="pointer-events-none absolute -bottom-12 right-24 h-32 w-32 rounded-full bg-white/[0.06]" />

              <div className="relative flex items-center gap-3">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/15 shadow-inner">

                  <ShoppingBag size={23} />

                </div>

                <div className="min-w-0 flex-1">

                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">Votre espace personnel</p>

                  <h2 className="mt-1 text-lg font-black sm:text-xl">Un suivi simple et clair</h2>

                </div>

                <Sparkles size={19} className="shrink-0 text-white/80" />

              </div>

              <div className="relative mt-5 flex items-end justify-between gap-3">

                <div>

                  <p className="text-xs text-white/70">Commandes enregistrées</p>

                  <p className="mt-1 text-3xl font-black">{commandesTriees.length}</p>

                </div>



              </div>

            </section>

            {commandeActive ? (

              <section className="mt-7">

                <div className="mb-4 flex items-end justify-between gap-3">

                  <div>

                    <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary">Suivi personnalisé</p>

                    <h2 className="mt-1 text-xl font-black tracking-tight sm:text-2xl">Votre commande</h2>

                    <p className="mt-1 max-w-sm text-xs leading-5 text-ink-light">

                      La dernière commande que vous avez consultée reste affichée ici.

                    </p>

                  </div>

                  {commandesTriees.length > 1 && (

                    <button

                      type="button"

                      onClick={() => setVueToutes(true)}

                      className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-2.5 text-xs font-extrabold text-primary shadow-sm transition hover:border-primary/30 hover:bg-primary/[0.04] active:scale-95 sm:text-sm"

                    >

                      Voir toutes

                      <ChevronDown size={16} />

                    </button>

                  )}

                </div>

                <CommandeActive commande={commandeActive} onVoirToutes={() => setVueToutes(true)} />

              </section>

            ) : (

              <EtatVide />

            )}

            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-line bg-surface p-4">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">

                <Sparkles size={19} />

              </div>

              <div>

                <p className="text-sm font-extrabold text-ink">Besoin d'un renseignement ?</p>

                <p className="mt-1 text-xs leading-5 text-ink-light">

                  Consultez le statut de votre commande. Lorsqu'elle est en livraison, les coordonnées du livreur sont affichées si elles sont fournies par le système.

                </p>

              </div>

            </div>

            <div className="mt-6 flex items-center justify-center gap-2 pb-2 text-center text-[11px] text-ink-light">

              <UtensilsCrossed size={14} />

              <span>Merci de votre confiance et bon appétit !</span>

            </div>

          </>

        )}

      </div>

    </main>

  );

}

function EtatVide() {

  return (

    <div className="commande-card-enter mt-5 rounded-3xl border border-line bg-surface px-5 py-12 text-center shadow-sm">

      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">

        <Receipt size={30} />

      </div>

      <h3 className="mt-4 text-lg font-black text-ink">Aucune commande pour le moment</h3>

      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-ink-light">

        Vos commandes apparaîtront ici dès que vous aurez passé votre première commande.

      </p>

    </div>

  );

}
