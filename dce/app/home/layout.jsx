import { Separator } from "@/components/ui/separator";

export default function Layout({ children, header, footer }) {
    return (
        <html lang="en">
            <body>
                {header}
                {children}
                <Separator />
                {footer}
            </body>
        </html>
    );
}
