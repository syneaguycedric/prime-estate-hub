import { PaymentMethod, buildDirectusImageUrl } from "@/lib/directus-api";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { motion } from "framer-motion";

interface PaymentMethodCardProps {
    paymentMethod: PaymentMethod;
    onSelect?: (paymentMethod: PaymentMethod) => void;
    isSelected?: boolean;
}

export default function PaymentMethodCard({ paymentMethod, onSelect, isSelected }: PaymentMethodCardProps) {
    const imageUrl = paymentMethod.logo
        ? buildDirectusImageUrl(paymentMethod.logo.id, {
              width: 200,
              height: 200,
              quality: 90,
              format: 'webp',
          })
        : null;

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
        >
            <Card
                className={`relative cursor-pointer transition-all border-2 w-40 ${
                    isSelected
                        ? 'border-primary bg-primary/5 shadow-lg scale-105'
                        : 'border-border hover:border-primary/50 hover:shadow-md'
                }`}
                onClick={() => onSelect?.(paymentMethod)}
            >
                <CardContent className="p-6 flex flex-col items-center justify-center min-h-[140px]">
                    {imageUrl ? (
                        <div className="relative w-24 h-24 mb-4">
                            <Image
                                src={imageUrl}
                                alt={paymentMethod.title}
                                fill
                                className="object-contain"
                                sizes="96px"
                            />
                        </div>
                    ) : (
                        <div className="w-24 h-24 mb-4 bg-muted rounded-lg flex items-center justify-center">
                            <span className="text-2xl font-bold text-muted-foreground">
                                {paymentMethod.title.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}
                    <h3 className="font-semibold text-center text-sm">{paymentMethod.title}</h3>
                    {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-md">
                            <svg
                                className="w-4 h-4 text-primary-foreground"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2.5}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}

