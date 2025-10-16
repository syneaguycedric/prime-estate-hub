import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
    const { theme = "system" } = useTheme();

    return (
        <Sonner
            theme={theme as ToasterProps["theme"]}
            className="toaster group"
            position="top-right"
            toastOptions={{
                classNames: {
                    toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-l-4 group-[.toaster]:shadow-2xl group-[.toaster]:backdrop-blur-sm group-[.toaster]:rounded-lg group-[.toaster]:p-4 group-[.toaster]:min-w-[320px]",
                    description: "group-[.toast]:text-muted-foreground group-[.toast]:text-sm group-[.toast]:mt-1",
                    actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-md group-[.toast]:px-3 group-[.toast]:py-2",
                    cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-md group-[.toast]:px-3 group-[.toast]:py-2",
                    success:
                        "group-[.toaster]:border-l-emerald-500 group-[.toaster]:bg-emerald-50 dark:group-[.toaster]:bg-emerald-950/50 group-[.toaster]:text-emerald-900 dark:group-[.toaster]:text-emerald-100",
                    error: "group-[.toaster]:border-l-red-500 group-[.toaster]:bg-red-50 dark:group-[.toaster]:bg-red-950/50 group-[.toaster]:text-red-900 dark:group-[.toaster]:text-red-100 group-[.toaster]:animate-shake",
                    warning:
                        "group-[.toaster]:border-l-amber-500 group-[.toaster]:bg-amber-50 dark:group-[.toaster]:bg-amber-950/50 group-[.toaster]:text-amber-900 dark:group-[.toaster]:text-amber-100",
                    info: "group-[.toaster]:border-l-blue-500 group-[.toaster]:bg-blue-50 dark:group-[.toaster]:bg-blue-950/50 group-[.toaster]:text-blue-900 dark:group-[.toaster]:text-blue-100",
                },
            }}
            {...props}
        />
    );
};

export { Toaster, toast };
