# 1. Configuration du test

| Élément | Valeur |
|--------|--------|
| Route testée | POST /orders |
| Nombre total de requêtes | 350 |
| Durée du test | 5 secondes |
| Taux de requêtes (req/sec) | 70 (cible), 60 (réel) |
| Nombre d'utilisateurs simulés | 350 |

---

# 2. Résultats globaux

## Temps de réponse

| Indicateur | Valeur | Interprétation |
|-----------|--------|----------------|
| Min | 312 ms | Temps minimal pour les requêtes les plus rapides |
| Moyenne | 426 ms | Dégradation de 36% par rapport au minimum |
| Médiane | 383.8 ms | 50% des requêtes sont sous 384 ms |
| p95 | 645.6 ms | 5% des requêtes subissent plus de 645 ms de latence |
| p99 | 804.5 ms | 1% des requêtes subissent plus de 800 ms de latence |
| Max | 969 ms | La requête la plus lente approche 1 seconde |

### Questions

- Les temps de réponse sont-ils **stables** ?
  - Non. L'écart entre le min (312 ms) et le max (969 ms) est de 3.1x, indiquant une instabilité sous charge.

- Y a-t-il une grande différence entre moyenne et p95 ?
  - Oui. Le p95 (645.6 ms) est 1.5x supérieur à la moyenne (426 ms), ce qui montre que les requêtes les plus lentes dégradent significativement les performances.

- Certaines requêtes sont-elles **beaucoup plus lentes que les autres** ?
  - Oui. Le p99 (804.5 ms) est 2.6x supérieur au minimum, et le max atteint 969 ms.

---

## Erreurs

| Indicateur | Valeur |
|-----------|--------|
| Nombre d'erreurs | 0 |
| Taux de succès (%) | 100% |

### Questions

- Y a-t-il des erreurs ?
  - Non, aucune erreur HTTP détectée.

- Si oui, à quel moment apparaissent-elles ?
  - Non applicable.

- Le système reste-t-il fiable sous charge ?
  - Oui, toutes les requêtes ont été traitées avec succès, mais avec une dégradation des temps de réponse.

---

## Débit

| Indicateur | Valeur |
|-----------|--------|
| Requests/sec | 60 (débit effectif mesuré) |
| Total requêtes | 350 |

### Questions

- Le système tient-il le débit demandé ?
  - Partiellement. Le débit cible était de 70 req/sec, mais le système n'a pu maintenir que 60 req/sec en moyenne.

- Observe-t-on un ralentissement progressif ?
  - Oui. Les métriques intermédiaires montrent une dégradation entre la première période (mean 378.5 ms) et la deuxième période (mean 578.7 ms).

---

# 3. Analyse du comportement

## Évolution dans le temps

- Le temps de réponse :
  - [ ] reste stable
  - [x] augmente
  - [x] fluctue fortement

Décrivez ce que vous observez :

Le test montre deux phases distinctes :

1. Première période (0-5s) : 267 réponses succès, temps moyen à 378.5 ms, p99 à 468.8 ms, aucune erreur. Le système répond correctement avec une latence acceptable.

2. Deuxième période (5-7s) : 83 réponses supplémentaires, mais le temps moyen augmente à 578.7 ms (+53%), le p99 atteint 907 ms, et le débit chute de 70 à 47 req/sec. Cette dégradation indique que le système commence à saturer.

Cette évolution suggère un épuisement progressif des ressources : pool de connexions base de données saturé, file d'attente d'événements Node.js qui s'allonge, ou requêtes SQL concurrentes qui se bloquent mutuellement.

Le point de dégradation se situe approximativement entre 50 et 70 req/sec sur cette configuration matérielle.