export function normalizeText(value) {
    return String(value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
}

function answerMatches(answer, candidates) {
    const key = normalizeText(answer?.key)
    const label = normalizeText(answer?.label)
    return candidates.some((candidate) => key.includes(candidate) || label.includes(candidate))
}

export function getAnswerValue(registration, candidates) {
    const answer = registration.answers?.find((item) => answerMatches(item, candidates))
    return answer?.value ? String(answer.value) : ""
}

export function getRegistrationStudent(registration) {
    const name =
        getAnswerValue(registration, ["nome", "name", "aluno", "estudante"]) ||
        getAnswerValue(registration, ["academicemail"]) ||
        registration.academicEmail ||
        "Nome nao informado"

    const ra =
        getAnswerValue(registration, ["ra", "registro academico", "matricula"]) ||
        "RA nao informado"

    return { name, ra }
}

export function registrationMatchesSearch(registration, term) {
    const normalizedTerm = normalizeText(term)
    if (!normalizedTerm) return true

    const { name, ra } = getRegistrationStudent(registration)
    return (
        normalizeText(name).includes(normalizedTerm) ||
        normalizeText(ra).includes(normalizedTerm) ||
        normalizeText(registration.registrationNumber).includes(normalizedTerm) ||
        normalizeText(registration.academicEmail).includes(normalizedTerm) ||
        registration.answers?.some((answer) => normalizeText(answer.value).includes(normalizedTerm))
    )
}
