import ReelFeed from './components/ReelFeed.jsx';

export default function App() {
  return (
    <div className="app">
      <header className="app-bar">
        <h1 className="app-bar__title">
          <span aria-hidden="true">#</span>JusticeForHimassTanVuu
          <span className="visually-hidden"> — Handcam Reels</span>
        </h1>
      </header>

      <ReelFeed />
    </div>
  );
}