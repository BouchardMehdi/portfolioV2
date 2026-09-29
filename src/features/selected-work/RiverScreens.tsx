export function RiverScreens() {
  return (
    <div className="river-screens" aria-hidden="true">
      <p className="river-game-list">
        Poker · Blackjack · Roulette · Machine à sous
      </p>
      <div className="river-network-label">
        <span>Actions des joueurs</span>
        <span>État partagé · Socket.IO</span>
        <span>Réponse du serveur</span>
      </div>
      <p className="river-console-label">
        Interface réelle · Tableau de bord The River
      </p>
      <p className="river-scroll-cue">
        Défiler pour explorer <span>↓</span>
      </p>
    </div>
  );
}
