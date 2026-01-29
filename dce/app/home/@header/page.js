import { Header } from "../../../components/Header";
import { auth } from "@/auth"

export default async function Page() {

    const session = await auth();

    return (
        <Header user={session?.user} />
    );
}