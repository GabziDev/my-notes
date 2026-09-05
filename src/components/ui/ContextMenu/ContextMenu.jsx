import { useContextMenu } from "@/context/ContextMenuContext";
import Style from "./ContextMenu.module.css";

export default function ContextMenu({ x, y, items }) {
    const { closeMenu } = useContextMenu();

    return (
        <ul
            className={Style.contextMenu}
            style={{ top: y, left: x }}
            onClick={(e) => e.stopPropagation()}
        >
            {items.map((item) => (
                <li key={item.label}>
                    <button
                        onClick={async () => {
                            await item.onClick();
                            closeMenu();
                        }}
                        className={Style.contextMenuItem}
                    >
                        <i className={item.bootstrapIcon}></i>{item.label}
                    </button>
                </li>
            ))}
        </ul>
    );
}