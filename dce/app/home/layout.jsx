import { Separator } from "@/components/ui/separator";

export default function Layout({ children, header, footer }) {
    return (
        <>
            {header}
            {children}
            <Separator />
            {footer}
        </>
    );
}
