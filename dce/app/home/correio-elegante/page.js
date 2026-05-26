import { Display } from "@/components/home/correio-elegante/Display"
import { getSettings } from "@/lib/actions/settings"

export const metadata = {
    title: "Correio Elegante — DCE",
    description: "Surpreenda alguém especial com um Correio Elegante do DCE! Entrega no dia 12 de junho. A partir de R$ 3,00.",
}

export default async function Page() {
    const settings = await getSettings()

    return (
        <Display
            isEnabled={settings.correioEleganteEnabled}
            pixKey={settings.pixKey}
            pixKeyType={settings.pixKeyType}
            pixRecipientName={settings.pixRecipientName}
        />
    )
}
