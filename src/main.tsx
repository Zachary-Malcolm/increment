import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createHashRouter, Link, RouterProvider } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AccountPage } from './pages/AccountPage';
import { Home } from './pages/Home';
import { Learn } from './pages/Learn';
import { LessonPage } from './pages/LessonPage';
import { DailyPuzzlePage, PuzzlePage } from './pages/PuzzlePage';
import { PuzzlesPage } from './pages/PuzzlesPage';
import { ReviewPage } from './pages/ReviewPage';
import { StoreProvider } from './state/store';
import './styles.css';

function NotFound() {
  return (
    <div className="card center narrow">
      <h2>Page not found</h2>
      <Link className="btn btn-primary" to="/">Home</Link>
    </div>
  );
}

// Hash routing works on GitHub Pages without server rewrites. Sign-in links use ?code=... (PKCE),
// which lives before the #, so the two don't clash.
const router = createHashRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/learn', element: <Learn /> },
      { path: '/lesson/:id', element: <LessonPage /> },
      { path: '/review', element: <ReviewPage /> },
      { path: '/puzzles', element: <PuzzlesPage /> },
      { path: '/puzzles/daily', element: <DailyPuzzlePage /> },
      { path: '/puzzles/:id', element: <PuzzlePage /> },
      { path: '/account', element: <AccountPage /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <RouterProvider router={router} />
    </StoreProvider>
  </StrictMode>,
);
