import { EventForm } from "../EventForm"

export function Display({ eventItem, registrationCount, isAdmin }) {
    return <EventForm eventItem={eventItem} registrationCount={registrationCount} isAdmin={isAdmin} />
}
