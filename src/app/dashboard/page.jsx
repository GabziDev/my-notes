"use client"

import { useCallback, useEffect, useState } from "react";
import "@/styles/pages/dashboard.css"
import FileEditor from "@/components/ui/FileEditor/FileEditor";
import FileTree from "@/components/ui/FileTree/FileTree";
import LogoutBtn from "@/components/ui/LogoutBtn/LogoutBtn";

export default function Page() {
    const [tree, setTree] = useState(null);
    const [selectedPath, setSelectedPath] = useState(null);
    const [value, setValue] = useState("");
    const [status, setStatus] = useState(""); // loading, saving saved ou error

    useEffect(() => {
        fetch("/api/files")
            .then((res) => res.json())
            .then(setTree)
            .catch(() => setStatus("error"));
    }, []);

    async function handleSelectFile(filePath) {
        setSelectedPath(filePath);
        setStatus("loading");

        try {
            const res = await fetch(`/api/files/${filePath}`);
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            setValue(data.content);
            setStatus("");
        } catch {
            setStatus("error");
        }
    }

    const handleSave = useCallback(async () => {
        if (!selectedPath) return;

        setStatus("saving");

        try {
            const res = await fetch(`/api/files/${selectedPath}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: value }),
            });

            if (!res.ok) throw new Error();

            setStatus("saved");
            setTimeout(() => setStatus(""), 1500);
        } catch {
            setStatus("error");
        }
    }, [selectedPath, value]);

    useEffect(() => {
        function handleKeyDown(e) {
            const isSaveShortcut = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s";

            if (isSaveShortcut) {
                e.preventDefault();
                handleSave();
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleSave]);

    return (
        <div className="dashboard">
            <div className="aside">
                <div className="head">
                    <h3>Notes</h3>
                    <button><i className="bi bi-plus"></i></button>
                </div>
                <h6>Content</h6>
                {tree && (
                    <div className="arbo">
                        {tree.children.map((child) => (
                            <FileTree
                                key={child.path}
                                node={child}
                                onSelectFile={handleSelectFile}
                                selectedPath={selectedPath}
                            />
                        ))}
                    </div>
                )}

                <div className="bot">
                    <LogoutBtn />
                </div>
            </div>
            <div className="file">
                {selectedPath && (
                    <>
                        <div className="toolbar">
                            <span className="file-info">
                                <i className="bi bi-filetype-md"></i>
                                <span>{selectedPath.split("/").pop().replace(/\.[^/.]+$/, "")}</span>
                                <span>{selectedPath.split("/").slice(0, -1).join("/")}</span>
                            </span>
                            <span>
                                {status === "saved" && <span className="status-ok"><i className="bi bi-save2"></i></span>}
                                {status === "error" && <span className="status-error">Erreur</span>}
                            </span>
                        </div>

                        <FileEditor className="editor" value={value} onChange={setValue} />
                    </>
                )}
            </div>
        </div>
    );
}