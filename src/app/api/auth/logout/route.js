import { NextResponse } from "next/server";
import { logout } from "@/lib/auth";
import { HttpError } from "@/lib/errors";

export async function POST(request) {
    try {
        await logout();

        return NextResponse.json({ message: "Déconnecter avec succès" });
    } catch (error) {
        if (error instanceof HttpError) return NextResponse.json({ error: error.message }, { status: error.status });

        console.error(error);
        return NextResponse.json({ error: "Une erreur interne s'est produite" });
    }
}