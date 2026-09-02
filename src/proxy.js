import { NextResponse } from "next/server";
import { getCurrentSession } from "./lib/auth";

export async function proxy(request) {
    const session = await getCurrentSession();

    if (!session) return NextResponse.redirect(new URL("/login", request.url));

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/api/dashboard/:path*"],
};