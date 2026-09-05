"use client"

import { useState } from "react";
import Style from "./FileTree.module.css";
import { useContextMenu } from "@/context/ContextMenuContext";

function ArrowIcon({ open }) {
    return <i className={`${Style.arrow} ${open ? Style.arrowOpen : ""} bi bi-caret-right`}></i>
}

function FolderIcon({ open }) {
    return open ? <i className="bi bi-folder2-open" ></i> : <i className="bi bi-folder-fill"></i>
}

function FileIcon() {
    return <i className="bi bi-filetype-md"></i>
}

async function deletePath(path) {
    await fetch(`/api/files/${path}`, { method: "DELETE" });
}

async function createFile(path) {
    await fetch(`/api/files/${path}`, { method: "POST" });
}

export default function FileTree({ node, onSelectFile, selectedPath, onRefresh, onOpenCreate }) {
    const {showMenu} = useContextMenu();

    if (node.type === "file") {
        const isSelected = node.path === selectedPath;

        return (
            <li className={Style.fileNode}>
                <button
                    className={`${Style.node} ${isSelected ? Style.selected : ""}`}
                    onClick={() => onSelectFile(node.path)}
                    onContextMenu={(e) =>
                        showMenu(e, [
                            {
                                bootstrapIcon: "bi bi-trash3", label: "Supprimer le fichier", onClick: async () => {
                                    await deletePath(node.path);
                                    onRefresh();
                                }
                            },
                        ])
                    }
                >
                    <span className={Style.iconSlot} />
                    <span className={Style.icon}>
                        <FileIcon />
                    </span>
                    <span className={Style.label}>{node.name.split("/").pop().replace(/\.[^/.]+$/, "")}</span>
                </button>
            </li>
        );
    }

    return <FolderNode node={node} onSelectFile={onSelectFile} selectedPath={selectedPath} onRefresh={onRefresh} onOpenCreate={onOpenCreate} />;
}


function FolderNode({ node, onSelectFile, selectedPath, onRefresh, onOpenCreate }) {
    const [open, setOpen] = useState(false);
    const { showMenu } = useContextMenu();

    return (
        <li className={Style.folderNode}>
            <button
                className={Style.node}
                onClick={() => setOpen((prev) => !prev)}
                onContextMenu={(e) =>
                    showMenu(e, [
                        {
                            bootstrapIcon: "bi bi-trash3", label: "Supprimer le dossier", onClick: async () => {
                                await deletePath(node.path)
                                onRefresh();
                            }
                        },
                        {
                            bootstrapIcon: "bi bi-plus-square", label: "Créer ici", onClick: async () => {
                                onOpenCreate(node.path);
                            }
                        }
                    ])
                }
            >
                <span className={Style.iconSlot}>
                    <ArrowIcon open={open} />
                </span>
                <span className={Style.icon}>
                    <FolderIcon open={open} />
                </span>
                <span className={Style.label}>{node.name}</span>
            </button>

            {open && (
                <ul className={Style.children}>
                    {node.children.map((child) => (
                        <FileTree
                            key={child.path}
                            node={child}
                            onSelectFile={onSelectFile}
                            selectedPath={selectedPath}
                            onRefresh={onRefresh}
                            onOpenCreate={onOpenCreate}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
}