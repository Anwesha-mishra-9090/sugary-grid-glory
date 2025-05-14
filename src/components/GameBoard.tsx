import React, { useState, useEffect } from 'react';
import Candy, { CandyColor, CandyType } from './Candy';
import { useToast } from '@/hooks/use-toast';

interface BoardProps {
  onScoreUpdate: (score: number) => void;
  onMoveMade: () => void;
  level: number;
}

type CandyState = {
  color: CandyColor;
  id: string;
  matched: boolean;
  falling: boolean;
  isNew: boolean;
  type: CandyType;
};

// Define a proper type for the matches
type CandyMatch = {
  row: number;
  col: number;
  matchLength?: number;
  direction?: 'horizontal' | 'vertical';
};

const BOARD_SIZE = 8;
const MATCH_SCORE = 10;
const CANDY_COLORS: CandyColor[] = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];

// Score multipliers for different match types
const SCORE_MULTIPLIERS = {
  3: 1,    // Match-3: normal score
  4: 1.5,  // Match-4: 50% more points
  5: 2,    // Match-5: double points
  6: 3,    // Match-6: triple points
  combo: 1.25, // Each successive match in a cascade increases this
};

const GameBoard: React.FC<BoardProps> = ({ onScoreUpdate, onMoveMade, level }) => {
  const [board, setBoard] = useState<CandyState[][]>([]);
  const [selectedCandy, setSelectedCandy] = useState<{ row: number; col: number } | null>(null);
  const [score, setScore] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [comboCounter, setComboCounter] = useState(0);
  const { toast } = useToast();

  // Initialize board
  useEffect(() => {
    initializeBoard();
  }, [level]);

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
            color: newColor,
            type: 'regular'
          };
        });
        
        // Check again for matches
        const nextMatches = findAllMatches(initialBoard);
        hasMatches = nextMatches.length > 0;
      } else {
        hasMatches = false;
      }
    }
    
    // For higher levels, add some special candies to start
    if (level > 2) {
      const specialCandyCount = Math.min(3, Math.floor(level / 2));
      
      for (let i = 0; i < specialCandyCount; i++) {
        const row = Math.floor(Math.random() * BOARD_SIZE);
        const col = Math.floor(Math.random() * BOARD_SIZE);
        const specialTypes: CandyType[] = ['striped-horizontal', 'striped-vertical', 'wrapped'];
        initialBoard[row][col].type = specialTypes[Math.floor(Math.random() * specialTypes.length)];
      }
    }
    
    setBoard(initialBoard);
    setComboCounter(0);
  };

  const createRandomCandy = (): CandyState => {
    return {
      color: CANDY_COLORS[Math.floor(Math.random() * CANDY_COLORS.length)],
      id: Math.random().toString(36).substring(2, 9),
      matched: false,
      falling: false,
      isNew: false,
      type: 'regular',
    };
  };

  const findAllMatches = (currentBoard: CandyState[][]) => {
    const matches: CandyMatch[] = [];

    // Check horizontal matches
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE - 2; col++) {
        const color = currentBoard[row][col].color;
        if (
          color === currentBoard[row][col + 1].color &&
          color === currentBoard[row][col + 2].color
        ) {
          // Found horizontal match of 3
          const matchStart = { row, col, direction: 'horizontal' as const };
          let matchLength = 3;
          
          // Check if match extends further
          while (col + matchLength < BOARD_SIZE && color === currentBoard[row][col + matchLength].color) {
            matchLength++;
          }
          
          // Add all candies in the match with the match length
          for (let i = 0; i < matchLength; i++) {
            matches.push({ 
              row, 
              col: col + i, 
              matchLength, 
              direction: 'horizontal' 
            });
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
          const matchStart = { row, col, direction: 'vertical' as const };
          let matchLength = 3;
          
          // Check if match extends further
          while (row + matchLength < BOARD_SIZE && color === currentBoard[row + matchLength][col].color) {
            matchLength++;
          }
          
          // Add all candies in the match with the match length
          for (let i = 0; i < matchLength; i++) {
            matches.push({ 
              row: row + i, 
              col, 
              matchLength, 
              direction: 'vertical' 
            });
          }
        }
      }
    }

    // Filter out duplicates (candies that are part of both horizontal and vertical matches)
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
    
    // Special case: if one of the candies is a color bomb
    if (newBoard[row1][col1].type === 'color-bomb' || newBoard[row2][col2].type === 'color-bomb') {
      const bombRow = newBoard[row1][col1].type === 'color-bomb' ? row1 : row2;
      const bombCol = newBoard[row1][col1].type === 'color-bomb' ? col1 : col2;
      const otherRow = newBoard[row1][col1].type === 'color-bomb' ? row2 : row1;
      const otherCol = newBoard[row1][col1].type === 'color-bomb' ? col2 : col1;
      
      await activateColorBomb(newBoard, bombRow, bombCol, newBoard[otherRow][otherCol].color);
      onMoveMade();
      setIsProcessing(false);
      return;
    }
    
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
    
    // Reset combo counter for new move
    setComboCounter(0);
    
    // Process matches
    await processMatches(newBoard, matchedCandies);
    
    setIsProcessing(false);
  };

  const processMatches = async (currentBoard: CandyState[][], matchedCandies: CandyMatch[]) => {
    // Group matches by their lengths and find special candy creation points
    const matchGroups: Record<number, CandyMatch[]> = {};
    
    matchedCandies.forEach(match => {
      const length = match.matchLength || 3;
      if (!matchGroups[length]) matchGroups[length] = [];
      matchGroups[length].push(match);
    });
    
    // Create special candies at match centers or intersections
    let specialCandiesToCreate: {
      row: number; 
      col: number;
      type: CandyType;
      color: CandyColor;
    }[] = [];
    
    // Check for L or T shapes (intersecting matches)
    const horizontalMatches = matchedCandies.filter(m => m.direction === 'horizontal');
    const verticalMatches = matchedCandies.filter(m => m.direction === 'vertical');
    
    // Find intersections for wrapped candy creation
    for (const hMatch of horizontalMatches) {
      for (const vMatch of verticalMatches) {
        if (hMatch.row === vMatch.row && hMatch.col === vMatch.col) {
          // Found intersection - create wrapped candy
          specialCandiesToCreate.push({
            row: hMatch.row,
            col: hMatch.col,
            type: 'wrapped',
            color: currentBoard[hMatch.row][hMatch.col].color
          });
          break;
        }
      }
    }
    
    // Create striped candies for match-4
    if (matchGroups[4]) {
      matchGroups[4].forEach(match => {
        if (!specialCandiesToCreate.some(s => s.row === match.row && s.col === match.col)) {
          const centerIdx = match.direction === 'horizontal' 
            ? Math.floor(match.matchLength! / 2) + match.col - (match.matchLength || 0) + 3 
            : Math.floor(match.matchLength! / 2) + match.row - (match.matchLength || 0) + 3;
          
          const centerRow = match.direction === 'horizontal' ? match.row : centerIdx;
          const centerCol = match.direction === 'horizontal' ? centerIdx : match.col;
          
          specialCandiesToCreate.push({
            row: centerRow,
            col: centerCol,
            type: match.direction === 'horizontal' ? 'striped-vertical' : 'striped-horizontal',
            color: currentBoard[match.row][match.col].color
          });
        }
      });
    }
    
    // Create color bomb for match-5
    if (matchGroups[5]) {
      matchGroups[5].forEach(match => {
        if (!specialCandiesToCreate.some(s => s.row === match.row && s.col === match.col)) {
          const centerIdx = match.direction === 'horizontal' 
            ? Math.floor(match.matchLength! / 2) + match.col - (match.matchLength || 0) + 3
            : Math.floor(match.matchLength! / 2) + match.row - (match.matchLength || 0) + 3;
          
          const centerRow = match.direction === 'horizontal' ? match.row : centerIdx;
          const centerCol = match.direction === 'horizontal' ? centerIdx : match.col;
          
          specialCandiesToCreate.push({
            row: centerRow,
            col: centerCol,
            type: 'color-bomb',
            color: currentBoard[match.row][match.col].color
          });
        }
      });
    }
    
    // Increment combo counter for cascading matches
    const newComboCounter = comboCounter + 1;
    setComboCounter(newComboCounter);
    
    // Calculate score with combo multiplier
    const baseScore = matchedCandies.length * MATCH_SCORE;
    const comboMultiplier = 1 + (newComboCounter > 1 ? (newComboCounter - 1) * 0.25 : 0);
    
    // Add extra points for longer matches
    let matchBonus = 0;
    for (const length in matchGroups) {
      if (parseInt(length) > 3) {
        const multiplier = SCORE_MULTIPLIERS[parseInt(length) as keyof typeof SCORE_MULTIPLIERS] || 1;
        matchBonus += matchGroups[length].length * MATCH_SCORE * multiplier;
      }
    }
    
    const pointsEarned = Math.floor((baseScore + matchBonus) * comboMultiplier);
    const newScore = score + pointsEarned;
    
    // Show combo notifications
    if (newComboCounter > 1) {
      toast({
        title: `${newComboCounter}x Combo!`,
        description: `+${pointsEarned} points!`,
        duration: 2000,
      });
    }
    
    setScore(newScore);
    onScoreUpdate(newScore);
    
    // Mark matched candies
    const newBoard = JSON.parse(JSON.stringify(currentBoard));
    matchedCandies.forEach(({row, col}) => {
      newBoard[row][col] = {
        ...newBoard[row][col],
        matched: true
      };
    });
    
    // Activate special candies within matches
    for (const match of matchedCandies) {
      if (newBoard[match.row][match.col].type === 'striped-horizontal') {
        await activateStripedCandy(newBoard, match.row, match.col, 'horizontal');
      } else if (newBoard[match.row][match.col].type === 'striped-vertical') {
        await activateStripedCandy(newBoard, match.row, match.col, 'vertical');
      } else if (newBoard[match.row][match.col].type === 'wrapped') {
        await activateWrappedCandy(newBoard, match.row, match.col);
      }
    }
    
    setBoard(newBoard);
    
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
        
        // Check for any special candies to create
        specialCandiesToCreate.forEach(special => {
          if (!newBoard[special.row][special.col].matched) {
            newBoard[special.row][special.col] = {
              ...newBoard[special.row][special.col],
              type: special.type,
              color: special.color,
            };
          }
        });
        
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

  const activateStripedCandy = async (currentBoard: CandyState[][], row: number, col: number, direction: 'horizontal' | 'vertical') => {
    const affectedCandies: {row: number, col: number}[] = [];
    
    if (direction === 'horizontal') {
      // Clear the entire row
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (c !== col) {
          affectedCandies.push({row, col: c});
        }
      }
    } else {
      // Clear the entire column
      for (let r = 0; r < BOARD_SIZE; r++) {
        if (r !== row) {
          affectedCandies.push({row: r, col});
        }
      }
    }
    
    // Mark affected candies
    affectedCandies.forEach(({row, col}) => {
      currentBoard[row][col] = {
        ...currentBoard[row][col],
        matched: true
      };
    });
    
    // Add bonus points for the special candy
    const bonusPoints = affectedCandies.length * MATCH_SCORE / 2;
    const newScore = score + bonusPoints;
    setScore(newScore);
    onScoreUpdate(newScore);
    
    // Show special effect notification
    toast({
      title: "Striped Candy Activated!",
      description: `+${Math.floor(bonusPoints)} bonus points!`,
      duration: 2000,
    });
    
    // Return the board with marked candies
    return currentBoard;
  };
  
  const activateWrappedCandy = async (currentBoard: CandyState[][], row: number, col: number) => {
    const affectedCandies: {row: number, col: number}[] = [];
    
    // Clear a 3x3 area around the wrapped candy
    for (let r = Math.max(0, row - 1); r <= Math.min(BOARD_SIZE - 1, row + 1); r++) {
      for (let c = Math.max(0, col - 1); c <= Math.min(BOARD_SIZE - 1, col + 1); c++) {
        if (!(r === row && c === col)) {
          affectedCandies.push({row: r, col: c});
        }
      }
    }
    
    // Mark affected candies
    affectedCandies.forEach(({row, col}) => {
      currentBoard[row][col] = {
        ...currentBoard[row][col],
        matched: true
      };
    });
    
    // Add bonus points for the special candy
    const bonusPoints = affectedCandies.length * MATCH_SCORE;
    const newScore = score + bonusPoints;
    setScore(newScore);
    onScoreUpdate(newScore);
    
    // Show special effect notification
    toast({
      title: "Wrapped Candy Exploded!",
      description: `+${Math.floor(bonusPoints)} bonus points!`,
      duration: 2000,
    });
    
    // Return the board with marked candies
    return currentBoard;
  };
  
  const activateColorBomb = async (currentBoard: CandyState[][], row: number, col: number, targetColor: CandyColor) => {
    const affectedCandies: {row: number, col: number}[] = [];
    
    // Clear all candies of the target color
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (currentBoard[r][c].color === targetColor) {
          affectedCandies.push({row: r, col: c});
        }
      }
    }
    
    // Mark affected candies and the color bomb itself
    affectedCandies.forEach(({row, col}) => {
      currentBoard[row][col] = {
        ...currentBoard[row][col],
        matched: true
      };
    });
    currentBoard[row][col] = {
      ...currentBoard[row][col],
      matched: true
    };
    
    // Update the board to show matched candies
    setBoard(JSON.parse(JSON.stringify(currentBoard)));
    
    // Add bonus points for the special candy
    const bonusPoints = affectedCandies.length * MATCH_SCORE * 2;
    const newScore = score + bonusPoints;
    setScore(newScore);
    onScoreUpdate(newScore);
    
    // Show special effect notification
    toast({
      title: "Color Bomb Activated!",
      description: `+${Math.floor(bonusPoints)} bonus points!`,
      duration: 2000,
    });
    
    // Wait for animation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Continue with normal match processing
    const processResult = await processMatchesAfterSpecialCandy(currentBoard);
    return processResult;
  };
  
  const processMatchesAfterSpecialCandy = async (currentBoard: CandyState[][]) => {
    // Remove matched candies and create falling effect
    for (let col = 0; col < BOARD_SIZE; col++) {
      // Count matched candies in this column
      let hasMatched = false;
      for (let row = 0; row < BOARD_SIZE; row++) {
        if (currentBoard[row][col].matched) {
          hasMatched = true;
          break;
        }
      }
      
      if (hasMatched) {
        // Mark candies as falling
        for (let row = 0; row < BOARD_SIZE; row++) {
          const matchesBelow = Array.from({length: BOARD_SIZE - row}, (_, i) => row + i)
            .filter(r => currentBoard[r][col].matched).length;
          
          if (matchesBelow > 0 && !currentBoard[row][col].matched) {
            currentBoard[row][col].falling = true;
          }
        }
        
        setBoard(JSON.parse(JSON.stringify(currentBoard)));
        
        // Wait for falling animation
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Move candies down
        for (let col = 0; col < BOARD_SIZE; col++) {
          // Start from the bottom and move up
          let emptySpaces = 0;
          
          for (let row = BOARD_SIZE - 1; row >= 0; row--) {
            if (currentBoard[row][col].matched) {
              emptySpaces++;
            } else if (emptySpaces > 0) {
              // Move this candy down by emptySpaces
              currentBoard[row + emptySpaces][col] = {
                ...currentBoard[row][col],
                falling: false
              };
              currentBoard[row][col].matched = true;
            }
          }
          
          // Fill the top with new candies
          for (let i = 0; i < emptySpaces; i++) {
            currentBoard[i][col] = {
              ...createRandomCandy(),
              isNew: true
            };
          }
        }
        
        setBoard(JSON.parse(JSON.stringify(currentBoard)));
        
        // Wait for new candies to appear
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Reset animation states
        for (let row = 0; row < BOARD_SIZE; row++) {
          for (let col = 0; col < BOARD_SIZE; col++) {
            currentBoard[row][col].matched = false;
            currentBoard[row][col].falling = false;
            currentBoard[row][col].isNew = false;
          }
        }
        
        setBoard(JSON.parse(JSON.stringify(currentBoard)));
        
        // Check for cascading matches
        const newMatches = findAllMatches(currentBoard);
        if (newMatches.length > 0) {
          await processMatches(currentBoard, newMatches);
        }
      }
    }
    
    return currentBoard;
  };

  return (
    <div className="game-board-container relative">
      <div className="candy-board-border bg-blue-700/80 p-3 rounded-2xl shadow-lg">
        <div className="candy-grid max-w-md mx-auto gap-1.5">
          {board.map((row, rowIndex) => 
            row.map((candy, colIndex) => (
              <Candy
                key={candy.id}
                color={candy.color}
                type={candy.type}
                selected={selectedCandy?.row === rowIndex && selectedCandy?.col === colIndex}
                matched={candy.matched}
                falling={candy.falling}
                isNew={candy.isNew}
                onClick={() => handleCandyClick(rowIndex, colIndex)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
