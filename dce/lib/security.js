import { headers } from "next/headers"

function firstHeaderValue(value) {
    return value?.split(",")?.[0]?.trim() || ""
}

export async function getRequestIp() {
    const requestHeaders = await headers()
    return (
        firstHeaderValue(requestHeaders.get("x-forwarded-for")) ||
        requestHeaders.get("x-real-ip") ||
        requestHeaders.get("cf-connecting-ip") ||
        ""
    )
}

export async function verifyTurnstile(token, ipAddress) {
    const secret = process.env.TURNSTILE_SECRET_KEY
    if (!secret) {
        return process.env.NODE_ENV !== "production"
    }
    if (!token) return false

    try {
        const formData = new FormData()
        formData.append("secret", secret)
        formData.append("response", token)
        if (ipAddress) formData.append("remoteip", ipAddress)

        const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
            method: "POST",
            body: formData,
        })
        const data = await response.json()
        return Boolean(data?.success)
    } catch (err) {
        console.error("Erro ao validar Turnstile:", err)
        return false
    }
}
