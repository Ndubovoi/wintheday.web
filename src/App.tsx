// src/App.jsx
import './App.css';

function App() {
  return (
    <div className="App">
      <nav className="navbar">
        <div className="logo">Win The Day</div>
        <a href="#" className="nav-link">Support</a>
      </nav>

      <main className="main-content">
        <div className="left-section">
          <h1 className="hero-title">Win The Day</h1>
          <div className="slogan-inline">
            <span className="fade-word" style={{ animationDelay: "0.3s" }}>Win&nbsp;today.</span>
            <span className="fade-word" style={{ animationDelay: "1.0s" }}>Repeat.</span>
            <span className="fade-word" style={{ animationDelay: "1.7s" }}>Become&nbsp;unstoppable.</span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
