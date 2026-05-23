'use client'

import { MemberSession } from "./MemberSession"
import { NewsSession } from "./NewsSession"
import { SlideSession } from "./SlideSession"
import { AboutCalloutSession } from "./AboutCalloutSession"
import { EventsSession } from "./EventsSession"

export function Display({ news, events }) {

    return (
        <>
            <SlideSession />
            <AboutCalloutSession />
            <EventsSession events={events} />
            <NewsSession news={news} />
            <MemberSession />
        </>
    )
}
