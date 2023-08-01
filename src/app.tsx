import { createRoot } from 'react-dom/client';

import Root from "./components/Root"

// Render your React component instead
const root = createRoot(document.getElementById('root'));
root.render(<Root />);