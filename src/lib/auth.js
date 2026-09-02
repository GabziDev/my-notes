import "server-only";

import crypto from "crypto";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { HttpError } from "@/lib/errors";
import { cookies } from "next/headers";

const MIN_USERNAME_LENGTH = 3;
const MAX_USERNAME_LENGTH = 15;

const MIN_PASSWORD_LENGTH = 10;
const MAX_PASSWORD_LENGTH = 60;

const USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;

/**
 * Générer un token de session
 * @returns {string} Le token de session
 */
function generateSessionToken() {
    return crypto.randomBytes(32).toString("hex");
}

/**
 * Hasher un mot de passe avec bcrypt
 * @param {string} password Le mdp a hasher
 * @returns {Promise<string>} Retournera le mdp hashé
 */
function hashPassword(password) {
    return bcrypt.hash(password, 12);
}

/**
 * Comparer un mot de passe avec un mot de passe hashé
 * @param {string} password Le mdp à comparer
 * @param {string} hashedPassword Le mdp hashé
 * @returns {Promise<boolean>} Retournera true si les mots de passe correspondent
 */
function comparePassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
}

/**
 * Vérifier si un utilisateur existe
 * @param {string} username Le username a verifier
 * @returns {Promise<boolean>} Retournera true si l'utilisateur existe
 */
async function userExists(username) {
    const user = await prisma.user.findUnique({
        where: { username },
    });

    return user !== null;
}

/**
 * Créer un nouvel utilisateur
 * @param {string} username Le nom d'utilisateur
 * @param {string} password Le mot de passe
 * @returns {Promise<Object>} Retournera les informations de l'utilisateur créé
 */
export async function register(username, password) {
    if (typeof username !== "string" || typeof password !== "string") throw new HttpError(400, "Identifiants invalides");

    username = username.trim();

    if (!username || !password)
        throw new HttpError(400, "Le nom d'utilisateur et le mot de passe sont requis");

    if (username.length < MIN_USERNAME_LENGTH || username.length > MAX_USERNAME_LENGTH)
        throw new HttpError(400, `Le nom d'utilisateur doit faire entre ${MIN_USERNAME_LENGTH} et ${MAX_USERNAME_LENGTH} caractères`);

    if (await userExists(username))
        throw new HttpError(400, "Le nom d'utilisateur est déjà utilisé");

    if (!USERNAME_REGEX.test(username))
        throw new HttpError(400, "Le nom d'utilisateur ne peut contenir que des lettres, chiffres, _ et -");

    if (password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH)
        throw new HttpError(400, `Le mot de passe doit faire entre ${MIN_PASSWORD_LENGTH} et ${MAX_PASSWORD_LENGTH} caractères`);

    const hashedPassword = await hashPassword(password);

    try {
        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
            },
            select: {
                username: true,
            },
        });

        return user;
    } catch (error) {
        throw new HttpError(500, "Erreur lors de la création de l'utilisateur");
    }
}

/**
 * Vérifier si un utilisateur existe
 * @returns {Promise<boolean>} Retournera true si un utilisateur existe
 */
export async function aUserExists() {
    const user = await prisma.user.findFirst();
    return user !== null;
}

/**
 * Supprimer la session de l'utilisateur et le cookie de session
 */
export async function logout() {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("sessionToken")?.value;

    if (!sessionToken)
        throw new HttpError(400, "Aucun token de session trouvé");

    await prisma.session.deleteMany({
        where: { token: sessionToken },
    });

    cookieStore.delete("sessionToken", { path: "/" });
}

/**
 * Se connecter avec un nom d'utilisateur et un mot de passe
 * @param {string} username 
 * @param {string} password 
 * @returns 
 */
export async function login(username, password) {
    if (typeof username !== "string" || typeof password !== "string") throw new HttpError(400, "Identifiants invalides");

    username = username.trim();

    if (!username || !password)
        throw new HttpError(400, "Le nom d'utilisateur et le mot de passe sont requis");

    const user = await prisma.user.findUnique({
        where: { username },
        select: {
            id: true,
            username: true,
            password: true,
        },
    });

    if (!user) throw new HttpError(401, "Nom d'utilisateur ou mot de passe incorrect");

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) throw new HttpError(401, "Nom d'utilisateur ou mot de passe incorrect");

    const token = generateSessionToken();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 jours

    await prisma.session.deleteMany({
        where: {
            userId: user.id,
        },
    });

    await prisma.session.create({
        data: {
            token,
            expiresAt,
            userId: user.id,
        },
    });

    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();

    cookieStore.set("sessionToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: expiresAt,
        path: "/",
    });

    return {
        username: user.username,
    }
}

/**
 * Récupérer la session de l'utilisateur actuel
 * @returns {Promise<Object|null>} Retournera la session de l'utilisateur actuel ou null si aucune session n'est trouvée
 */
export async function getCurrentSession() {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("sessionToken")?.value;

    if (!sessionToken) return null;

    const session = await prisma.session.findUnique({
        where: { token: sessionToken },
        select: {
            token: true,
            userId: true,
            expiresAt: true,
            user: {
                select: {
                    id: true,
                    username: true,
                }
            }
        }
    });

    if (!session) return null;

    if (session.expiresAt <= new Date()) {
        await prisma.session.delete({
            where: { token: sessionToken },
        });
        return null;
    }

    return session;
}