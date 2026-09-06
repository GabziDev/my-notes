import Style from "./FileEditor.module.css";

import MDEditor, { commands } from "@uiw/react-md-editor";

function generateToc(markdown) {
    const lines = markdown.split("\n"); // decoupe le texte en tableau 
    const headings = lines.filter(line => /^#{1,3}\s/.test(line)); // garde que les lignes qui sont des titres (1 à 3 #)

    return headings.map(line => {
        const level = line.match(/^#+/)[0].length; // nombre de #
        const rawText = line.replace(/^#+\s/, "").trim(); // extrait le titre sans les #
        const displayText = rawText.replace(/</g, "&lt;").replace(/>/g, "&gt;");  // remplace les < > par &lt; ou &gt;
        const anchor = rawText
            .toLowerCase() // mettre en minuscules
            .replace(/[^\p{L}\p{N}\s-]/gu, "") // garde les lettres, chiffre, accents, espaces et tirets
            .replace(/\s+/g, "-"); // remplace les espaces par des tirets
        const indent = "  ".repeat(level - 1); // indentation selon le niveau du titre
        return `${indent}- [${displayText}](#${anchor})`; // format de la ligne
    }).join("\n");
}

const tocCommand = {
    name: "Table des matières",
    keyCommand: "toc",
    shortcuts: "",
    buttonProps: {},
    icon: <span>TOC</span>,
    execute: (state, api) => {
        const fullText = state.text;
        const cursorPosition = state.selection.end;

        // le texte que après le curseur
        const textAfterCursor = fullText.slice(cursorPosition);

        const tocContent = generateToc(textAfterCursor);
        api.replaceSelection(tocContent);
    },
};

export default function FileEditor({ value, onChange }) {
    return (
        <MDEditor
            className={Style.editor}
            value={value}
            onChange={onChange}
            commands={[...commands.getCommands(), tocCommand]}
        />
    )
}