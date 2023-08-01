/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useCallback, useId } from "react"

type ModalProps = {
    content: React.ReactNode
} & React.PropsWithChildren

const Modal = ({ children, content }: ModalProps) => {
    const id = useId();

    const handleModalOpen = useCallback(() => {
        // @ts-ignore
        window[id].showModal();
    }, [id])

    return (
        <>
            <dialog id={id} className="modal">
                <form method="dialog" className="modal-box max-w-full md:max-w-5xl">
                    {content}
                </form>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
            <div onClick={handleModalOpen}>{children}</div>
        </>
    )
}

export default Modal;