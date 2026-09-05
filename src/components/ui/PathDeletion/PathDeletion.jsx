export default function PathDeletion({ targetPath, onClose, onDeleted }) {

    async function handleDelete(event) {
        event.preventDefault();

        try {
            await fetch(`/api/files/${targetPath}`, {
                method: "DELETE"
            });

            onDeleted();
            onClose();
        } catch { }
    }

    return (
        <div className="modal">
            <div className="box">
                <div className="head">
                    <h2>Suppression</h2>
                    <p>S’il s’agit d’un dossier, tout son contenu sera supprimé.</p>
                </div>
                <form className="form" onSubmit={handleDelete}>
                    <div className="actions">
                        <button type="submit" className="ghost">Confirmer</button>
                        <button type="button" onClick={onClose}>Annuler</button>
                    </div>
                </form>
            </div>
        </div>
    )
}