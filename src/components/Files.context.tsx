import { create } from "zustand"
import { persist } from "zustand/middleware"

type FilesStore = {
    files: string[]
    dispatch: React.Dispatch<FileAction>
    selectedFiles?: string[]
} | undefined

export type FileAction =
    | { type: "ADD_FILES", payload: string[] }
    | { type: "REMOVE_FILE", payload: string }
    | {
        type: "TOGGLE_FILE_SELECT", payload: {
            name: string
            selected: boolean
        }
    }
    | { type: "SELECT_ALL_FILES" }
    | { type: "UNSELECT_ALL_FILES" }
    | { type: "REMOVE_FILES" }

export const useFiles = create(
    persist<FilesStore>(
        (set) => ({
            files: [],
            selectedFiles: [],
            dispatch: (action: FileAction) => {
                switch (action.type) {
                    case "ADD_FILES":
                        set(state => {
                            const newFilesToAdd = action.payload.filter(file => !state.files.includes(file))
                            return {
                                files: [...state.files, ...newFilesToAdd]
                            }
                        })
                        return
                    case "REMOVE_FILE":
                        set(state => ({
                            files: state.files.filter(file => file !== action.payload),
                            selectedFiles: state.selectedFiles?.filter(file => file !== action.payload)
                        }))
                        return
                    case "REMOVE_FILES":
                        set({
                            files: [],
                            selectedFiles: []
                        })
                        return
                    case "TOGGLE_FILE_SELECT":
                        set(state => {
                            const { name, selected } = action.payload
                            let selectedFiles = state.selectedFiles
                            if (selected) {
                                selectedFiles = [...selectedFiles, name]
                            } else {
                                selectedFiles = selectedFiles.filter(file => file !== name)
                            }
                            return {
                                selectedFiles
                            }
                        })
                        return
                    case "SELECT_ALL_FILES":
                        set(state => ({
                            selectedFiles: state.files
                        }))
                        return
                    case "UNSELECT_ALL_FILES":
                        set({
                            selectedFiles: []
                        })
                        return
                }
            },
        }),
        {
            name: 'files-storage', // unique name
        }
    )
)