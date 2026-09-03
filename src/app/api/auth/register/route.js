import { NextResponse } from "next/server";
import { aUserExists, register } from "@/lib/auth";
import { HttpError } from "@/lib/errors";

export async function POST(request) {
    try {
        if (await aUserExists()) return NextResponse.json({ error: "Inscription désactivé" }, { status: 404 });

        const body = await request.json();
        const { username, password } = body;

        if (typeof username !== "string" || typeof password !== "string") { return NextResponse.json({ error: "Nom d'utilisateur et mot de passe requis" }); }

        await register(username, password);

        return NextResponse.json({ message: "Création du compte avec succès !" });
    } catch (error) {
        if (error instanceof HttpError) return NextResponse.json({ error: error.message }, { status: error.status });

        console.error(error);
        return NextResponse.json({ error: "Une erreur interne s'est produite" }, { status: 500 });
    }
}