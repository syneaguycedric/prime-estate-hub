import { ComponentType } from 'react';
import PropertySkeleton from '@/components/ui/property-skeleton';
import ProfileSkeleton from '@/components/ui/profile-skeleton';
import DetailSkeleton from '@/components/ui/detail-skeleton';

export type SkeletonType = 'list' | 'detail' | 'profile' | 'none';

export interface SkeletonConfig {
    type: SkeletonType;
    component?: ComponentType<any>;
}

/**
 * Configuration centralisée des skeletons par route
 * Permet de mapper chaque route à son skeleton approprié
 */
export const SKELETON_ROUTES: Record<string, SkeletonConfig> = {
    '/': {
        type: 'list',
        component: PropertySkeleton,
    },
    '/profile': {
        type: 'profile',
        component: ProfileSkeleton,
    },
    '/login': {
        type: 'none', // Pas de skeleton pour la page de login
    },
    '/404': {
        type: 'none', // Pas de skeleton pour la page 404
    },
};

/**
 * Détecte le type de skeleton à afficher selon la route
 */
export function getSkeletonForRoute(path: string): SkeletonConfig {
    // Correspondance exacte
    if (SKELETON_ROUTES[path]) {
        return SKELETON_ROUTES[path];
    }

    // Routes dynamiques - pages de détail
    if (path.startsWith('/biens/') || path.match(/^\/biens\/[^/]+$/)) {
        return {
            type: 'detail',
            component: DetailSkeleton,
        };
    }

    // Fallback par défaut - skeleton de liste
    return {
        type: 'list',
        component: PropertySkeleton,
    };
}

/**
 * Détermine si on doit afficher un skeleton pour une route donnée
 */
export function shouldShowSkeleton(path: string): boolean {
    const config = getSkeletonForRoute(path);
    return config.type !== 'none';
}

