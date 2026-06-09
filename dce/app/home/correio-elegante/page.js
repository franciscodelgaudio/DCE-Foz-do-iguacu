import { Display } from "@/components/home/correio-elegante/Display"
import { getCorreioEleganteInventory } from "@/lib/actions/correioElegante"
import { getSettings } from "@/lib/actions/settings"

export const metadata = {
    title: "Correio Elegante — DCE",
    description: "Surpreenda alguém especial com um Correio Elegante do DCE! Entrega no dia 12 de junho. A partir de R$ 3,00.",
}

export default async function Page() {
    const [settings, inventory] = await Promise.all([
        getSettings(),
        getCorreioEleganteInventory(),
    ])

    return (
        <Display
            isEnabled={settings.correioEleganteEnabled}
            pixKey={settings.pixKey}
            pixKeyType={settings.pixKeyType}
            pixRecipientName={settings.pixRecipientName}
            inventory={inventory}
        />
    )
}
