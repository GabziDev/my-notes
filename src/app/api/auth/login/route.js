import { NextResponse } from "next/server";
import { login } from "@/lib/auth";
import { HttpError } from "@/lib/errors";

export async function POST(request) {
    try {
        const body = await request.json();
        const { username, password } = body;

        await login(username, password);

        return NextResponse.json({ message: "Vous vous êtes connecté avec succès !" });
    } catch (error) {
        if (error instanceof HttpError) return NextResponse.json({ error: error.message }, { status: error.status });

        console.error(error);
        return NextResponse.json({ error: "Une erreur interne s'est produite" });
    }
}