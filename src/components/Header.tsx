import { File as FileIcon, Folder } from "lucide-react"
import { useCallback } from "react"

import { ipcRenderer } from "electron";
import { showErrorDialog } from "../utils";
import { useFiles } from "./Files.context";

type ButtonProps = React.PropsWithChildren & React.HTMLAttributes<HTMLButtonElement>

const Button = ({
    children,
    className,
    ...props
}: ButtonProps) => {
    return (
        <button className={`btn btn-primary join-item ${className}`} {...props}>{children}</button>
    )
}

interface DialogResponse {
    canceled: boolean
    filePaths: string[]
}

type ListFileReturn = Array<{
    name: string
    path: string
    isDirectory: boolean
    size: number
}>

const Header = () => {
    const { dispatch } = useFiles()

    const handleFolderOpen = useCallback(() => {
        ipcRenderer.invoke("dialog", "showOpenDialog", {
            properties: ["openDirectory"],
        })
            .then((response: DialogResponse) => {
                if (response.canceled) return
                ipcRenderer.invoke("listFiles", response.filePaths[0])
                    .then((response: ListFileReturn) => {
                        const paths = response
                            .filter((file) => !file.isDirectory)
                            .map((file) => file.path)
                        dispatch({ type: "ADD_FILES", payload: paths });
                    })
                    .catch((err: Error) => {
                        showErrorDialog("Error listing files in folder", err.message);
                    });
            })
            .catch((err: Error) => {
                showErrorDialog("Error with folders", err.message);
            });
    }, []);

    const handleFileOpen = useCallback(() => {
        ipcRenderer.invoke("dialog", "showOpenDialog", {
            properties: ["openFile", "multiSelections"],
        })
            .then((response: DialogResponse) => {
                dispatch({ type: "ADD_FILES", payload: response.filePaths })
            })
            .catch((err: Error) => {
                showErrorDialog("Error with files", err.message);
            });
    }, []);

    return (
        <div className="select-none flex flex-col items-center justify-center gap-5 p-5 bg-primary/5 border-b-2 border-primary/10 shadow rounded-b-md">
            <h1 className="text-5xl font-extrabold text-primary mb-3">Rename</h1>
            <div className="join mb-0 p-0">
                <Button onClick={handleFolderOpen}>
                    Open folder
                    <Folder size={24} className="ml-2" />
                </Button>
                <Button className="btn-active" onClick={handleFileOpen}>
                    Add files
                    <FileIcon size={24} className="ml-2" />
                </Button>
            </div>
        </div>
    )
}

export default Header