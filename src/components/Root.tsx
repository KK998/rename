import { Toaster } from 'react-hot-toast';

import Files from "./Files"
import Header from "./Header"

const Root = () => {
    return (
        <main className='min-h-[100vh] flex flex-col'>
            <Toaster
                position="bottom-right"
                reverseOrder={false}
            />
            <Header />
            <Files />
        </main>
    )
}

export default Root