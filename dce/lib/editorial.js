// Configuração do controle editorial — atualizar a cada semestre

export const COORDINATIONS = [
    { key: "comunicacao", label: "Comunicação e Imprensa", goal: 2 },
    { key: "cultura",     label: "Cultura",                 goal: 1 },
    { key: "integracao",  label: "Integração de Campus",    goal: 1 },
    { key: "ensino",      label: "Ensino, Pesquisa e Extensão", goal: 1 },
    { key: "movimento",   label: "Movimento Estudantil e Formação Política", goal: 1 },
    { key: "assistencia", label: "Assistência Estudantil",  goal: 0 },
    { key: "diversidade", label: "Diversidade",             goal: 0 },
    { key: "presidencia", label: "Presidência",             goal: 0 },
]

// Cada slot cobre do seu `start` até o dia anterior ao próximo slot (fim = last day, 23:59:59)
export const CALENDAR_SLOTS = [
    { label: "01/06", start: "2026-06-01", end: "2026-06-14" },
    { label: "15/06", start: "2026-06-15", end: "2026-06-30" },
    { label: "01/07", start: "2026-07-01", end: "2026-07-14" },
    { label: "15/07", start: "2026-07-15", end: "2026-07-31" },
    { label: "01/08", start: "2026-08-01", end: "2026-08-14" },
    { label: "15/08", start: "2026-08-15", end: "2026-08-31" },
]

export const COORDINATION_KEYS = COORDINATIONS.map((c) => c.key)

// Helpers para rótulo legível das datas do slot
const MONTH_NAMES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"]

export function slotPeriodLabel(slot) {
    const [sy, sm, sd] = slot.start.split("-").map(Number)
    const [ey, em, ed] = slot.end.split("-").map(Number)
    if (sm === em) return `${sd} a ${ed} de ${MONTH_NAMES[sm - 1]}`
    return `${sd} de ${MONTH_NAMES[sm - 1]} a ${ed} de ${MONTH_NAMES[em - 1]}`
}
