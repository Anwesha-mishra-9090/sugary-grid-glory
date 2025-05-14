
import React, { useState, useEffect } from 'react';
import Candy, { CandyColor } from './Candy';

interface BoardProps {
  onScoreUpdate: (score: number) => void;
  onMoveMade: () => void;
}

type CandyState = {
  color: CandyColor;
  id: string;
  matched: boolean;
  falling: boolean;
  isNew: boolean;
};

const BOARD_SIZE = 8;
const MATCH_SCORE = 10;
const CANDY_COLORS: CandyColor[] = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];

const GameBoard: React.FC<BoardProps> = ({ onScoreUpdate, onMoveMade }) => {
  const [board, setBoard] = useState<CandyState[][]>([]);
  const [selectedCandy, setSelectedCandy] = useState<{ row: number; col: number } | null>(null);
  const [score, setScore] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize board
  useEffect(() => {
    initializeBoard();
  }, []);

  const initializeBoard = () => {
    let initialBoard: CandyState[][] = [];
    
    // Create initial random board
    for (let row = 0; row < BOARD_SIZE; row++) {
      const newRow: CandyState[] = [];
      for (let col = 0; col < BOARD_SIZE; col++) {
        newRow.push(createRandomCandy());
      }
      initialBoard.push(newRow);
    }

    // Remove any initial matches
    let hasMatches = true;
    while (hasMatches) {
      const matchedCandies = findAllMatches(initialBoard);
      if (matchedCandies.length > 0) {
        // Replace matched candies
        matchedCandies.forEach(({row, col}) => {
          // Avoid creating new matches by finding a color that doesn't match neighbors
          let availableColors = [...CANDY_COLORS];
          
          // Check horizontal neighbors
          if (col > 0 && col < BOARD_SIZE - 1) {
            const leftColor = initialBoard[row][col-1].color;
            const rightColor = initialBoard[row][col+1].color;
            if (leftColor === rightColor) {
              availableColors = availableColors.filter(c => c !== leftColor);
            }
          }
          
          // Check vertical neighbors
          if (row > 0 && row < BOARD_SIZE - 1) {
            const topColor = initialBoard[row-1][col].color;
            const bottomColor = initialBoard[row+1][col].color;
            if (topColor === bottomColor) {
              availableColors = availableColors.filter(c => c !== topColor);
            }
          }
          
          // If we filtered out all colors, just pick any random one
          if (availableColors.length === 0) {
            availableColors = [...CANDY_COLORS];
          }
          
          const newColor = availableColors[Math.floor(Math.random() * availableColors.length)];
          initialBoard[row][col] = { 
            ...initialBoard[row][col], 
            color: newColor 
          };
        });
        
        // Check again for matches
        const nextMatches = findAllMatches(initialBoard);
        hasMatches = nextMatches.length > 0;
      } else {
        hasMatches = false;
      }
    }
    
    setBoard(initialBoard);
  };

  const createRandomCandy = (): CandyState => {
    return {
      color: CANDY_COLORS[Math.floor(Math.random() * CANDY_COLORS.length)],
      id: Math.random().toString(36).substring(2, 9),
      matched: false,
      falling: false,
      isNew: false,
    };
  };

  const findAllMatches = (currentBoard: CandyState[][]) => {
    const matches: { row: number; col: number }[] = [];

    // Check horizontal matches
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE - 2; col++) {
        const color = currentBoard[row][col].color;
        if (
          color === currentBoard[row][col + 1].color &&
          color === currentBoard[row][col + 2].color
        ) {
          // Found horizontal match of 3
          matches.push({ row, col });
          matches.push({ row, col: col + 1 });
          matches.push({ row, col: col + 2 });
          
          // Check if match extends further
          if (col + 3 < BOARD_SIZE && color === currentBoard[row][col + 3].color) {
            matches.push({ row, col: col + 3 });
            
            // Check for match of 5
            if (col + 4 < BOARD_SIZE && color === currentBoard[row][col + 4].color) {
              matches.push({ row, col: col + 4 });
            }
          }
        }
      }
    }

    // Check vertical matches
    for (let col = 0; col < BOARD_SIZE; col++) {
      for (let row = 0; row < BOARD_SIZE - 2; row++) {
        const color = currentBoard[row][col].color;
        if (
          color === currentBoard[row + 1][col].color &&
          color === currentBoard[row + 2][col].color
        ) {
          // Found vertical match of 3
          matches.push({ row, col });
          matches.push({ row: row + 1, col });
          matches.push({ row: row + 2, col });
          
          // Check if match extends further
          if (row + 3 < BOARD_SIZE && color === currentBoard[row + 3][col].color) {
            matches.push({ row: row + 3, col });
            
            // Check for match of 5
            if (row + 4 < BOARD_SIZE && color === currentBoard[row + 4][col].color) {
              matches.push({ row: row + 4, col });
            }
          }
        }
      }
    }

    // Filter out duplicates
    return matches.filter((match, index, self) => 
      index === self.findIndex(m => m.row === match.row && m.col === match.col)
    );
  };

  const handleCandyClick = (row: number, col: number) => {
    if (isProcessing) return;
    
    if (!selectedCandy) {
      // First candy selection
      setSelectedCandy({ row, col });
    } else {
      // Second candy selection - check if it's adjacent
      const isAdjacent =
        (Math.abs(selectedCandy.row - row) === 1 && selectedCandy.col === col) ||
        (Math.abs(selectedCandy.col - col) === 1 && selectedCandy.row === row);

      if (isAdjacent) {
        // Swap candies and check for matches
        swapCandies(selectedCandy.row, selectedCandy.col, row, col);
      }
      
      // Reset selection
      setSelectedCandy(null);
    }
  };

  const swapCandies = async (row1: number, col1: number, row2: number, col2: number) => {
    setIsProcessing(true);
    
    // Create a copy of the board
    const newBoard = [...board.map(row => [...row])];
    
    // Swap the candies
    [newBoard[row1][col1], newBoard[row2][col2]] = [newBoard[row2][col2], newBoard[row1][col1]];
    
    // Temporarily update the board to show the swap
    setBoard(newBoard);
    
    // Check for matches
    const matchedCandies = findAllMatches(newBoard);
    
    if (matchedCandies.length === 0) {
      // No matches, swap back
      setTimeout(() => {
        [newBoard[row1][col1], newBoard[row2][col2]] = [newBoard[row2][col2], newBoard[row1][col1]];
        setBoard(newBoard);
        setIsProcessing(false);
      }, 500); // Short delay before swapping back
      return;
    }
    
    // Valid move, count it
    onMoveMade();
    
    // Process matches
    await processMatches(newBoard, matchedCandies);
    
    setIsProcessing(false);
  };

  const processMatches = async (currentBoard: CandyState[][], matchedCandies: { row: number; col: number }[]) => {
    // Mark matched candies
    const newBoard = JSON.parse(JSON.stringify(currentBoard));
    matchedCandies.forEach(({row, col}) => {
      newBoard[row][col] = {
        ...newBoard[row][col],
        matched: true
      };
    });
    
    setBoard(newBoard);
    
    // Update score
    const newScore = score + matchedCandies.length * MATCH_SCORE;
    setScore(newScore);
    onScoreUpdate(newScore);
    
    // Wait for fade out animation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Remove matched candies and create falling effect
    for (let col = 0; col < BOARD_SIZE; col++) {
      // Count matched candies in this column
      const matchedInCol = matchedCandies.filter(match => match.col === col);
      
      if (matchedInCol.length > 0) {
        // Mark candies as falling
        for (let row = 0; row < BOARD_SIZE; row++) {
          const matchesBelow = matchedCandies.filter(
            m => m.col === col && m.row > row
          ).length;
          
          if (matchesBelow > 0 && !newBoard[row][col].matched) {
            newBoard[row][col].falling = true;
          }
        }
        
        setBoard(JSON.parse(JSON.stringify(newBoard)));
        
        // Wait for falling animation
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Move candies down
        for (let col = 0; col < BOARD_SIZE; col++) {
          // Start from the bottom and move up
          let emptySpaces = 0;
          
          for (let row = BOARD_SIZE - 1; row >= 0; row--) {
            if (newBoard[row][col].matched) {
              emptySpaces++;
            } else if (emptySpaces > 0) {
              // Move this candy down by emptySpaces
              newBoard[row + emptySpaces][col] = {
                ...newBoard[row][col],
                falling: false
              };
              newBoard[row][col].matched = true;
            }
          }
          
          // Fill the top with new candies
          for (let i = 0; i < emptySpaces; i++) {
            newBoard[i][col] = {
              ...createRandomCandy(),
              isNew: true
            };
          }
        }
        
        setBoard(JSON.parse(JSON.stringify(newBoard)));
        
        // Wait for new candies to appear
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Reset animation states
        for (let row = 0; row < BOARD_SIZE; row++) {
          for (let col = 0; col < BOARD_SIZE; col++) {
            newBoard[row][col].matched = false;
            newBoard[row][col].falling = false;
            newBoard[row][col].isNew = false;
          }
        }
        
        setBoard(JSON.parse(JSON.stringify(newBoard)));
        
        // Check for cascading matches
        const newMatches = findAllMatches(newBoard);
        if (newMatches.length > 0) {
          await processMatches(newBoard, newMatches);
        }
      }
    }
  };

  return (
    <div className="candy-grid max-w-md mx-auto">
      {board.map((row, rowIndex) => 
        row.map((candy, colIndex) => (
          <Candy
            key={candy.id}
            color={candy.color}
            selected={selectedCandy?.row === rowIndex && selectedCandy?.col === colIndex}
            matched={candy.matched}
            falling={candy.falling}
            isNew={candy.isNew}
            onClick={() => handleCandyClick(rowIndex, colIndex)}
          />
        ))
      )}
    </div>
  );
};

export default GameBoard;
