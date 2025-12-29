#!/bin/bash

# Script de configuration des variables d'environnement pour Kylimmo

echo "🔧 Configuration des variables d'environnement pour Kylimmo..."

# Créer le fichier .env.local s'il n'existe pas
if [ ! -f .env.local ]; then
    echo "📝 Création du fichier .env.local..."
    cat > .env.local << EOF
# Configuration locale pour le développement
NEXT_PUBLIC_SITE_URL=http://localhost:3100

# API Directus Configuration
NEXT_PUBLIC_DIRECTUS_API_URL=https://koffimm-backoffice.cotedev.com:8143
NEXT_PUBLIC_USE_MOCK_DATA=false

# Configuration d'authentification
NEXT_PUBLIC_DEFAULT_TOKEN=CEhywAJPwoUeLQfro7EsBFj4pVCk4Rji

# Configuration de performance
NEXT_TELEMETRY_DISABLED=1
EOF
    echo "✅ Fichier .env.local créé avec succès"
else
    echo "⚠️  Le fichier .env.local existe déjà"
fi

echo "🚀 Configuration terminée ! Vous pouvez maintenant démarrer le serveur avec 'npm run dev'"
