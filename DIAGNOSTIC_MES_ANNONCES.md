# Diagnostic et Test - Page "Mes annonces"

## Modifications apportées ✅

### 1. Suppression du Header avec fond flou

-   ✅ Retiré le composant `Header` de la page `my-listings.tsx`
-   ✅ Conservé uniquement `PageNavbar` (comme sur la page détail)
-   ✅ Ajouté `bg-background` pour fond blanc propre
-   ✅ ViewToggle déplacé dans la section principale

### 2. Amélioration des logs de debugging

-   ✅ Ajout de logs détaillés dans `/api/user/properties`
-   ✅ Affichage de l'URL complète de la requête
-   ✅ Affichage du status HTTP
-   ✅ Affichage de la réponse JSON complète

## Structure actuelle de la page

```
/my-listings
├── PageNavbar (breadcrumbs)
└── Main content
    ├── En-tête (titre + compteur)
    ├── Contrôles (ViewToggle + Bouton Nouvelle annonce)
    └── Liste des annonces (grille ou liste)
```

## Filtre Directus utilisé

**URL actuelle** :

```
https://ki-backoffice.eyoboue.dev:8143/items/real_estates?filter[user_created][_eq]=${userId}&fields=*,images.directus_files_id.*&sort=-date_created
```

**Syntaxe** : `filter[user_created][_eq]=${userId}`

## Tests à effectuer

### 1. Test visuel de la page

✅ Vérifier que la page n'a plus de fond flou
✅ Vérifier que le header est blanc et simple (PageNavbar uniquement)
✅ Vérifier que le design ressemble à la page détail

### 2. Test du filtre Directus

**Dans les logs de la console du navigateur**, vous devriez voir :

```
[DIRECTUS API] Fetching properties for user: <USER_ID>
```

**Dans les logs du terminal Next.js**, vous devriez voir :

```
[USER PROPERTIES API] Fetching properties for user: <USER_ID>
[USER PROPERTIES API] Request URL: https://...
[USER PROPERTIES API] Response status: 200
[USER PROPERTIES API] Response data: { ... }
[USER PROPERTIES API] Found X properties for user <USER_ID>
```

### 3. Si le filtre ne fonctionne toujours pas

**Vérifications à faire** :

1. **Vérifier l'ID utilisateur dans les logs** :

    - L'ID utilisateur est-il correct ?
    - Est-ce le même ID que celui utilisé lors de la création des annonces ?

2. **Tester directement avec curl** :

    ```bash
    curl -H "Authorization: Bearer <YOUR_TOKEN>" \
    "https://ki-backoffice.eyoboue.dev:8143/items/real_estates?filter[user_created][_eq]=<USER_ID>&fields=*"
    ```

3. **Vérifier le nom du champ dans Directus** :

    - Se connecter à l'admin Directus
    - Aller dans la collection `real_estates`
    - Vérifier le nom exact du champ qui stocke l'utilisateur créateur
    - Possibilités : `user_created`, `owner`, `created_by`, `author`

4. **Essayer d'autres syntaxes de filtre** :

    **Option A** : Sans `_eq` (filtre simple)

    ```
    filter[user_created]=${userId}
    ```

    **Option B** : Avec `_in` (tableau)

    ```
    filter[user_created][_in]=${userId}
    ```

    **Option C** : JSON encode

    ```javascript
    const filter = { user_created: { _eq: userId } };
    const url = `${directusUrl}/items/real_estates?filter=${JSON.stringify(filter)}`;
    ```

## Solutions alternatives si le filtre ne fonctionne pas

### Solution 1 : Vérifier toutes les annonces et filtrer côté serveur

Modifier `/api/user/properties.ts` pour récupérer toutes les annonces et filtrer :

```typescript
// Récupérer toutes les annonces
const response = await fetch(`${directusUrl}/items/real_estates?fields=*,images.directus_files_id.*&sort=-date_created`, { headers: { Authorization: authHeader } });

const allData = await response.json();

// Filtrer côté serveur
const userProperties = allData.data.filter((item) => item.user_created === userId);

return res.status(200).json({ data: userProperties });
```

### Solution 2 : Utiliser le champ relationnel

Si `user_created` est une relation, peut-être faut-il filtrer sur `user_created.id` :

```
filter[user_created][id][_eq]=${userId}
```

## Informations utiles

**URL de l'API Directus** : `https://ki-backoffice.eyoboue.dev:8143`
**Collection** : `real_estates`
**Champ filtré** : `user_created`

## Prochaines étapes

1. Lancer l'application : `npm run dev`
2. Se connecter avec un utilisateur
3. Créer une ou plusieurs annonces
4. Aller sur "Mes annonces"
5. Vérifier les logs dans le terminal et la console
6. Partager les logs complets si le problème persiste

## Logs à fournir en cas de problème

Copiez et partagez ces informations :

```
1. User ID utilisé :
2. URL de la requête API :
3. Status HTTP de la réponse :
4. Données de la réponse (extrait) :
5. Nombre d'annonces trouvées :
6. Nom du champ user_created dans Directus (à vérifier dans l'admin) :
```
