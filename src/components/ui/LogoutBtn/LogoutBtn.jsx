import Style from "./LogoutBtn.module.css"
import { useRouter } from "next/navigation";

export default function LogoutBtn() {
    const router = useRouter();

    async function logout() {
        try {
            const response = await fetch("/api/auth/logout", {
                method: "POST"
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.error || "Une erreur s'est produtie");
                return;
            }

            router.refresh();
        } catch {
            alert("Erreur avec le serveur");
        }
    }

    return (
        <button onClick={logout} className={Style.logout}><i className="bi bi-box-arrow-right"></i>Se déconnecter</button>
    )
}