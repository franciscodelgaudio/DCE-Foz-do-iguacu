'use client'

import { IntroductionSession } from "./IntroductionSession"
import { MemberSession } from "./MemberSession"
import { NewsSession } from "./NewsSession"
import { SlideSession } from "./SlideSession"

export function Display() {

    return (
        <>
            <SlideSession />
            <IntroductionSession />
            <NewsSession />
            <MemberSession />
        </>
    )
}