# Guide d'Intégration API Directus - Kylimmo

## 🚀 Configuration Actuelle

### Variables d'Environnement

```env
# Dans .env.local
NEXT_PUBLIC_DIRECTUS_API_URL=https://ki-backoffice.eyoboue.dev:8143
NEXT_PUBLIC_USE_MOCK_DATA=true  # true = données mockées, false = API réelle
NEXT_PUBLIC_DIRECTUS_ASSETS_URL=https://ki-backoffice.eyoboue.dev:8143/assets
```

## 🔧 États de l'Application

### 1. Mode Démo (Actuel)

-   **Configuration** : `NEXT_PUBLIC_USE_MOCK_DATA=true`
-   **Comportement** : Utilise les données mockées
-   **Indicateur** : 🔴 "Mode démo" dans le header
-   **Avantages** : Fonctionne sans dépendance externe

### 2. Mode API Directus

-   **Configuration** : `NEXT_PUBLIC_USE_MOCK_DATA=false`
-   **Comportement** : Appelle l'API Directus réelle
-   **Indicateur** : 🟢 "API Directus" si connecté, 🔴 "Mode démo" si erreur
-   **Fallback** : Bascule automatiquement vers les données mockées en cas d'erreur

## 🛠️ Comment Basculer Entre les Modes

### Basculer vers l'API Directus

```bash
# Modifier .env.local
NEXT_PUBLIC_USE_MOCK_DATA=false

# Redémarrer le serveur
npm run dev
```

### Revenir aux Données Mockées

```bash
# Modifier .env.local
NEXT_PUBLIC_USE_MOCK_DATA=true

# Redémarrer le serveur
npm run dev
```

## 🔍 Diagnostic des Problèmes

### Erreur "Failed to fetch"

**Causes possibles :**

1. **CORS** : L'API Directus ne permet pas les requêtes depuis localhost
2. **SSL** : Problème de certificat HTTPS
3. **API indisponible** : Serveur Directus hors ligne
4. **Réseau** : Problème de connectivité

**Solutions :**

1. Vérifier que l'API Directus est accessible : `https://ki-backoffice.eyoboue.dev:8143`
2. Configurer CORS sur le serveur Directus
3. Utiliser les données mockées en attendant

### Erreur "Failed to parse URL"

**Cause :** URL de base manquante
**Solution :** Vérifier `NEXT_PUBLIC_SITE_URL` dans `.env.local`

## 📊 Monitoring

### Logs de l'API

-   **Console navigateur** : `[DIRECTUS API]` messages
-   **Console serveur** : Erreurs détaillées
-   **Toasts** : Notifications utilisateur

### Indicateurs Visuels

-   **Header** : Badge de statut API
-   **Toasts** : Messages d'erreur/succès
-   **Fallback** : Basculement automatique vers mock

## 🎯 Tests Recommandés

### 1. Test avec Données Mockées

```bash
NEXT_PUBLIC_USE_MOCK_DATA=true
npm run dev
# Vérifier : Indicateur rouge "Mode démo"
```

### 2. Test avec API Directus

```bash
NEXT_PUBLIC_USE_MOCK_DATA=false
npm run dev
# Vérifier : Indicateur vert "API Directus" ou rouge "Mode démo"
```

### 3. Test de Fallback

```bash
# Forcer une erreur en modifiant l'URL
NEXT_PUBLIC_DIRECTUS_API_URL=https://api-inexistante.com:8143
NEXT_PUBLIC_USE_MOCK_DATA=false
npm run dev
# Vérifier : Toast d'erreur + basculement vers mock
```

## 🔧 Configuration Serveur Directus

Pour que l'API fonctionne, le serveur Directus doit :

1. **Autoriser CORS** depuis localhost:8080
2. **Avoir un certificat SSL valide**
3. **Être accessible** sur le port 8143
4. **Exposer l'endpoint** `/items/real_estates`

### Configuration CORS Directus

```json
{
    "cors": {
        "enabled": true,
        "origin": ["http://localhost:8080", "https://kylimmo.com"],
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "headers": ["Content-Type", "Authorization"]
    }
}
```

## 📝 Notes de Développement

-   **Cache** : Les requêtes sont mises en cache (5 min pour liste, 10 min pour détails)
-   **Performance** : Fallback rapide vers mock en cas d'erreur
-   **UX** : L'utilisateur ne voit jamais d'erreur, toujours des données
-   **Debug** : Logs détaillés en développement

## 🚨 Problèmes Connus

1. **Port 3100 occupé** : Utiliser le port 8080
2. **Variables d'environnement** : Redémarrer le serveur après modification
3. **Cache navigateur** : Vider le cache si les changements ne s'appliquent pas
4. **SSL** : Accepter le certificat auto-signé si nécessaire
