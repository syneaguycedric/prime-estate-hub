# Test et Diagnostic - Page "Mes annonces"

## Problème identifié

Le filtre `user_created` ne fonctionne pas correctement pour récupérer les annonces de l'utilisateur connecté.

## Solution de debugging mise en place

J'ai modifié `/api/user/properties.ts` pour :

1. **Récupérer d'abord toutes les annonces** (limite 5) pour voir la structure des données
2. **Afficher le champ `user_created`** d'un échantillon d'annonces
3. **Comparer avec l'ID utilisateur** recherché
4. **Tester le filtre** et voir ce qui se passe

## Instructions de test

### 1. Lancer l'application

```bash
npm run dev
```

### 2. Se connecter et créer une annonce

1. Connectez-vous avec un utilisateur
2. Créez une annonce via le formulaire
3. Notez l'ID utilisateur affiché dans les logs

### 3. Aller sur "Mes annonces"

1. Cliquez sur "Mon compte" → "Mes annonces"
2. Regardez les logs dans le terminal

## Logs à analyser

Dans le terminal, vous devriez voir :

```
[USER PROPERTIES API] Fetching properties for user: <USER_ID>
[USER PROPERTIES API] Step 1: Fetching all properties to check structure...
[USER PROPERTIES API] All properties URL: https://...
[USER PROPERTIES API] All properties sample: { ... }
[USER PROPERTIES API] Sample user_created field: <VALUE>
[USER PROPERTIES API] User ID we are looking for: <USER_ID>
[USER PROPERTIES API] Step 2: Trying filter...
[USER PROPERTIES API] Filter URL: https://...
[USER PROPERTIES API] Response status: 200
[USER PROPERTIES API] Found X properties for user <USER_ID>
```

## Points à vérifier

### 1. Structure du champ `user_created`

Le champ `user_created` peut être :

-   **String simple** : `"f62ea310-5996-40a4-8e0a-d526c6e5944f"`
-   **Objet relation** : `{ "id": "f62ea310-5996-40a4-8e0a-d526c6e5944f", "first_name": "John", ... }`

### 2. Correspondance des IDs

-   L'ID utilisateur dans les logs correspond-il à celui dans `user_created` ?
-   Y a-t-il des différences de format ?

### 3. Syntaxe du filtre Directus

Si le champ est un objet relation, il faut peut-être utiliser :

```
filter[user_created][id][_eq]=${userId}
```

## Solutions possibles

### Solution 1 : Si `user_created` est un objet relation

```typescript
const apiUrl = `${directusUrl}/items/real_estates?filter[user_created][id][_eq]=${userId}&fields=*,images.directus_files_id.*&sort=-date_created`;
```

### Solution 2 : Si le champ a un nom différent

Vérifier dans l'admin Directus le nom exact du champ :

-   `user_created` ✅ (standard)
-   `owner`
-   `created_by`
-   `author`

### Solution 3 : Filtrage côté serveur

Si le filtre Directus ne fonctionne pas, filtrer côté serveur :

```typescript
// Récupérer toutes les annonces
const allResponse = await fetch(`${directusUrl}/items/real_estates?fields=*,images.directus_files_id.*&sort=-date_created`, {
    headers: { Authorization: authHeader },
});

const allData = await allResponse.json();
const userProperties = allData.data.filter((item) => {
    // Adapter selon la structure réelle
    if (typeof item.user_created === "string") {
        return item.user_created === userId;
    } else if (item.user_created && typeof item.user_created === "object") {
        return item.user_created.id === userId;
    }
    return false;
});

return res.status(200).json({ data: userProperties });
```

## Informations à partager

Après avoir testé, partagez ces informations :

1. **Structure du champ `user_created`** (extrait des logs)
2. **ID utilisateur recherché** vs **ID dans user_created**
3. **Nombre d'annonces trouvées** avec le filtre
4. **Nombre d'annonces créées** par l'utilisateur

## Prochaines étapes

1. **Testez** avec les instructions ci-dessus
2. **Analysez** les logs pour comprendre la structure
3. **Partagez** les informations pour que je puisse corriger le filtre
4. **Je corrigerai** le code selon la structure réelle de vos données Directus

Le problème est probablement dans la syntaxe du filtre Directus ou dans la structure du champ `user_created`. Une fois qu'on aura les logs, on pourra corriger définitivement !
