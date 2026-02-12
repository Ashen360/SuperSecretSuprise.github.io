import React, { useState, useEffect } from "react";
import "./PuzzlePage.css";

export default function PuzzlePage({ onNext }) {
  const [pieces, setPieces] = useState([]);
  const [placedPieces, setPlacedPieces] = useState({});
  const [draggedPiece, setDraggedPiece] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showingFullImage, setShowingFullImage] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [gridDisappearing, setGridDisappearing] = useState(false);

  const ROWS = 4;
  const COLS = 4;
  const TOTAL_PIECES = ROWS * COLS;

  useEffect(() => {
    // Initialize puzzle pieces positioned outside the puzzle grid
    const initialPieces = [];
    const piecesPerZone = Math.ceil(TOTAL_PIECES / 4);

    for (let i = 0; i < TOTAL_PIECES; i++) {
      const zone = Math.floor(i / piecesPerZone);
      let currentX, currentY;

      // Distribute pieces in 4 zones around the puzzle
      switch (zone) {
        case 0: // Top area
          currentX = 10 + Math.random() * 80;
          currentY = 5 + Math.random() * 15;
          break;
        case 1: // Bottom area
          currentX = 10 + Math.random() * 80;
          currentY = 80 + Math.random() * 15;
          break;
        case 2: // Left area
          currentX = 5 + Math.random() * 15;
          currentY = 25 + Math.random() * 50;
          break;
        case 3: // Right area
        default:
          currentX = 80 + Math.random() * 15;
          currentY = 25 + Math.random() * 50;
          break;
      }

      initialPieces.push({
        id: i,
        correctRow: Math.floor(i / COLS),
        correctCol: i % COLS,
        currentX,
        currentY,
      });
    }

    // Shuffle the pieces
    const shuffled = initialPieces.sort(() => Math.random() - 0.5);
    setPieces(shuffled);

    // Show hint after 20 seconds
    const hintTimer = setTimeout(() => setShowHint(true), 20000);
    return () => clearTimeout(hintTimer);
  }, []);

  const handleDragStart = (e, piece) => {
    setDraggedPiece(piece);
    setShowHint(false);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, row, col) => {
    e.preventDefault();
    if (!draggedPiece) return;

    // Check if this is the correct position
    if (draggedPiece.correctRow === row && draggedPiece.correctCol === col) {
      // Correct placement
      const newPlaced = { ...placedPieces, [draggedPiece.id]: true };
      setPlacedPieces(newPlaced);

      // Remove from pieces array
      setPieces(pieces.filter((p) => p.id !== draggedPiece.id));

      // Check if puzzle is complete
      if (Object.keys(newPlaced).length === TOTAL_PIECES) {
        // Start the completion animation sequence
        setGridDisappearing(true);
        
        // After grid disappears, show full image
        setTimeout(() => {
          setShowingFullImage(true);
          setIsComplete(true);
          
          // After 3 seconds, show the completion overlay
          setTimeout(() => {
            setShowOverlay(true);
          }, 3000);
        }, 1500);
      }
    } else {
      // Wrong placement - wiggle animation will show
      const pieceElement = document.getElementById(`piece-${draggedPiece.id}`);
      if (pieceElement) {
        pieceElement.classList.add("wrong-placement");
        setTimeout(() => {
          pieceElement.classList.remove("wrong-placement");
        }, 500);
      }
    }

    setDraggedPiece(null);
  };

  return (
    <div className="puzzle-page">
      <h1 className="puzzle-title">Piece Together Us</h1>
      <p className="puzzle-subtitle">
        {isComplete
          ? "See? We fit perfectly together ❤️"
          : "Can you put us back together? 🧩💖"}
      </p>

      <div className="puzzle-container">
        <div className="puzzle-area">
          {/* Drop zones grid */}
          <div className={`puzzle-grid ${gridDisappearing ? 'disappearing' : ''} ${showingFullImage ? 'hidden' : ''}`}>
            {[...Array(TOTAL_PIECES)].map((_, index) => {
              const row = Math.floor(index / COLS);
              const col = index % COLS;
              const isPlaced = placedPieces[index];

              return (
                <div
                  key={index}
                  className={`drop-zone ${isPlaced ? "filled" : ""}`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, row, col)}
                >
                  {isPlaced && (
                    <div
                      className="puzzle-piece placed"
                      style={{
                        backgroundImage: `url("/SuperSecretSuprise/photos/puzzle.jpg")`,
                        backgroundSize: `${COLS * 100}% ${ROWS * 100}%`,
                        backgroundPosition: `${(col / (COLS - 1)) * 100}% ${(row / (ROWS - 1)) * 100}%`,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Full image reveal */}
          {showingFullImage && (
            <div className="full-image-container">
              <img 
                src="/SuperSecretSuprise/photos/puzzle.jpg" 
                alt="Completed puzzle"
                className="full-puzzle-image"
              />
            </div>
          )}

          {/* Scattered puzzle pieces */}
          <div className={`pieces-area ${gridDisappearing ? 'hidden' : ''}`}>
            {pieces.map((piece) => (
              <div
                key={piece.id}
                id={`piece-${piece.id}`}
                className={`puzzle-piece draggable ${showHint ? "hint-glow" : ""}`}
                draggable
                onDragStart={(e) => handleDragStart(e, piece)}
                style={{
                  left: `${piece.currentX}%`,
                  top: `${piece.currentY}%`,
                  backgroundImage: `url("/SuperSecretSuprise/photos/puzzle.jpg")`,
                  backgroundSize: `${COLS * 100}% ${ROWS * 100}%`,
                  backgroundPosition: `${(piece.correctCol / (COLS - 1)) * 100}% ${(piece.correctRow / (ROWS - 1)) * 100}%`,
                }}
              />
            ))}
          </div>
        </div>

            {/* comment out once done with testing and ready to show  */}
        {/* <div className="puzzle-info">
          <p className="pieces-counter">
            Pieces placed: {Object.keys(placedPieces).length} / {TOTAL_PIECES}
          </p>
          {showHint && !isComplete && (
            <p className="hint-text">
              💡 Drag the pieces to the grid! They'll only fit in the right
              spot.
            </p>
          )}
          <button className="bypass-btn" onClick={onNext}>
            Skip Puzzle (Testing)
          </button>
        </div> */}

        {showOverlay && (
          <div className="completion-overlay">
            <div className="completion-message">
              <h2>You did it! ✨</h2>
              <p>We fit perfectly together ❤️</p>
              <button className="continue-btn" onClick={onNext}>
                Continue →
              </button>
            </div>
            <div className="celebration-confetti">
              {[...Array(50)].map((_, i) => (
                <div
                  key={i}
                  className="confetti-piece"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 0.5}s`,
                    animationDuration: `${2 + Math.random() * 2}s`,
                  }}
                >
                  {["💕", "🌸", "✨", "💖"][Math.floor(Math.random() * 4)]}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
