# Système de Toasts Amélioré - Kylimmo

## Vue d'ensemble

Le système de toasts de Kylimmo offre une expérience utilisateur riche avec des indicateurs visuels clairs pour chaque type de notification.

## Design

### Caractéristiques visuelles

#### 🎨 **Identité visuelle forte**

-   **Bordure gauche épaisse (4px)** : Indicateur de couleur immédiat
-   **Fond coloré subtil** : Arrière-plan semi-transparent cohérent
-   **Icônes explicites** : Symboles universellement reconnus
-   **Ombres profondes** : `shadow-2xl` pour profondeur
-   **Taille minimale** : `min-w-[320px]` pour lisibilité

#### ✅ **Toast de succès**

-   **Couleur** : Vert émeraude (`emerald-500`)
-   **Icône** : `CheckCircle2` - Cercle avec check ✓
-   **Fond** : `emerald-50` (clair) / `emerald-950/50` (sombre)
-   **Animation** : Slide-in depuis la droite
-   **Durée** : 3 secondes
-   **Usage** : Confirmation d'action réussie

#### ❌ **Toast d'erreur**

-   **Couleur** : Rouge (`red-500`)
-   **Icône** : `XCircle` - Cercle avec X ✕
-   **Fond** : `red-50` (clair) / `red-950/50` (sombre)
-   **Animation** : Shake (tremblement) pour attirer l'attention
-   **Durée** : 5 secondes (plus long pour permettre la lecture)
-   **Usage** : Erreurs, échecs d'authentification, problèmes

#### ⚠️ **Toast d'avertissement**

-   **Couleur** : Orange ambre (`amber-500`)
-   **Icône** : `AlertTriangle` - Triangle avec point d'exclamation ⚠
-   **Fond** : `amber-50` (clair) / `amber-950/50` (sombre)
-   **Animation** : Slide-in depuis la droite
-   **Durée** : 4 secondes
-   **Usage** : Avertissements, actions à confirmer

#### ℹ️ **Toast d'information**

-   **Couleur** : Bleu (`blue-500`)
-   **Icône** : `Info` - Cercle avec i ℹ
-   **Fond** : `blue-50` (clair) / `blue-950/50` (sombre)
-   **Animation** : Slide-in depuis la droite
-   **Durée** : 4 secondes
-   **Usage** : Informations générales, conseils

## Utilisation

### Import

```typescript
import { toast } from "@/lib/toast-helpers";
```

### Exemples d'utilisation

#### Toast de succès

```typescript
// Simple
toast.success("Connexion réussie");

// Avec description
toast.success("Connexion réussie", {
    description: "Bienvenue sur Kylimmo !",
});

// Avec durée personnalisée
toast.success("Sauvegarde effectuée", {
    description: "Vos modifications ont été enregistrées",
    duration: 2000, // 2 secondes
});
```

#### Toast d'erreur

```typescript
// Erreur simple
toast.error("Email ou mot de passe incorrect");

// Avec description détaillée
toast.error("Échec de la connexion", {
    description: "Veuillez vérifier vos identifiants et réessayer",
    duration: 6000, // 6 secondes pour les erreurs critiques
});
```

#### Toast d'avertissement

```typescript
toast.warning("Action irréversible", {
    description: "Cette action ne peut pas être annulée",
});
```

#### Toast d'information

```typescript
toast.info("Nouvelle fonctionnalité", {
    description: "Découvrez notre nouveau système de filtres",
});
```

## Cas d'usage dans Kylimmo

### Authentification

```typescript
// Succès
toast.success("Connexion réussie", {
    description: `Bienvenue ${user.first_name || user.email} !`,
});

// Erreur
toast.error("Échec de la connexion", {
    description: "Email ou mot de passe incorrect",
});

// Déconnexion
toast.success("Déconnexion réussie", {
    description: "Vous avez été déconnecté avec succès",
});
```

### Actions sur les biens immobiliers

```typescript
// Ajout aux favoris
toast.success("Ajouté aux favoris", {
    description: "Le bien a été ajouté à votre liste",
});

// Suppression
toast.warning("Bien supprimé", {
    description: "Cette action est irréversible",
});

// Erreur lors du chargement
toast.error("Erreur de chargement", {
    description: "Impossible de récupérer les détails du bien",
});
```

### Formulaires

```typescript
// Validation réussie
toast.success("Formulaire envoyé", {
    description: "Nous vous contacterons sous peu",
});

// Erreur de validation
toast.error("Formulaire incomplet", {
    description: "Veuillez remplir tous les champs obligatoires",
});

// Information
toast.info("Sauvegarde automatique", {
    description: "Vos modifications sont automatiquement enregistrées",
});
```

## Architecture technique

### Composants

1. **`Toaster`** (`src/components/ui/sonner.tsx`)

    - Composant React qui affiche les toasts
    - Configuré avec Sonner
    - Position : top-right
    - Styles personnalisés par type

2. **`toast` helpers** (`src/lib/toast-helpers.tsx`)

    - Wrapper autour de Sonner
    - Ajoute les icônes automatiquement
    - Gère les durées par défaut
    - Applique les animations

3. **Animations CSS** (`src/index.css`)
    - `shake` : Tremblement pour les erreurs
    - `slideInRight` : Entrée fluide depuis la droite

### Configuration Sonner

```typescript
<Sonner
    position="top-right"
    toastOptions={{
        classNames: {
            toast: "border-l-4 shadow-2xl backdrop-blur-sm rounded-lg p-4 min-w-[320px]",
            success: "border-l-emerald-500 bg-emerald-50 text-emerald-900",
            error: "border-l-red-500 bg-red-50 text-red-900 animate-shake",
            warning: "border-l-amber-500 bg-amber-50 text-amber-900",
            info: "border-l-blue-500 bg-blue-50 text-blue-900",
        },
    }}
/>
```

## Bonnes pratiques

### Durées recommandées

| Type              | Durée | Raison                                            |
| ----------------- | ----- | ------------------------------------------------- |
| **Succès**        | 3s    | Confirmation rapide, pas besoin de lire longtemps |
| **Erreur**        | 5-6s  | Plus de temps pour comprendre et réagir           |
| **Avertissement** | 4s    | Temps suffisant pour lire le message              |
| **Information**   | 4s    | Temps moyen de lecture                            |

### Quand utiliser chaque type

#### ✅ Succès

-   Action complétée avec succès
-   Connexion réussie
-   Sauvegarde effectuée
-   Élément ajouté/supprimé
-   Email envoyé

#### ❌ Erreur

-   Échec d'authentification
-   Erreur serveur
-   Validation échouée
-   Données manquantes
-   Permission refusée

#### ⚠️ Avertissement

-   Action irréversible
-   Limite atteinte
-   Données obsolètes
-   Session expirée bientôt
-   Changement important

#### ℹ️ Information

-   Nouvelle fonctionnalité
-   Conseil d'utilisation
-   Statut en cours
-   Explication
-   Aide contextuelle

## Cohérence avec le thème Kylimmo

### Palette de couleurs

Les couleurs des toasts ont été choisies pour :

-   **Contraster** avec la couleur primaire marron doré (`#9E6D26`)
-   **Respecter** les standards d'accessibilité (WCAG AA)
-   **Communiquer** clairement l'état (succès, erreur, etc.)

### Dark mode

Tous les toasts sont compatibles avec le mode sombre :

-   Fond sombre semi-transparent (`-950/50`)
-   Texte clair automatique
-   Bordures colorées conservées

## Accessibilité

-   **Contraste** : Tous les toasts respectent WCAG AA
-   **Icônes** : Icônes universelles + texte explicite
-   **Durée** : Temps suffisant pour lire
-   **Position** : Top-right, non-intrusif
-   **Fermeture** : Possibilité de fermer manuellement

## Migration depuis les anciens toasts

### Avant

```typescript
import { toast } from "sonner";

toast.success("Message");
toast.error("Erreur");
```

### Après

```typescript
import { toast } from "@/lib/toast-helpers";

toast.success("Message"); // Avec icône automatique
toast.error("Erreur"); // Avec animation shake
```

**Note** : Les anciens toasts continuent de fonctionner, mais il est recommandé d'utiliser les nouveaux helpers pour une expérience utilisateur cohérente.

## Exemples visuels

### Succès

```
┌────────────────────────────────────┐
│ ✓  Connexion réussie          │ ← Bordure verte épaisse
│    Bienvenue Jean Dupont !         │
└────────────────────────────────────┘
```

### Erreur (avec shake)

```
┌────────────────────────────────────┐
│ ✕  Échec de la connexion      │ ← Bordure rouge épaisse + shake
│    Email ou mot de passe incorrect │
└────────────────────────────────────┘
```

### Avertissement

```
┌────────────────────────────────────┐
│ ⚠  Action irréversible        │ ← Bordure orange épaisse
│    Cette action ne peut pas être   │
│    annulée                          │
└────────────────────────────────────┘
```
