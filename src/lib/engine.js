import "server-only";

import fs from "node:fs/promises"
import path from "node:path"
import { HttpError } from "@/lib/errors";

const ROOT_DIR = path.resolve(process.cwd(), "files");
const ALLOWED_EXTENSION = ".md";

/**
 * Valide et resolve un chemin relatif ("docs/readme.md" ou [¨docs", "readme.md"])
 * 
 * Bloque les sortie de ROOT_DIR et toutes extension qui ne sont pas inclus dans ALLOWED_EXTENSION
 * 
 * @param {*} relativepathOrSegments 
 * @returns 
 */
function resolveSafePath(relativepathOrSegments) {
    const relativePath = Array.isArray(relativepathOrSegments) ? relativepathOrSegments.join("/") : relativepathOrSegments;

    const cleaned = String(relativePath).replace(/\0/g, ""); // anti null byte inject
    const resolved = path.resolve(ROOT_DIR, cleaned);

    const isInsideRoot = resolved === ROOT_DIR || resolved.startsWith(ROOT_DIR + path.sep);

    if (!isInsideRoot) throw new Error("en dehors du dossier /files");
    if (path.extname(resolved).toLowerCase() !== ALLOWED_EXTENSION) throw new Error("seulement les fichiers dans ALLOWED_EXTENSION sont autorisé");

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
 * Lit le contenu d'un fichier .md dans /files
 * 
 * @param {*} relativepathOrSegments 
 * @returns 
 */
export async function readFileContent(relativepathOrSegments) {
    const targetPath = resolveSafePath(relativepathOrSegments);
    const relativePath = path.relative(ROOT_DIR, targetPath).split(path.sep).join("/");

    const content = await fs.readFile(targetPath, "utf-8");

    return { path: relativePath, content }
}

/**
 * save (ecrase ou créer) un fichier .md dans /files
 * (Le dernier qui save gagne)
 * 
 * @param {*} relativepathOrSegments 
 * @param {*} content 
 * @returns 
 */
export async function saveFileContent(relativepathOrSegments, content) {
    if (typeof content !== "string") throw new HttpError(400, "le content à sauvegarder doit etre une chaine de caractères");

    const targetPath = resolveSafePath(relativepathOrSegments);
    const relativePath = path.relative(ROOT_DIR, targetPath).split(path.sep).join("/");

    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.writeFile(targetPath, content, "utf-8");

    return { path: relativePath }
}

export { ROOT_DIR }