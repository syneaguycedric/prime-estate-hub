# 🎨 Animations des Cartes - Kylimmo

## ✨ Animations Ajoutées

J'ai remis des animations subtiles et professionnelles sur les cartes de la page d'accueil, en gardant la simplicité pour éviter les conflits avec les transitions de page.

## 🎯 Cartes en Grille (PropertyCardAnimated)

### Animation Principale

```typescript
<motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: index * 0.05 }}
    whileHover={{ scale: 1.02 }}
>
```

### Animations Échelonnées

#### 1. **Badges (0.2s + index \* 0.1s)**

```typescript
<motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + index * 0.1 }}>
    {/* Badge "Nouveau" avec spring */}
    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 + index * 0.1, type: "spring", stiffness: 200 }}>
        <Badge>Nouveau</Badge>
    </motion.div>
</motion.div>
```

#### 2. **Bouton Favori (0.2s + index \* 0.1s)**

```typescript
<motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + index * 0.1 }}>
    <Button>❤️</Button>
</motion.div>
```

#### 3. **Prix (0.4s + index \* 0.1s)**

```typescript
<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + index * 0.1 }}>
    <div className="bg-primary text-primary-foreground">{price}</div>
</motion.div>
```

#### 4. **Contenu Principal (0.5s + index \* 0.1s)**

```typescript
<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + index * 0.1 }}>
    <h3>{title}</h3>
    <div>{location}</div>
</motion.div>
```

#### 5. **Détails (0.6s + index \* 0.1s)**

```typescript
<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + index * 0.1 }}>
    <div>
        {surface} • {bedrooms} • {bathrooms}
    </div>
</motion.div>
```

#### 6. **Boutons (0.6s + index \* 0.1s)**

```typescript
<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + index * 0.1 }}>
    <Button>Voir</Button>
    <Button>Contacter</Button>
</motion.div>
```

### Effet Hover sur l'Image

```typescript
<motion.img className="group-hover:scale-110 transition-transform duration-300" whileHover={{ scale: 1.1 }} transition={{ duration: 0.3 }} />
```

## 🎯 Cartes en Liste (PropertyListCardAnimated)

### Animation Principale

```typescript
<motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: index * 0.05 }}
    whileHover={{ y: -2 }}
>
```

### Animations Échelonnées

#### 1. **Image (0.1s + index \* 0.05s)**

```typescript
<motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + index * 0.05, duration: 0.3 }}>
    <img />
</motion.div>
```

#### 2. **Titre et Badge (0.2s + index \* 0.05s)**

```typescript
<motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + index * 0.05, duration: 0.3 }}>
    <h3>{title}</h3>
    <Badge>{type}</Badge>
</motion.div>
```

#### 3. **Localisation (0.25s + index \* 0.05s)**

```typescript
<motion.p initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + index * 0.05, duration: 0.3 }}>
    <MapPin /> {location}
</motion.p>
```

#### 4. **Détails (0.3s + index \* 0.05s)**

```typescript
<motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + index * 0.05, duration: 0.3 }}>
    <Square /> {surface} • <Bed /> {bedrooms} • <Bath /> {bathrooms}
</motion.div>
```

#### 5. **Prix (0.35s + index \* 0.05s)**

```typescript
<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 + index * 0.05, duration: 0.3 }}>
    <p>{price}</p>
</motion.div>
```

## 🎨 Caractéristiques des Animations

### Timing

-   **Grille** : Délai de 0.1s entre chaque carte
-   **Liste** : Délai de 0.05s entre chaque carte
-   **Durée** : 0.3s pour toutes les animations
-   **Effet cascade** : Chaque élément apparaît progressivement

### Effets Visuels

-   **Entrée** : `opacity: 0 → 1` avec mouvement subtil
-   **Hover** : `scale: 1.02` (grille) / `y: -2` (liste)
-   **Image hover** : `scale: 1.1` avec transition CSS
-   **Badge "Nouveau"** : Animation spring avec `stiffness: 200`

### Directions d'Animation

-   **Badges** : `x: -20 → 0` (gauche)
-   **Bouton favori** : `x: 20 → 0` (droite)
-   **Prix** : `y: 20 → 0` (bas)
-   **Contenu liste** : `x: 20 → 0` (droite)
-   **Détails** : `y: 10 → 0` (bas)

## 🚀 Avantages

### 1. **Expérience Utilisateur**

-   ✅ **Feedback visuel** immédiat
-   ✅ **Animations fluides** et professionnelles
-   ✅ **Effet cascade** élégant
-   ✅ **Hover effects** subtils

### 2. **Performance**

-   ✅ **Animations GPU-accélérées** avec `transform` et `opacity`
-   ✅ **Durées courtes** (0.3s) pour la réactivité
-   ✅ **Pas de conflits** avec les transitions de page
-   ✅ **Code optimisé** et maintenable

### 3. **Design**

-   ✅ **Animations cohérentes** entre grille et liste
-   ✅ **Effets subtils** qui ne distraient pas
-   ✅ **Professionnel** et raffiné
-   ✅ **Responsive** sur tous les écrans

## 📱 Responsive

-   Toutes les animations s'adaptent aux différentes tailles d'écran
-   Performance maintenue sur mobile
-   Effets hover optimisés pour le tactile
-   Timing adapté selon le type d'affichage

---

**🎉 Les cartes ont maintenant des animations subtiles et professionnelles !**

L'application offre maintenant :

-   ✅ **Animations fluides** sur les cartes
-   ✅ **Effet cascade** élégant
-   ✅ **Hover effects** subtils
-   ✅ **Pas de conflits** avec les transitions de page
-   ✅ **Expérience utilisateur** raffinée et professionnelle
