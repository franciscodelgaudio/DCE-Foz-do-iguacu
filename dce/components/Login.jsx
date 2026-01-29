'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup } from "@/components/ui/field"
import { signInWithGoogle } from "../lib/actions/auth"
import { FcGoogle } from "react-icons/fc"

export default function Login() {
    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Entre na sua conta</CardTitle>
                    <CardDescription>Entre rapidamente usando sua conta do Google.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={signInWithGoogle}>
                        <FieldGroup>
                            <Field>
                                <Button variant="outline" type="submit">
                                    <FcGoogle className="mr-2 h-4 w-4" />
                                    Entrar com Google
                                </Button>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
