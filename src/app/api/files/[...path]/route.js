import { NextResponse } from "next/server";
import { readFileContent, saveFileContent } from "@/lib/engine";
import { HttpError } from "@/lib/errors";

export async function GET(request, { params }) {
    const { path: pathSegments } = await params;

    try {
        const result = await readFileContent(pathSegments);
        return Response.json(result);
    } catch (error) {
        if (error instanceof HttpError) return NextResponse.json({ error: error.message }, { status: error.status });

        console.error(error);
        return NextResponse.json({ error: "Une erreur interne s'est produite" }, { status: 500 });
    }
}

export async function POST(request, { params }) {
    const { path: pathSegments } = await params;

    let body;
    try {
        body = await request.json();
    } catch {
        return Response.json({ error: "JSON invalide" }, { status: 400 });
    }

    try {
        const result = await saveFileContent(pathSegments, body.content);
        return Response.json({ ok: true, ...result });
    } catch (error) {
        if (error instanceof HttpError) return NextResponse.json({ error: error.message }, { status: error.status });

        console.error(error);
        return NextResponse.json({ error: "Une erreur interne s'est produite" }, { status: 500 });
    }
}