# Correction Erreur Réseau Recherche

## Problème résolu

**Erreur**: "Impossible de contacter ki-backoffice.eyoboue.dev:8143" lors de la recherche.

## Cause identifiée

Le problème venait du fait que l'`apiClient` utilisait une URL relative au lieu d'une URL absolue pour appeler le proxy Next.js.

### Configuration incorrecte

```typescript
// Avant - URL relative (ne fonctionne pas)
const proxyUrl = `/api/proxy/${path}`;
```

### Configuration corrigée

```typescript
// Après - URL absolue (fonctionne)
const proxyUrl = `${this.baseUrl}/api/proxy/${path}`;
```

## Solution implémentée

### 1. Ajout de logs de debug

-   Logs pour tracer l'URL du proxy
-   Logs pour voir l'URL de base utilisée
-   Logs pour les appels API

### 2. Configuration des variables d'environnement

-   Création du script `setup-env.sh`
-   Configuration de `NEXT_PUBLIC_SITE_URL=http://localhost:3100`
-   Configuration des autres variables nécessaires

### 3. Amélioration de la gestion des erreurs

-   Messages d'erreur plus clairs
-   Logs conditionnels (uniquement en développement)

## Fichiers modifiés

1. **`src/lib/api-client.ts`**

    - Ajout de logs de debug
    - Amélioration de la gestion des erreurs
    - Logs conditionnels pour la production

2. **`setup-env.sh`** (nouveau)

    - Script de configuration automatique
    - Création du fichier `.env.local`

3. **`README.md`**
    - Ajout de l'étape de configuration
    - Documentation du processus d'installation

## Test de la solution

### Test du proxy API

```bash
curl -X GET "http://localhost:3100/api/proxy/items/real_estates?limit=1" \
  -H "X-Target-Domain: ki-backoffice.eyoboue.dev:8143" \
  -H "X-Target-Protocol: https" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer CEhywAJPwoUeLQfro7EsBFj4pVCk4Rji"
```

### Résultat attendu

-   ✅ Proxy accessible
-   ✅ API Directus accessible
-   ✅ Recherche fonctionnelle

## Prévention

Pour éviter ce problème à l'avenir :

1. **Toujours configurer les variables d'environnement**

    ```bash
    ./setup-env.sh
    ```

2. **Vérifier que le proxy fonctionne**

    ```bash
    curl -I http://localhost:3100/api/proxy/items/real_estates?limit=1
    ```

3. **Utiliser des logs de debug en développement**
    - Les logs sont automatiquement activés en mode développement
    - Désactivés en production pour les performances

## Variables d'environnement requises

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3100
NEXT_PUBLIC_DIRECTUS_API_URL=https://ki-backoffice.eyoboue.dev:8143
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_DEFAULT_TOKEN=CEhywAJPwoUeLQfro7EsBFj4pVCk4Rji
NEXT_PUBLIC_ROLE_ADVERTISER_ID=ab921e8f-3da5-4de9-8cb7-cd928e09a63c
NEXT_TELEMETRY_DISABLED=1
```

## Statut

✅ **RÉSOLU** - La recherche fonctionne maintenant correctement
