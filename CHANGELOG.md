# Changelog

Toutes les modifications de ce projet seront documentées dans ce fichier.


## [1.1.0] - 2026-03-18

### Ajouté
- Nouvelle route `PUT /orders/:id/status` permettant de mettre à jour l'avancement d'une commande (PREPARING, DELIVERING, DELIVERED).
- Route `GET /orders/user/:email` pour consulter l'historique des commandes associées à une adresse e-mail.
- Calcul et affichage de la TVA (10%) sur les tickets de commande (`totalTTC`).
- Documentation sur la performance dans `docs/performance.md`.
- Nouveaux tests de charge avec Artillery.

### Changé
- Refactoring complet de la logique de calcul des prix dans `orderManager.js` pour une meilleure maintenabilité.

### Corrigé
- Correction du bug sur le code promo `FREEPIZZA` qui n'était pas systématiquement appliqué.s
- Résolution des problèmes de latence lors de la prise
