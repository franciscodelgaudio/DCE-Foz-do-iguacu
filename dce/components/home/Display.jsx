'use client'

import { MemberSession } from "./MemberSession"
import { NewsSession } from "./NewsSession"
import { SlideSession } from "./SlideSession"
import { AboutCalloutSession } from "./AboutCalloutSession"
import { EventsSession } from "./EventsSession"
import { CorreioEleganteBanner } from "./CorreioEleganteBanner"
import { PartnersSession } from "./PartnersSession"
import { ContactSession } from "./ContactSession"
import { JoinUsSession } from "./JoinUsSession"

export function Display({ news, events, jobs = [], showBanner = false }) {

    return (
        <>
            <SlideSession />
            {showBanner && <CorreioEleganteBanner />}
            <EventsSession events={events} />
            <NewsSession news={news} />
            <AboutCalloutSession />
            <JoinUsSession jobs={jobs} />
            <MemberSession />
            <PartnersSession />
            <ContactSession />
        </>
    )
}
