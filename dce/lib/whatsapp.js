function onlyDigits(value) {
    return String(value ?? "").replace(/\D/g, "")
}

export function formatBrazilWhatsapp(value) {
    const digits = onlyDigits(value).slice(0, 11)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)} - ${digits.slice(7, 11)}`
}

export function normalizeBrazilWhatsapp(value) {
    const digits = onlyDigits(value)
    if (digits.length !== 11 || digits[2] !== "9") return null
    return {
        local: digits,
        international: `55${digits}`,
        formatted: formatBrazilWhatsapp(digits),
    }
}
