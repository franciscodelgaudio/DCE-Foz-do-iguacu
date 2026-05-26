import AppSidebar from "@/components/dashboard/sidebar/AppSidebar";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

const DEFAULT_ADMIN_EMAIL = "foz.dce@gmail.com"

export default async function Page() {

    const session = await auth();
    if (!session) { redirect('/login'); }

    const email = session.user?.email?.toLowerCase()
    const isAdmin = email === DEFAULT_ADMIN_EMAIL || session.user?.role === "admin"

    return (
        <AppSidebar user={session?.user} isAdmin={isAdmin} />
    );
}
