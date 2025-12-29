/**
 * Fonctions utilitaires pour gérer les cookies
 */

/**
 * Définit un cookie
 * @param name Nom du cookie
 * @param value Valeur du cookie
 * @param days Nombre de jours avant expiration (par défaut 30)
 */
export function setCookie(name: string, value: string, days: number = 30): void {
    if (typeof window === 'undefined') return;

    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

/**
 * Récupère un cookie (côté client uniquement)
 * @param name Nom du cookie
 * @returns Valeur du cookie ou null si non trouvé
 */
export function getCookie(name: string): string | null {
    if (typeof window === 'undefined') return null;

    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

/**
 * Supprime un cookie
 * @param name Nom du cookie à supprimer
 */
export function deleteCookie(name: string): void {
    if (typeof window === 'undefined') return;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

/**
 * Parse les cookies depuis les headers HTTP (côté serveur)
 * @param cookieHeader Header Cookie de la requête HTTP
 * @returns Objet avec les cookies parsés
 */
export function parseCookies(cookieHeader: string | undefined): Record<string, string> {
    if (!cookieHeader) return {};

    const cookies: Record<string, string> = {};
    cookieHeader.split(';').forEach(cookie => {
        const [name, value] = cookie.trim().split('=');
        if (name && value) {
            cookies[name] = decodeURIComponent(value);
        }
    });
    return cookies;
}
