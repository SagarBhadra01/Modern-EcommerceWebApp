import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { router } from '@/router';

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#0A0A0A',
            border: '1px solid #1A1A1A',
            color: '#FFFFFF',
          },
        }}
      />
    </>
  );
}

export default App;
