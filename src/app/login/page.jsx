"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import "@/styles/pages/auth.css";

export default function Page() {
    const router = useRouter();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Une erreur s'est produite");
                return;
            }

            router.push("/");
            router.refresh();
        } catch {
            setError("Erreur avec le serveur");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth">
            <div className="container">
                <div className="head">
                    <h2>Connectez-vous</h2>
                    <p>Ravi de vous revoir :&#41;</p>
                </div>
                <form className="form" onSubmit={handleSubmit}>
                    <label>
                        <span>Nom d'utilisateur</span>
                        <input type="text" placeholder="Entrez votre nom d'utilisateur" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required />
                    </label>
                    <label>
                        <span>Mot de passe</span>
                        <input type="password" placeholder="Entrez votre mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </label>
                    <button type="submit" disabled={loading}>
                        {loading ? "Connexion..." : "Connexion"}
                    </button>
                    {error && (
                        <p className="error">{error}</p>
                    )}
                </form>
            </div>
            <footer><h6>© My Notes. Tous droits réservés.</h6></footer>
        </div>
    );
}