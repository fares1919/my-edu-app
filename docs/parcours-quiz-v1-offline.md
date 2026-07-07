# Parcours de quiz (V1 — offline)

## 1. Objectif

Décrire le flux complet d'une session de quiz, écran par écran et question par question, avec les états, les transitions, les règles de calcul et les cas limites. Ce parcours est purement offline : aucune donnée ne transite par un serveur. La justesse de chaque réponse est calculée au moment de la réponse, et le score final reflète réellement les bonnes réponses.

## 2. Préconditions

Un profil est actif. Au moins un quiz est disponible pour le niveau du profil et la matière choisie. Les questions du quiz sont chargées dans l'ordre via l'index dédié. L'application fonctionne sans connexion.

## 3. Vue d'ensemble du flux

Le parcours enchaîne cinq étapes : sélection du quiz depuis la bibliothèque, initialisation de la session, boucle de questions, finalisation, puis écran de résultat. À tout moment, l'utilisateur peut abandonner, avec une règle explicite sur le sort de la session.

Bibliothèque → Initialisation session → [ Question → Réponse → Feedback → Question suivante ] → Finalisation → Résultat.

## 4. Étape 1 — Sélection du quiz

L'élève arrive depuis la bibliothèque, après avoir choisi un niveau et une matière. Le niveau est pré-rempli depuis le profil actif. La liste des quiz de la matière s'affiche, avec pour chaque quiz un titre lisible et, si utile, le nombre de questions ou la durée. L'élève sélectionne un quiz.

États possibles : liste chargée, aucun quiz pour la matière (état vide invitant à importer un CSV), erreur de chargement (message clair et action de retour).

## 5. Étape 2 — Initialisation de la session

À la sélection, l'application crée une session rattachée au profil actif et au quiz, avec l'horodatage de début, le niveau, la matière et le nombre total de questions. Les propositions de chaque question sont mélangées pour cette session, dans un ordre différent des tentatives précédentes, tout en préservant l'identité de la réponse correcte. La première question s'affiche.

Règle : le mélange se fait à l'initialisation de la session, pas à chaque affichage, pour que l'ordre reste stable pendant la question.

## 6. Étape 3 — Boucle de questions

### 6.1 Affichage d'une question

Chaque question affiche le numéro de la question, la barre de progression qui avance dans le sens RTL, le minuteur, l'énoncé, et quatre propositions mélangées. Le minuteur démarre automatiquement, avec la durée propre à la question si elle existe, sinon la durée par défaut du quiz selon le cycle. Une seule proposition est sélectionnable.

### 6.2 Sélection d'une réponse

Quand l'élève sélectionne une proposition, l'application arrête le minuteur, enregistre le temps passé, détermine la justesse en comparant la proposition choisie à la réponse correcte, et enregistre la réponse de session avec sa justesse calculée. La justesse n'est jamais laissée à une valeur par défaut.

### 6.3 Feedback immédiat

Le feedback s'affiche immédiatement, combinant toujours trois canaux : couleur, icône et texte. Une bonne réponse est signalée en vert avec une coche et un libellé positif. Une mauvaise réponse est signalée en rouge avec une croix, un libellé, et l'explication si elle existe, sans ton culpabilisant. La bonne réponse peut être mise en évidence pour l'apprentissage.

### 6.4 Passage à la question suivante

Le passage s'effectue manuellement via un bouton, ou automatiquement après un court délai, selon la règle retenue. Une réponse validée n'est plus modifiable après passage à la question suivante. La barre de progression avance.

### 6.5 Cas du temps écoulé

Si le minuteur atteint zéro sans sélection, la question est comptée comme incorrecte, la réponse de session est enregistrée avec une justesse fausse et une proposition vide, un message de temps écoulé s'affiche, et l'application avance à la question suivante. Le feedback de temps écoulé reste non culpabilisant.

### 6.6 États de la boucle

Question en cours, réponse correcte, réponse incorrecte, temps écoulé, dernière question. À la dernière question, le libellé du bouton de passage indique la fin plutôt que la suite.

## 7. Étape 4 — Finalisation

Après la dernière question, l'application finalise la session. Elle calcule le nombre de bonnes réponses à partir des justesses réellement enregistrées, le nombre d'erreurs, le score en pourcentage entier dérivé du nombre de bonnes réponses sur le total, la durée totale comme somme des temps passés, et la moyenne du temps par question. Elle renseigne l'horodatage de fin et enregistre la session complète localement.

Règle critique : le score provient des justesses enregistrées, jamais d'une valeur par défaut, ce qui corrige le défaut historique où le score restait nul.

## 8. Étape 5 — Écran de résultat

L'écran de résultat s'affiche après la sauvegarde. Il présente le score final, le nombre de bonnes réponses, le nombre d'erreurs et le temps total, avec une animation de réussite autorisée à ce moment et respectant les préférences d'accessibilité. Il propose de rejouer le même quiz, de revenir à la bibliothèque, de consulter l'historique, et d'accéder aux médailles si un palier est atteint.

Règle : la session est enregistrée avant l'affichage, de sorte que l'historique et les statistiques sont immédiatement cohérents.

## 9. Cas d'abandon

Si l'élève quitte le quiz en cours, une règle explicite s'applique. En V1, la règle recommandée est de ne pas enregistrer de session partielle comme résultat officiel : une session non finalisée n'apparaît pas dans l'historique ni dans les statistiques, afin de ne pas fausser les moyennes. Une confirmation peut être demandée avant l'abandon pour éviter les sorties accidentelles.

## 10. Règles transverses du parcours

Le chrono démarre automatiquement à chaque question. Une seule proposition est sélectionnable à la fois. Le feedback est immédiat et repose toujours sur couleur, icône et texte. Le temps écoulé compte comme incorrect. La justesse est calculée à la réponse. Le score reflète les justesses enregistrées. Les propositions sont mélangées par session. Le sens RTL est respecté pour la progression et les icônes directionnelles. Aucune animation n'interrompt le quiz en cours. Tout fonctionne hors ligne et la session finalisée est sauvegardée localement.

## 11. Points de vigilance

Ne jamais laisser la justesse à une valeur par défaut. Ne jamais afficher un score incohérent avec les réponses. Ne pas remélanger les propositions à chaque rendu d'une même question. Ne pas enregistrer de session partielle comme résultat officiel. Toujours compter le temps écoulé comme incorrect. Toujours sauvegarder la session avant l'écran de résultat. Toujours respecter les préférences d'animation, y compris pour la célébration finale.
