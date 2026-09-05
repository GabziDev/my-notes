import { useEffect, useState } from "react";

export default function FileCreation({ targetPath, onClose, onCreated }) {
    const [path, setPath] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        setPath(targetPath + "/");
    }, []);

    async function handleCreateFile(event) {
        event.preventDefault();
        
        setError("");

        const fileName = path.split("/").pop().replace(/\.[^/.]+$/, "");

        try {
            const response = await fetch(`/api/files/${path}.md`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    content: `# ${fileName}`
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Impossible de créer le fichier")
            } else {
                onCreated();
                onClose();
            }
        } catch { }
    }

    return (
        <div className="modal">
            <div className="box">
                <div className="head">
                    <h2>Nom du fichier</h2>
                    <p>Créez un nouveau fichier avec son chemin complet et son nom.</p>
                </div>
                <form className="form" onSubmit={handleCreateFile}>
                    <label>
                        <input type="text" placeholder="Exemple : doc/cyber/vol1" value={path} onChange={(e) => setPath(e.target.value)} required />
                        <h6>L’extension .md est ajoutée automatiquement.</h6>
                    </label>
                    {error && <p className="error">{error}</p>}
                    <div className="actions">
                        <button type="submit" className="ghost">Créer</button>
                        <button type="button" onClick={onClose}>Annuler</button>
                    </div>
                </form>
            </div>
        </div>
    )
}