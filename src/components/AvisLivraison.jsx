import { useEffect, useState } from 'react';
import { Star, CheckCircle2 } from 'lucide-react';
import { donnerAvis, getAvis } from '../api/commandes';
import { jetonDe } from '../utils/suivi';
import { useToast } from '../context/ToastContext';

// Note de la livraison par le client (1 a 5 etoiles, commentaire facultatif),
// une fois la commande livree. Seulement sur l'appareil qui a passe la
// commande (jeton de suivi). Un seul avis par commande : deja donne -> merci.
const CLE = (id) => `senyummies_avis_${id}`;
const LIBELLES = ['', 'Très décevante', 'Décevante', 'Correcte', 'Bonne', 'Excellente'];

function avisLocal(id) {
  try {
    const a = JSON.parse(localStorage.getItem(CLE(id)));
    return a && a.note ? a : null;
  } catch {
    return null;
  }
}

function memoriser(id, avis) {
  try {
    localStorage.setItem(CLE(id), JSON.stringify({ note: avis.note, commentaire: avis.commentaire || null }));
  } catch {
    // stockage indisponible : le serveur garde l'avis
  }
}

export function peutNoter(commande) {
  return commande?.statut === 'LIVREE' && commande?.mode === 'LIVRAISON' && Boolean(jetonDe(commande.id));
}

export default function AvisLivraison({ commande, compact = false }) {
  const { showToast } = useToast();
  const [etat, setEtat] = useState(() => (avisLocal(commande.id) ? 'merci' : 'chargement'));
  const [avis, setAvis] = useState(() => avisLocal(commande.id));
  const [note, setNote] = useState(0);
  const [survol, setSurvol] = useState(0);
  const [commentaire, setCommentaire] = useState('');

  useEffect(() => {
    if (etat !== 'chargement') return undefined;
    let annule = false;
    getAvis(commande.id, jetonDe(commande.id))
      .then((a) => {
        if (annule) return;
        memoriser(commande.id, a);
        setAvis(a);
        setEtat('merci');
      })
      .catch(() => !annule && setEtat('a-noter'));
    return () => { annule = true; };
  }, [commande.id, etat]);

  async function envoyer(event) {
    event.preventDefault();
    if (!note) return;
    setEtat('envoi');
    try {
      const a = await donnerAvis(commande.id, jetonDe(commande.id), { note, commentaire: commentaire.trim() || null });
      memoriser(commande.id, a);
      setAvis(a);
      setEtat('merci');
      showToast('Merci pour votre avis !', { type: 'succes' });
    } catch (err) {
      if (err.code === 'AVIS_DEJA_DONNE') {
        setEtat('merci');
        return;
      }
      setEtat('a-noter');
      showToast(err.message || 'Votre avis n’a pas pu être envoyé. Réessayez.', { type: 'erreur' });
    }
  }

  if (etat === 'chargement') return null;

  if (etat === 'merci') {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-success/10 px-4 py-3 text-sm">
        <CheckCircle2 size={20} className="shrink-0 text-success" aria-hidden="true" />
        <span className="min-w-0">
          <span className="font-semibold">Merci pour votre avis</span>
          {avis?.note ? (
            <span className="ml-1 inline-flex items-center gap-0.5 align-middle" aria-label={`${avis.note} étoiles sur 5`}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} size={14} aria-hidden="true" className={n <= avis.note ? 'fill-amber-400 text-amber-400' : 'text-line'} />
              ))}
            </span>
          ) : null}
        </span>
      </div>
    );
  }

  const affichee = survol || note;
  return (
    <form onSubmit={envoyer} className={`rounded-2xl border border-line bg-surface ${compact ? 'p-4' : 'p-5'}`}>
      <p className="font-semibold">Comment s’est passée votre livraison ?</p>
      <p className="mt-0.5 text-xs text-ink-light">Votre note aide le restaurant à récompenser ses livreurs.</p>
      <div className="mt-3 flex items-center gap-1" role="radiogroup" aria-label="Note de la livraison" onMouseLeave={() => setSurvol(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={note === n}
            aria-label={`${n} étoile${n > 1 ? 's' : ''} sur 5`}
            onClick={() => setNote(n)}
            onMouseEnter={() => setSurvol(n)}
            className="flex h-11 w-11 items-center justify-center rounded-full transition-transform active:scale-90"
          >
            <Star size={30} aria-hidden="true" className={n <= affichee ? 'fill-amber-400 text-amber-400' : 'text-line'} />
          </button>
        ))}
        <span className="ml-2 text-sm font-semibold text-ink-light" aria-live="polite">{LIBELLES[affichee]}</span>
      </div>
      {note > 0 && (
        <label className="mt-3 block">
          <span className="mb-1.5 block text-xs font-semibold text-ink-light">Un commentaire ? (facultatif)</span>
          <textarea
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value.slice(0, 300))}
            rows={2}
            maxLength={300}
            placeholder="Ponctualité, amabilité, état de la commande…"
            className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
          />
        </label>
      )}
      <button
        type="submit"
        disabled={!note || etat === 'envoi'}
        className="mt-3 flex min-h-12 w-full items-center justify-center rounded-2xl bg-primary px-4 text-sm font-semibold text-white disabled:opacity-50"
      >
        {etat === 'envoi' ? 'Envoi…' : 'Envoyer mon avis'}
      </button>
    </form>
  );
}
