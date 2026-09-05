import Style from "./FileEditor.module.css";

import MDEditor from "@uiw/react-md-editor";

export default function FileEditor({ value, onChange }) {
    return (
        <MDEditor
            className={Style.editor}
            value={value}
            onChange={onChange}
        />
    )
}