import { NextResponse } from "next/server";
import { getFileTree } from "@/lib/engine"

export async function GET() {
    try {
        const tree = await getFileTree();
        return Response.json(tree);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Une erreur interne s'est produite" }, { status: 500 });
    }
}