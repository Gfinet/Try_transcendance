import { Routes, Route } from 'react-router-dom';

// Un composant simple pour la page 404
export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '50px', color: 'white' }}>
      <h1>404 - Page Introuvable</h1>
      <p>Oups, la page que vous cherchez n'existe pas.</p>
      <a href="/dashboard" style={{ color: '#61dafb' }}>Retourner au tableau de bord</a>
    </div>
  );
}
