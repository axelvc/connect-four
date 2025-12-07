export enum Player {
  PLAYER_1,
  PLAYER_2,
}

export enum GameStatus {
  IN_PROGRESS,
  WINNER,
  DRAW,
}

export type WinMatch = [number, number][]

export class ConnectFour {
  private static COLS = 7
  private static ROWS = 6
  private static CONNECT_WIN = 4

  private static createBoard(): Player[][] {
    return Array(this.COLS)
      .fill(null)
      .map(() => Array(this.ROWS).fill(null))
  }

  board: Player[][] = ConnectFour.createBoard()
  status: GameStatus = GameStatus.IN_PROGRESS
  currentPlayer: Player = Player.PLAYER_1
  winMatch: WinMatch | null = null

  move(col: number) {
    if (this.status !== GameStatus.IN_PROGRESS) return
    if (col < 0 || col >= ConnectFour.COLS) return

    const column = this.board[col]
    const row = column.findLastIndex(row => row === null)

    if (row === -1) return

    column[row] = this.currentPlayer

    this.checkWin()
    this.updateStatus()
  }

  private static SIBLING_DIRS = [
    [0, 1], // Horizontal
    [1, 0], // Vertical
    [1, 1], // Diagonal (top-left to bottom-right)
    [1, -1], // Diagonal (top-right to bottom-left)
  ]

  private checkWin() {
    for (let col = 0; col < ConnectFour.COLS; col++) {
      for (let row = 0; row < ConnectFour.ROWS; row++) {
        if (this.board[col][row] !== this.currentPlayer) continue

        for (const [dx, dy] of ConnectFour.SIBLING_DIRS) {
          const match: WinMatch = []

          for (let i = 0; i < ConnectFour.CONNECT_WIN; i++) {
            const c = col + i * dx
            const r = row + i * dy

            if (
              c < 0 ||
              c >= ConnectFour.COLS ||
              r < 0 ||
              r >= ConnectFour.ROWS ||
              this.board[c][r] !== this.currentPlayer
            ) {
              break
            }

            match.push([c, r])
          }

          if (match.length === ConnectFour.CONNECT_WIN) {
            this.winMatch = match
            return
          }
        }
      }
    }
  }

  private turnCount: number = 1
  private updateStatus() {
    if (this.winMatch) {
      this.status = GameStatus.WINNER
    } else if (this.turnCount === ConnectFour.COLS * ConnectFour.ROWS) {
      this.status = GameStatus.DRAW
    } else {
      this.currentPlayer = this.currentPlayer === Player.PLAYER_1 ? Player.PLAYER_2 : Player.PLAYER_1
      this.turnCount++
    }
  }
}
