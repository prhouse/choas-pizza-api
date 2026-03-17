# ADR 0001 : Gestion du code promotionnel FREEPIZZA

**Date :** 2026-03-16
**Statut :** Accepté

## Contexte
Le service client est inondé d'appels furieux. Le code promotionnel FREEPIZZA, censé rendre la commande de pizza 
totalement gratuite (0€), facture systématiquement 10€ au client ! Trouvez pourquoi la réduction est annulée au 
dernier moment, et corrigez cette aberration.

Le code initial vérifiait `if (promoCode === "FREEPIZZA") { total = 0; }` et un autre bout de code assignait `total = 10` 
si `total === 0`. Ce comportement ne permettait pas de rendre la pizza gratuite.

De plus, l'utilisation de la chaîne de caractères magique `"FREEPIZZA"` éparpillée rendait le code fragile aux fautes de frappe.

## Décision
Dans un objectif d'amélioration du code :
1. **Extraction en constante :** Extraction de la chaîne magique `"FREEPIZZA"` dans un objet dictionnaire exporté/commun `PromoCodes.FREE_PIZZA` pour standardiser son utilisation.
2. **Clarification du comportement (Fallback) :** Restructuration des conditions pour introduire un booléen `useFreePizza = true` lors de l'application du code promotionnel. Cela permet de distinguer un montant total à 0€ (grâce à la promotion) d'un montant erroné à 0€ qui nécessiterait l'application du tarif par défaut (fallback).

## Conséquences

### Positives
- **Lisibilité et intentionnalité :** Le code décrit désormais l'intention derrière la gratuité, séparant un problème d'absence de prix lié à l'application du code de promotion.
- **Robustesse du typage :** En s'appuyant sur l'énumération `PromoCodes.FREE_PIZZA`, les erreurs de frappe lors des évolutions futures sont éliminées.
- **Suppression des effets de bord :** La pizza rendue volontairement gratuite (0€) n'est plus remise à 10€ par la règle historique (legacy fallback).

### Négatives
- Ajout d'une constante et d'un état intermédiaire (le booléen `useFreePizza`) pouvant sembler simple pour des petits scripts, mais obligatoires pour se brancher au code legacy environnant.