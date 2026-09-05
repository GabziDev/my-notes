import { NextResponse } from "next/server";
import { createFile, deletePath, editFileContent, readPath } from "@/lib/engine";
import { HttpError } from "@/lib/errors";

/**
 * Retourne le contenu du fichier ou info dossier
 * @param {*} request 
 * @param {*} param1 
 * @returns 
 */
export async function GET(request, { params }) {
    const { path: pathSegments } = await params;

    try {
        const result = await readPath(pathSegments);
        return Response.json(result);
    } catch (error) {
        if (error instanceof HttpError) return NextResponse.json({ error: error.message }, { status: error.status });

        console.error(error);
        return NextResponse.json({ error: "Une erreur interne s'est produite" }, { status: 500 });
    }
}

/**
 * Supprimer le fichier ou le dossier
 * @param {*} request 
 * @param {*} param1 
 * @returns 
 */
export async function DELETE(request, { params }) {
    const { path: pathSegments } = await params;

    try {
        const result = await deletePath(pathSegments);
        return Response.json(result);
    } catch (error) {
        if (error instanceof HttpError) return NextResponse.json({ error: error.message }, { status: error.status });

        console.error(error);
        return NextResponse.json({ error: "Une erreur interne s'est produite" }, { status: 500 });
    }
}

/**
 * Modifier le texte dans un fichier
 * @param {*} request 
 * @param {*} param1 
 * @returns 
 */
export async function PUT(request, { params }) {
    const { path: pathSegments } = await params;

    let body;
    try {
        body = await request.json();
    } catch {
        return Response.json({ error: "JSON invalide" }, { status: 400 });
    }

    try {
        await editFileContent(pathSegments, body.content);
        return Response.json({ message: "Fichier modifié avec succès" });
    } catch (error) {
        if (error instanceof HttpError) return NextResponse.json({ error: error.message }, { status: error.status });

        console.error(error);
        return NextResponse.json({ error: "Une erreur interne s'est produite" }, { status: 500 });
    }
}

/**
 * Créer un fichier
 * @param {*} request 
 * @param {*} param1 
 * @returns 
 */
export async function POST(request, { params }) {
    const { path: pathSegments } = await params;

    try {
        const result = await createFile(pathSegments);
        return Response.json(result);
    } catch (error) {
        if (error instanceof HttpError) return NextResponse.json({ error: error.message }, { status: error.status });

        console.error(error);
        return NextResponse.json({ error: "Une erreur interne s'est produite" }, { status: 500 });
    }
}