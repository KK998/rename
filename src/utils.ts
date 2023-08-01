import { ipcRenderer } from "electron"
import toast from "react-hot-toast"
import { FileAction } from "./components/Files.context"

export const showErrorDialog = (title: string, content: string) => {
    ipcRenderer.invoke("dialog", "showErrorBox", {
        title,
        content
    })
}

type renameOptions = {
    prepend: string,
    append: string
}

export const renameFile = (path: string, options: renameOptions) => {
    const { prepend, append } = options

    const pathParts = path.split("/")
    const fileName = pathParts[pathParts.length - 1]
    const fileNameParts = fileName.split(".")
    const fileNameWithoutExtension = fileNameParts.slice(0, fileNameParts.length - 1).join(".")
    const newFileNameWithoutExtension = prepend + fileNameWithoutExtension + append;
    const fileExtension = fileNameParts[fileNameParts.length - 1]
    const newPath = pathParts.slice(0, pathParts.length - 1).join("/") + "/" + newFileNameWithoutExtension + "." + fileExtension
    ipcRenderer.invoke("renameFile", path, newPath)
        .then(() => {
            toast.success(`Renamed ${fileNameWithoutExtension} to ${newFileNameWithoutExtension}`)
        })
        .catch((err: Error) => {
            showErrorDialog("Error with files", err.message);
        })
}

type renameFilesOptions = {
    files: string[],
    options: renameOptions
    dispatch: (value: FileAction) => void
    increment: boolean
    fixToDigits?: number
}

export const renameFiles = (options: renameFilesOptions) => {
    const { files, options: inputs, dispatch, increment, fixToDigits } = options

    if (increment) {
        let prependStart: string | number = inputs.prepend;
        let appendStart: string | number = inputs.append;
        if (!isNaN(parseInt(inputs.prepend))) {
            prependStart = parseInt(inputs.prepend)
        }
        if (!isNaN(parseInt(inputs.append))) {
            appendStart = parseInt(inputs.append)
        }
        files.forEach((file) => {
            renameFile(file, {
                prepend: `${prependStart}`.padStart(fixToDigits || 0, "0"),
                append: `${appendStart}`.padStart(fixToDigits || 0, "0")
            })
            dispatch({ type: 'REMOVE_FILE', payload: file });
            typeof prependStart === "number" && prependStart++;
            typeof appendStart === "number" && appendStart++;
        })
    } else {
        files.forEach((file) => {
            renameFile(file, {
                prepend: inputs.prepend,
                append: inputs.append
            })
            dispatch({ type: 'REMOVE_FILE', payload: file });
        })
    }
}