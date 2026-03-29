# Rapport de Performance API - Chaos Pizza

INVESTIGATION

    Nous avons remarqué un temps anormalement long lors de nos test fait avec Artillery. En effet une simple commande mettait 300ms à se transmettre
    Metrique :
        nalyse des métriques (Avant correction - 500 requêtes)
        - **Temps de réponse moyen (mean) :** 339.7 ms
        - **Médiane :** 333.7 ms
        - **p95 (95% des requêtes servies sous) :** 391.6 ms
        - **p99 (99% des requêtes servies sous) :** 424.2 ms
    Apres enquête nous avons trouvé une ligne dans le code de orderManager.js dans la fonction : calculateOrderTotal(order), la ligne concerné était :
    await new Promise(resolve => setTimeout(resolve, 300)); cette ligne à surement était ajouté pour faire des tests et à oublier d'être retirée.

REFACTORISATION

    Nous avons donc update cette fonction en retirant cette ligne et nos performances ont bondit

VALIDATION

    Nous sommes passer à 183ms en moyenne donc nous avons diminué le temps de reponse d'environ 80%


    **Résultats de la nouvelle Release :**
    - **Temps de réponse moyen (mean) :** 53.5 ms
    - **Médiane :** 49.9 ms
    - **p95 :** 92.8 ms
    - **p99 :** 100.5 ms
    - **Amélioration mesurable et stabilité :** L'API encaisse désormais une charge beaucoup plus lourde sans dépasser les 100 ms dans 99% des cas. L'évolution dans le temps reste plate et prévisible.
