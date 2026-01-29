import { Separator } from "@/components/ui/separator";

export default function RootLayout({ children, header, footer }) {
    return (
        <html lang="en">
            <body>
                {header}
                <Separator />
                {children}
                <Separator />
                {footer}
            </body>
        </html>
    );
}
