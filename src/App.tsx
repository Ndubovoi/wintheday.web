import { useRef } from 'react';
import './App.css';

function App() {
  const aboutRef = useRef<HTMLElement>(null);
  const supportRef = useRef<HTMLElement>(null);

  const scrollTo = (ref: React.RefObject<HTMLElement>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="App">
      <nav className="navbar">
        <div className="logo">Win The Day</div>
        <div className="nav-links">
          <button className="nav-button" onClick={() => scrollTo(aboutRef)}>About</button>
          <button className="nav-button" onClick={() => scrollTo(supportRef)}>Support</button>
        </div>
      </nav>

      <main className="main-content">
        <div className="left-section">
          <h1 className="hero-title">Win The Day</h1>
          <div className="slogan-inline">
            <span className="fade-word">Win today.</span>
            <span className="fade-word">Repeat.</span>
            <span className="fade-word">Become unstoppable.</span>
          </div>
        </div>
      </main>

      <section className="info-section about" ref={aboutRef}>
        <h2>About</h2>
        <p>
          Win The Day is a minimalist productivity app built to help you reflect, stay accountable,
          and build better habits — one small win at a time.
        </p>
      </section>

      <section className="info-section support" ref={supportRef}>
        <h2>Support</h2>
        <p>
          Have feedback or an issue? Contact us at{' '}
          <a className="email-link" href="mailto:support@win-the-day.com">support@win-the-day.com</a>
        </p>
      </section>
    </div>
  );
}

export default App;
