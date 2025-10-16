# Architecture d'Authentification Directus - Kylimmo

## Problème résolu

### Ancien système (avec problèmes CORS)

```
Navigateur → SecureApiClient (fetch côté client) → Proxy Next.js → Directus
                    ❌ Problème CORS
```

### Nouveau système (sans CORS)

```
Navigateur → API Route Next.js → Directus
          ✅ Pas de CORS (tout côté serveur)
```

## Architecture

### 1. API Route d'Authentification

**Fichier** : `/pages/api/auth/login.ts`

-   **Rôle** : Point d'entrée côté serveur pour l'authentification
-   **Méthode** : POST uniquement
-   **Payload** : `{ email, password }`
-   **Fonctionnement** :
    1. Reçoit les identifiants depuis le client
    2. Appelle directement l'API Directus (côté serveur)
    3. Retourne la réponse Directus (tokens ou erreurs)

**Avantages** :

-   ✅ Pas de problèmes CORS
-   ✅ Appels serveur vers serveur
-   ✅ Préserve la structure d'erreur Directus
-   ✅ Fonctionne de manière fiable

### 2. Fonction loginUser

**Fichier** : `/src/lib/directus-api.ts`

-   **Rôle** : Interface côté client pour l'authentification
-   **Appel** : `fetch('/api/auth/login')` (API route locale)
-   **Gestion d'erreur** :
    -   Détecte le code `INVALID_CREDENTIALS`
    -   Traduit les messages en français
    -   Retourne un objet standardisé

### 3. Contexte d'Authentification

**Fichier** : `/src/contexts/AuthContext.tsx`

-   **Rôle** : Gestion de l'état d'authentification global
-   **Fonctionnalités** :
    -   Appelle `loginUser()`
    -   Stocke les tokens dans localStorage
    -   Affiche les toasts de succès/erreur
    -   Gère la session utilisateur

## Flux d'Authentification Complet

### Connexion réussie

```
1. Utilisateur saisit email/password
2. loginUser() appelle /api/auth/login
3. API route appelle Directus (serveur vers serveur)
4. Directus retourne { data: { access_token, refresh_token, expires } }
5. AuthContext stocke les tokens
6. Toast de succès affiché
7. Redirection vers la page d'accueil
```

### Connexion échouée

```
1. Utilisateur saisit email/password incorrect
2. loginUser() appelle /api/auth/login
3. API route appelle Directus
4. Directus retourne { errors: [{ code: "INVALID_CREDENTIALS" }] }
5. API route transmet l'erreur (status 401)
6. loginUser() détecte le code d'erreur
7. AuthContext affiche un toast d'erreur
8. Message : "Email ou mot de passe incorrect"
```

## Codes d'erreur gérés

| Code Directus         | Message affiché                   |
| --------------------- | --------------------------------- |
| `INVALID_CREDENTIALS` | Email ou mot de passe incorrect   |
| `INVALID_PAYLOAD`     | Données de connexion invalides    |
| `TOO_MANY_REQUESTS`   | Trop de tentatives de connexion   |
| `401 (sans code)`     | Email ou mot de passe incorrect   |
| `404`                 | Service de connexion indisponible |
| `429`                 | Trop de tentatives de connexion   |

## Utilisation pour d'autres API Directus

### Principe général

Pour toutes les futures API calls côté client vers Directus :

1. **Créer une API route Next.js** : `/pages/api/[nom-endpoint].ts`
2. **Appeler l'API route depuis le client** : `fetch('/api/[nom-endpoint]')`
3. **L'API route appelle Directus** : `fetch(directusUrl)`

### Exemple : Récupérer les propriétés favorites

**1. Créer l'API route** : `/pages/api/favorites/list.ts`

```typescript
export default async function handler(req, res) {
    const token = req.headers.authorization;
    const response = await fetch(`${directusUrl}/items/favorites`, {
        headers: { Authorization: token },
    });
    const data = await response.json();
    return res.json(data);
}
```

**2. Appeler depuis le client**

```typescript
const response = await fetch("/api/favorites/list", {
    headers: { Authorization: `Bearer ${token}` },
});
const favorites = await response.json();
```

## Quand utiliser SecureApiClient vs API Routes

### SecureApiClient (pour SSR uniquement)

-   ✅ Utiliser dans `getServerSideProps`
-   ✅ Utiliser dans `getStaticProps`
-   ❌ NE PAS utiliser côté client (navigateur)

### API Routes (pour le client)

-   ✅ Utiliser pour les appels authentifiés
-   ✅ Utiliser pour éviter CORS
-   ✅ Utiliser pour la connexion, déconnexion, etc.

## Avantages de cette architecture

1. **Pas de CORS** : Tous les appels passent par Next.js
2. **Sécurité** : Les tokens ne transitent jamais directement depuis le navigateur vers Directus
3. **Fiabilité** : Aucun problème "Failed to fetch"
4. **Maintenabilité** : Structure claire et facile à étendre
5. **Performance** : Possibilité de mettre en cache côté serveur

## Variables d'environnement requises

```bash
NEXT_PUBLIC_DIRECTUS_API_URL=https://ki-backoffice.eyoboue.dev:8143
NEXT_PUBLIC_DIRECTUS_ASSETS_URL=https://ki-backoffice.eyoboue.dev:8143/assets
```

## Debugging

### Logs utiles

```
[AUTH API] Attempting login to: https://ki-backoffice.eyoboue.dev:8143/auth/login
[DIRECTUS API] Attempting login for: user@example.com
[DIRECTUS API] Login successful
```

### En cas d'erreur

1. Vérifier que le serveur Next.js tourne sur le bon port (3100)
2. Vérifier les variables d'environnement
3. Vérifier les logs côté serveur (terminal)
4. Vérifier les logs côté client (console du navigateur)
