import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import FormData from 'form-data';
import fetch from 'node-fetch';
import fs from 'fs';

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        console.log('[UPLOAD API] Starting file upload');

        // Parser le formulaire multipart
        const form = formidable({});
        const [fields, files] = await form.parse(req);

        const file = files.file?.[0];
        if (!file) {
            console.error('[UPLOAD API] No file provided');
            return res.status(400).json({ error: 'No file provided' });
        }

        // Récupérer le token
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            console.error('[UPLOAD API] No authorization header');
            return res.status(401).json({ error: 'No authorization header' });
        }

        console.log('[UPLOAD API] Uploading file:', file.originalFilename);

        // Créer FormData pour Directus
        const formData = new FormData();
        formData.append('file', fs.createReadStream(file.filepath), file.originalFilename || 'file');

        // Envoyer à Directus
        const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_API_URL;
        console.log('[UPLOAD API] Sending to Directus:', `${directusUrl}/files`);

        const response = await fetch(`${directusUrl}/files`, {
            method: 'POST',
            headers: {
                'Authorization': authHeader,
                ...formData.getHeaders(),
            },
            body: formData,
        });

        const data = await response.json() as any;

        if (!response.ok) {
            console.error('[UPLOAD API] Directus error:', data);
            return res.status(response.status).json(data);
        }

        console.log('[UPLOAD API] File uploaded successfully:', data.data?.id);

        // Nettoyer le fichier temporaire
        try {
            fs.unlinkSync(file.filepath);
        } catch (cleanupError) {
            console.warn('[UPLOAD API] Could not delete temp file:', cleanupError);
        }

        return res.status(200).json(data);
    } catch (error: any) {
        console.error('[UPLOAD API] Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
