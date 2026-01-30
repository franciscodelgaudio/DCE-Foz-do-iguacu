import AppSidebar from "@/components/dashboard/sidebar/AppSidebar";
import { redirect } from "next/dist/server/api-utils";
import { auth } from "@/auth";

export default async function Page() {

    const session = await auth();
    if (!session) { redirect('/login'); }
    
    return (
        <AppSidebar user={session?.user} />
    );
}