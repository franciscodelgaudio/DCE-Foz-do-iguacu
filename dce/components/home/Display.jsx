'use client'

import { MemberSession } from "./MemberSession"
import { NewsSession } from "./NewsSession"
import { SlideSession } from "./SlideSession"
import { AboutCalloutSession } from "./AboutCalloutSession"
import { EventsSession } from "./EventsSession"
import { CorreioEleganteBanner } from "./CorreioEleganteBanner"

export function Display({ news, events, showBanner = false }) {

    return (
        <>
            <SlideSession />
            {showBanner && <CorreioEleganteBanner />}
            <AboutCalloutSession />
            <EventsSession events={events} />
            <NewsSession news={news} />
            <MemberSession />
        </>
    )
}
