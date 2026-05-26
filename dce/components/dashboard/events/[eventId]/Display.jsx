import { EventForm } from "../EventForm"

export function Display({ eventItem, registrationCount }) {
    return <EventForm eventItem={eventItem} registrationCount={registrationCount} />
}
