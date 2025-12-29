import type { NextApiRequest, NextApiResponse } from "next";

const DIRECTUS_API_URL = process.env.NEXT_PUBLIC_DIRECTUS_API_URL || "https://koffimm-backoffice.cotedev.com:8143";

interface CreateAgencyRequest {
    title: string;
    description?: string;
        contacts?: Array<{
        type: "phone" | "email";
            value: string;
        }>;
        social_links?: Array<{
            service: string;
            url: string;
        }>;
    geocoord?: {
        type: "Point";
        coordinates: [number, number];
    };
    street?: string;
    town?: string; // UUID de la ville
    docs?: any[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;

    console.log("[AGENCIES API] Method:", method);
    console.log("[AGENCIES API] Headers:", req.headers);

    // Vérifier l'authentification
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.error("[AGENCIES API] Missing or invalid authorization header");
        return res.status(401).json({
            success: false,
            error: "Non authentifié",
        });
    }

    const token = authHeader.replace("Bearer ", "");
    console.log("[AGENCIES API] Token présent:", token ? "OUI (longueur: " + token.length + ")" : "NON");

    switch (method) {
        case "GET":
            return handleGetAgencies(req, res, token);
        case "POST":
            return handleCreateAgency(req, res, token);
        default:
            res.setHeader("Allow", ["GET", "POST"]);
            return res.status(405).json({
                success: false,
                error: `Method ${method} Not Allowed`,
            });
    }
}

async function handleGetAgencies(req: NextApiRequest, res: NextApiResponse, token: string) {
    try {
        const response = await fetch(`${DIRECTUS_API_URL}/items/estate_agencies?fields=*,docs.*,town.*,user_created.*`, {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("Directus API error:", errorData);
            return res.status(response.status).json({
                success: false,
                error: errorData.errors?.[0]?.message || "Erreur lors de la récupération des agences",
            });
        }

        const data = await response.json();

        return res.status(200).json({
            success: true,
            agencies: data.data || [],
        });
    } catch (error) {
        console.error("Error fetching agencies:", error);
        return res.status(500).json({
            success: false,
            error: "Erreur serveur lors de la récupération des agences",
        });
    }
}

async function handleCreateAgency(req: NextApiRequest, res: NextApiResponse, token: string) {
    try {
        const body: CreateAgencyRequest = req.body;

        console.log("[CREATE AGENCY API] Body reçu:", JSON.stringify(body, null, 2));

        // Validation basique
        if (!body.title) {
            console.error("[CREATE AGENCY API] Validation failed: title missing");
            return res.status(400).json({
                success: false,
                error: "Le titre est requis",
            });
        }

        // Préparer les données pour Directus (structure plate selon la nouvelle API)
        const agencyData: any = {
            title: body.title,
        };

        if (body.description) {
            agencyData.description = body.description;
        }

        if (body.contacts && body.contacts.length > 0) {
            agencyData.contacts = body.contacts;
        }

        if (body.social_links && body.social_links.length > 0) {
            agencyData.social_links = body.social_links;
        }

        if (body.geocoord) {
            agencyData.geocoord = body.geocoord;
        }

        if (body.street) {
            agencyData.street = body.street;
        }

        if (body.town) {
            agencyData.town = body.town;
        }

        if (body.docs && body.docs.length > 0) {
            agencyData.docs = body.docs;
        } else {
            agencyData.docs = [];
        }

        console.log("[CREATE AGENCY API] Données préparées pour Directus:", JSON.stringify(agencyData, null, 2));
        console.log("[CREATE AGENCY API] URL:", `${DIRECTUS_API_URL}/items/estate_agencies?fields=*.*,docs.*`);
        console.log("[CREATE AGENCY API] Token (premiers caractères):", token.substring(0, 20) + "...");

        const response = await fetch(`${DIRECTUS_API_URL}/items/estate_agencies?fields=*.*,docs.*`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(agencyData),
        });

        console.log("[CREATE AGENCY API] Directus response status:", response.status);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("[CREATE AGENCY API] Directus API error:", JSON.stringify(errorData, null, 2));
            return res.status(response.status).json({
                success: false,
                error: errorData.errors?.[0]?.message || "Erreur lors de la création de l'agence",
                details: errorData,
            });
        }

        const data = await response.json();
        console.log("[CREATE AGENCY API] Agence créée avec succès:", data);

        return res.status(201).json({
            success: true,
            agency: data.data,
        });
    } catch (error) {
        console.error("[CREATE AGENCY API] Error creating agency:", error);
        return res.status(500).json({
            success: false,
            error: "Erreur serveur lors de la création de l'agence",
            details: error instanceof Error ? error.message : String(error),
        });
    }
}

