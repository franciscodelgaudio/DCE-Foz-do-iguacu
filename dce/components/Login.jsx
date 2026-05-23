'use client'

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { signInWithGoogle } from "@/lib/actions/auth"
import { FcGoogle } from "react-icons/fc"

export default function Login() {
    return (
        <div className="flex flex-col items-center gap-6">
            <Image
                src="/images/home/logo.png"
                alt="DCE UNIOESTE"
                width={80}
                height={80}
                className="object-contain"
            />
            <Card className="w-full shadow-md">
                <CardHeader className="text-center pb-2">
                    <CardTitle className="text-2xl font-bold text-[#2708ab]">DCE UNIOESTE</CardTitle>
                    <CardDescription>
                        Entre com sua conta institucional para acessar o painel.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                    <form action={signInWithGoogle}>
                        <Button
                            variant="outline"
                            type="submit"
                            className="w-full h-11 gap-3 text-sm font-medium border-2"
                        >
                            <FcGoogle className="h-5 w-5" />
                            Entrar com Google
                        </Button>
                    </form>
                </CardContent>
            </Card>
            <p className="text-center text-xs text-muted-foreground px-4">
                Acesso restrito a membros autorizados do DCE UNIOESTE.
            </p>
        </div>
    )
}
