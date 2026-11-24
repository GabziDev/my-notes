import "server-only";

import fs from "node:fs/promises"
import path from "node:path"
import { HttpError } from "@/lib/errors";

const ROOT_DIR = path.resolve(process.cwd(), "files");
const ALLOWED_EXTENSION = ".md";

const MAX_FILE_SIZE = 1000000;
const MAX_FOLDER_LEVELS = 6;
const MAX_NAME_LENGTH = 100;
const MAX_PATH_LENGTH = 400;

// commence par lettre chiffre ou _ puis lettres chiffres espace et _ . () ' -
const NAME_PATTERN = /^[\p{L}\p{N}_][\p{L}\p{N} _.()'’-]*$/u;

function isValidName(name) {
    return name.length <= MAX_NAME_LENGTH && NAME_PATTERN.test(name);
}

/**
 * Valide et resolve un chemin relatif ("docs/readme.md" ou [¨docs", "readme.md"])
 * 
 * Bloque les sortie de ROOT_DIR
 * 
 * @param {*} relativepathOrSegments 
 * @returns 
 */
function resolveSafePath(relativepathOrSegments) {
    const relativePath = Array.isArray(relativepathOrSegments) ? relativepathOrSegments.join("/") : relativepathOrSegments;

    const cleaned = String(relativePath).replace(/\0/g, ""); // anti null byte inject

    if (cleaned.length > MAX_PATH_LENGTH)
        throw new HttpError(400, "chemin trop long");

    if (cleaned.includes("\\") || /^[a-zA-Z]:/.test(cleaned)) 
        throw new Error("caractères de chemin non autorisé")

    const segments = cleaned.split("/").filter((s) => s !== "" && s !== ".");

    if (segments.length > MAX_FOLDER_LEVELS)
        throw new HttpError(400, "chemin trop deep");

    if (!segments.every(isValidName))
        throw new HttpError(400, "nom de fichier ou de dossier invalide");
        
    const resolved = path.resolve(ROOT_DIR, cleaned);

    const isInsideRoot = resolved === ROOT_DIR || resolved.startsWith(ROOT_DIR + path.sep);
    if (!isInsideRoot) throw new Error("en dehors du dossier /files");

    return resolved;
}

/**
 * Construit recursivement l'arbo d'un dossier
 * @param {*} dirPath 
 * @returns 
 */
async function buildTree(dirPath) {
    // lire les fichiers et dossiers
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    const nodes = await Promise.all(
        entries.map(async (e) => {
            // ignorer les lien symboliques
            if (e.isSymbolicLink()) return null;

            const fullPath = path.join(dirPath, e.name);
            const relativePath = path.relative(ROOT_DIR, fullPath).split(path.sep).join("/");

            if (e.isDirectory()) {
                const children = await buildTree(fullPath);

                // si aucun fichier
                //if (children.length === 0) return null;

                return {
                    name: e.name,
                    type: "folder",
                    path: relativePath,
                    children
                }
            }

            if (e.isFile()) {
                if (path.extname(e.name).toLowerCase() !== ALLOWED_EXTENSION) return null;

                let size = null;
                try {
                    const stats = await fs.stat(fullPath);
                    size = stats.size;
                } catch { }

                return {
                    name: e.name,
                    type: "file",
                    path: relativePath,
                    size
                }
            }

            return null;
        })
    );

    // retirer les null
    return nodes.filter(Boolean);
}

/**
 * Renvoie l'arbo complete de /files
 * @returns 
 */
export async function getFileTree() {
    await fs.mkdir(ROOT_DIR, { recursive: true });

    const children = await buildTree(ROOT_DIR);

    return {
        name: "files",
        type: "folder",
        path: ".",
        children
    }
}

/**
 * Lit le contenu d'un fichier .md ou envoie les infos d'un dossier
 * 
 * @param {*} relativepathOrSegments 
 * @returns 
 */
export async function readPath(relativepathOrSegments) {
    const targetPath = resolveSafePath(relativepathOrSegments);
    const relativePath = path.relative(ROOT_DIR, targetPath).split(path.sep).join("/");

    let stats;
    try {
        stats = await fs.stat(targetPath);
    } catch {
        throw new HttpError(404, "chemin introuvable");
    }

    if (stats.isDirectory())
        return { path: relativePath, type: "folder" };

    if (stats.isFile()) {
        if (path.extname(targetPath).toLowerCase() !== ALLOWED_EXTENSION) throw new HttpError(400, "seulement les fichiers .md sont autorisés");

        //if (stats.size > MAX_FILE_SIZE) throw new HttpError(413, "fichier trop volumineux");

        const content = await fs.readFile(targetPath, "utf-8");
        return { path: relativePath, type: "file", content }
    }

    throw new HttpError(400, "type de chemin non supporté");
}

/**
 * Suppression dun fichier ou d'un dossier
 * 
 * @param {*} relativepathOrSegments 
 * @returns 
 */
export async function deletePath(relativepathOrSegments) {
    const targetPath = resolveSafePath(relativepathOrSegments);
    const realtivePath = path.relative(ROOT_DIR, targetPath).split(path.sep).join("/");

    let stats;
    try {
        stats = await fs.stat(targetPath);
    } catch {
        throw new HttpError(404, "chemin introuvable");
    }

    if (stats.isDirectory()) {
        await fs.rm(targetPath, { recursive: true, force: true });
        return { path: realtivePath, message: "Dossier supprimer" };
    }

    if (stats.isFile()) {
        await fs.unlink(targetPath);
        return { path: realtivePath, message: "Fichier supprimer" };
    }

    throw new HttpError(400, "type de chemin non supporté");
}

/**
 * Modifier le contenu d'un fichier
 * 
 * @param {*} relativepathOrSegments 
 * @param {*} content 
 */
export async function editFileContent(relativepathOrSegments, content) {
    if (typeof content !== "string") throw new HttpError(400, "le content à sauvegarder doit etre une chaine de caractères");

    if (Buffer.byteLength(content, "utf-8") > MAX_FILE_SIZE) throw new HttpError(413, "fichier trop gros");

    const targetPath = resolveSafePath(relativepathOrSegments);

    if (path.extname(targetPath).toLowerCase() !== ALLOWED_EXTENSION)
        throw new HttpError(400, "seulement les fichiers .md sont autorisés");

    try {
        await fs.access(targetPath);
    } catch {
        throw new HttpError(404, "fichier introuvable");
    }

    await fs.writeFile(targetPath, content, "utf-8");
}

/**
 * Créer un fichier
 * 
 * @param {*} relativepathOrSegments 
 * @returns 
 */
export async function createFile(relativepathOrSegments) {
    const targetPath = resolveSafePath(relativepathOrSegments);

    if (path.extname(targetPath).toLowerCase() !== ALLOWED_EXTENSION)
        throw new HttpError(400, "seulement les fichiers .md sont autorisés");

    const relativePath = path.relative(ROOT_DIR, targetPath).split(path.sep).join("/");
    const fileName = path.basename(targetPath, ALLOWED_EXTENSION);

    const alreadyExists = await fs.access(targetPath).then(() => true).catch(() => false);
    if (alreadyExists)
        throw new HttpError(409, "un fichier avec ce nom existe déjà");

    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.writeFile(targetPath, `# ${fileName}`, "utf-8");

    return { path: relativePath }

}

export { ROOT_DIR }