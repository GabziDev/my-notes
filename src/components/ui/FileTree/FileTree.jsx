"use client"

import { useState } from "react";
import Style from "./FileTree.module.css";

function ArrowIcon({ open }) {
    return (
        <i className={`${Style.arrow} ${open ? Style.arrowOpen : ""} bi bi-caret-right`}></i>
    );
}

function FolderIcon({ open }) {
    return (
        <>
            {open ? (
                <i className="bi bi-folder2-open" ></i>
            ) : (
                <i className="bi bi-folder-fill"></i>
            )}
        </>
    );
}

function FileIcon() {
    return (
        <i className="bi bi-filetype-md"></i>
    );
}

export default function FileTree({ node, onSelectFile, selectedPath }) {
    if (node.type === "file") {
        const isSelected = node.path === selectedPath;

        return (
            <li className={Style.fileNode}>
                <button
                    className={`${Style.node} ${isSelected ? Style.selected : ""}`}
                    onClick={() => onSelectFile(node.path)}
                >
                    <span className={Style.iconSlot} />
                    <span className={Style.icon}>
                        <FileIcon />
                    </span>
                    <span className={Style.label}>{node.name}</span>
                </button>
            </li>
        );
    }

    return <FolderNode node={node} onSelectFile={onSelectFile} selectedPath={selectedPath} />;
}


function FolderNode({ node, onSelectFile, selectedPath }) {
    const [open, setOpen] = useState(true);

    return (
        <li className={Style.folderNode}>
            <button
                className={Style.node}
                onClick={() => setOpen((prev) => !prev)}
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
                        />
                    ))}
                </ul>
            )}
        </li>
    );
}