import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { Home, Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Custom404() {
    const router = useRouter();

    return (
        <>
            <Head>
                <title>Page non trouvée (404) - Kylimmo</title>
                <meta name="description" content="La page que vous recherchez n'existe pas ou a été déplacée." />
                <meta name="robots" content="noindex, nofollow" />
            </Head>

            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <Card className="shadow-lg">
                            <CardHeader className="pb-6">
                                <motion.div
                                    className="mx-auto mb-4 text-primary"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                >
                                    <div className="text-6xl font-bold">404</div>
                                </motion.div>
                                <CardTitle className="text-2xl text-foreground">Page non trouvée</CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-6">
                                <p className="text-muted-foreground">Désolé, la page que vous recherchez n'existe pas ou a été déplacée.</p>

                                <div className="space-y-3">
                                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                                        <Link href="/" passHref>
                                            <Button className="w-full" size="lg">
                                                <Home className="h-4 w-4 mr-2" />
                                                Retour à l'accueil
                                            </Button>
                                        </Link>
                                    </motion.div>

                                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                                        <Button variant="outline" className="w-full" size="lg" onClick={() => router.back()}>
                                            <ArrowLeft className="h-4 w-4 mr-2" />
                                            Page précédente
                                        </Button>
                                    </motion.div>

                                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                                        <Link href="/recherche" passHref>
                                            <Button variant="ghost" className="w-full" size="lg">
                                                <Search className="h-4 w-4 mr-2" />
                                                Rechercher un bien
                                            </Button>
                                        </Link>
                                    </motion.div>
                                </div>

                                <motion.div className="pt-4 border-t border-border" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                                    <p className="text-sm text-muted-foreground">
                                        Si vous pensez qu'il s'agit d'une erreur,
                                        <Link href="/contact" className="text-primary hover:underline ml-1">
                                            contactez-nous
                                        </Link>
                                    </p>
                                </motion.div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </>
    );
}
