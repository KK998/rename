import { useCallback, useMemo, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Play, Trash } from "lucide-react"
import Modal from "./Modal"
import { useFiles } from "./Files.context"
import { renameFiles } from "../utils"

type FileProps = {
    name: string
    i: number
    type: 'file' | 'folder'
}

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

type InputProps = {
    name: string | 'append' | 'prepend' | 'increment',
    value?: string | number
    checked?: boolean
    type?: 'text' | 'checkbox'
} & React.HTMLAttributes<HTMLInputElement>

const Input = ({ name, className, ...props }: InputProps) => (
    <div className="form-control w-full">
        <label className="label">
            <span className="label-text">{capitalize(name)}:</span>
        </label>
        <input name={name} type="text" placeholder="Type here" className={`input input-bordered w-full ${className}`} {...props} />
    </div>
)

const FileModal = () => {
    const { selectedFiles, files, dispatch } = useFiles();
    const [inputs, setInputs] = useState({
        prepend: '',
        append: '',
        increment: false,
        fixToDigits: 0,
    })

    const handleInputChange = useCallback((e: React.FormEvent<HTMLInputElement>) => {
        const { name, value } = e.currentTarget
        setInputs(state => ({
            ...state,
            [name]: value
        }))
    }, [])

    const handleCheckboxToggle = useCallback((e: React.FormEvent<HTMLInputElement>) => {
        const { name, checked } = e.currentTarget
        setInputs(state => ({
            ...state,
            [name]: checked
        }))
    }, [])

    const handleModalSubmit = useCallback(() => {
        renameFiles({
            files: selectedFiles.length > 0 ? selectedFiles : files,
            options: {
                prepend: inputs.prepend,
                append: inputs.append,
            },
            increment: inputs.increment,
            dispatch,
            fixToDigits: inputs.fixToDigits,
        })
    }, [selectedFiles, files, inputs])

    return (
        <div className="flex flex-col gap-5 w-full">
            <h1 className="text-4xl font-bold text-primary-focus">Rename files</h1>
            <p className="text-current">Append or prepend text to your files without changing file extensions.</p>
            <div className="grid grid-cols-2 gap-5">
                <Input value={inputs.prepend} onChange={handleInputChange} name="prepend" />
                <Input value={inputs.append} onChange={handleInputChange} name="append" />
                <div className="form-control w-full">
                    <label className="label">
                        <span className="label-text">Force to length:</span>
                    </label>
                    <input value={inputs.fixToDigits} name={"fixToDigits"} onChange={handleInputChange} type="text" className={`input input-bordered w-full`} />
                </div>
                <div className="form-control place-items-end">
                    <label className="label cursor-pointer">
                        <span className="label-text mr-2">Increment numbers</span>
                        <input type="checkbox" className="checkbox" checked={inputs.increment} onChange={handleCheckboxToggle} name="increment" />
                    </label>
                </div>
            </div>
            <button onClick={handleModalSubmit} className="btn btn-success mt-5 ml-auto">
                Rename
                <Play size={16} />
            </button>
        </div>
    )
}

const File = ({ name, i }: FileProps) => {
    const { dispatch, selectedFiles } = useFiles();
    const isSelected = useMemo(() => selectedFiles?.includes(name), [selectedFiles]);

    const handleFileCheck = (e: React.FormEvent<HTMLInputElement>) => {
        dispatch({
            type: 'TOGGLE_FILE_SELECT', payload: {
                name,
                selected: e.currentTarget.checked
            }
        })
    }

    return (
        <tr className="hover">
            <td colSpan={2} className="flex items-center gap-2">
                <span className="font-bold text-lg mr-2">{i}</span>
                <input checked={isSelected} onChange={handleFileCheck} type="checkbox" className="checkbox" />
                {name}
            </td>
        </tr>
    )
}

const Files = () => {
    const { getRootProps, getInputProps } = useDropzone({
        noClick: true,
        onDrop: acceptedFiles => {
            dispatch({ type: "ADD_FILES", payload: acceptedFiles.map(file => file.path) })
        }
    });

    const { files, selectedFiles, dispatch } = useFiles()

    const handleSelectedFilesRemove = useCallback(() => {
        if (selectedFiles?.length === 0) {
            dispatch({ type: "REMOVE_FILES" });
            return
        }
        selectedFiles.forEach(file => {
            dispatch({ type: "REMOVE_FILE", payload: file })
        });
    }, [selectedFiles]);

    const areAllFilesSelected = useMemo(() => {
        if (selectedFiles?.length === 0) return false
        return selectedFiles?.length === files.length
    }, [selectedFiles, files])

    const handleAllFilesCheck = (e: React.FormEvent<HTMLInputElement>) => {
        if (e.currentTarget.checked) {
            dispatch({ type: "SELECT_ALL_FILES" })
            return
        }
        dispatch({ type: "UNSELECT_ALL_FILES" })
    }

    if (files.length === 0) return (
        <div className="flex flex-col w-[98%] h-full grow p-2 my-2 mx-auto border-2 border-dashed rounded border-primary/20">
            <div {...getRootProps({ className: 'flex h-full flex-grow items-center justify-center' })}>
                <input {...getInputProps()} />
                <h1 className="text-xl font-medium select-none">Drag 'n' drop some files here</h1>
            </div>
        </div>
    )

    return (
        <div {...getRootProps({ className: "flex flex-col gap-5 p-5 grow" })}>
            <input {...getInputProps()} />
            <div className="overflow-x-auto">
                <table className="table">
                    <thead>
                        <tr>
                            <th className="flex items-center justify-between">
                                <span className="items-center flex">
                                    <input onChange={handleAllFilesCheck} checked={areAllFilesSelected} type="checkbox" className="checkbox ml-6 mr-2" />
                                    File path
                                </span>
                                <span className="flex items-center justify-end gap-4">
                                    {selectedFiles?.length > 0 && (
                                        <span className="font-normal text-primary-focus mr-2">Files selected <strong>{selectedFiles.length}</strong></span>
                                    )}
                                    <Modal content={<FileModal />}>
                                        <button className="btn btn-success btn-circle">
                                            <Play size={20} className="shadow" />
                                        </button>
                                    </Modal>
                                    <button onClick={handleSelectedFilesRemove} className="btn btn-error btn-circle">
                                        <Trash size={20} className="shadow" />
                                    </button>
                                </span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {files.map((file, index) => (
                            <File key={index} i={index + 1} name={file} type="file" />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Files