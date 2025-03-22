"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RefreshCw } from "lucide-react"

// ボードのサイズ
const BOARD_SIZE = 8

// 初期ボードの状態を作成
const createInitialBoard = () => {
  const board = Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(null))

  // 初期配置（中央の4マス）
  const mid = BOARD_SIZE / 2
  board[mid - 1][mid - 1] = "white"
  board[mid - 1][mid] = "black"
  board[mid][mid - 1] = "black"
  board[mid][mid] = "white"

  return board
}

// 方向ベクトル（8方向）
const DIRECTIONS = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
]

export default function OthelloGame() {
  const [board, setBoard] = useState(() => createInitialBoard())
  const [currentPlayer, setCurrentPlayer] = useState("black")
  const [validMoves, setValidMoves] = useState({})
  const [gameOver, setGameOver] = useState(false)
  const [scores, setScores] = useState({ black: 2, white: 2 })
  const [message, setMessage] = useState("")

  // 有効な手を計算
  const calculateValidMoves = (gameBoard, player) => {
    const moves = {}

    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (gameBoard[row][col] !== null) continue

        const flips = getFlips(gameBoard, row, col, player)
        if (flips.length > 0) {
          moves[`${row},${col}`] = flips
        }
      }
    }

    return moves
  }

  // 指定した位置に石を置いた場合に反転する石を取得
  const getFlips = (gameBoard, row, col, player) => {
    const opponent = player === "black" ? "white" : "black"
    const flips = []

    for (const [dx, dy] of DIRECTIONS) {
      let x = row + dx
      let y = col + dy
      const temp = []

      while (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE && gameBoard[x][y] === opponent) {
        temp.push([x, y])
        x += dx
        y += dy
      }

      if (temp.length > 0 && x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE && gameBoard[x][y] === player) {
        flips.push(...temp)
      }
    }

    return flips
  }

  // スコアを計算
  const calculateScores = (gameBoard) => {
    let blackCount = 0
    let whiteCount = 0

    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (gameBoard[row][col] === "black") blackCount++
        if (gameBoard[row][col] === "white") whiteCount++
      }
    }

    return { black: blackCount, white: whiteCount }
  }

  // ゲームの状態を更新
  useEffect(() => {
    const moves = calculateValidMoves(board, currentPlayer)
    setValidMoves(moves)

    // 有効な手がない場合
    if (Object.keys(moves).length === 0) {
      const opponentMoves = calculateValidMoves(board, currentPlayer === "black" ? "white" : "black")

      // 両プレイヤーが打てない場合はゲーム終了
      if (Object.keys(opponentMoves).length === 0) {
        setGameOver(true)
        const { black, white } = scores
        if (black > white) {
          setMessage("黒の勝利！")
        } else if (white > black) {
          setMessage("白の勝利！")
        } else {
          setMessage("引き分け！")
        }
      } else {
        // 相手に手番を渡す
        setCurrentPlayer(currentPlayer === "black" ? "white" : "black")
        setMessage(`${currentPlayer === "black" ? "黒" : "白"}の有効な手がありません。手番をスキップします。`)
      }
    } else {
      setMessage(`${currentPlayer === "black" ? "黒" : "白"}の番です`)
    }

    // スコアを更新
    setScores(calculateScores(board))
  }, [board, currentPlayer])

  // 石を置く
  const placeDisk = (row, col) => {
    if (gameOver) return

    const key = `${row},${col}`
    if (!validMoves[key]) return

    const newBoard = [...board.map((row) => [...row])]
    newBoard[row][col] = currentPlayer

    // 石を反転
    for (const [x, y] of validMoves[key]) {
      newBoard[x][y] = currentPlayer
    }

    setBoard(newBoard)
    setCurrentPlayer(currentPlayer === "black" ? "white" : "black")
  }

  // ゲームをリセット
  const resetGame = () => {
    setBoard(createInitialBoard())
    setCurrentPlayer("black")
    setGameOver(false)
    setMessage("黒の番です")
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">オセロゲーム</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-4">
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-black mr-2"></div>
              <span>{scores.black}</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-white border border-gray-300 mr-2"></div>
              <span>{scores.white}</span>
            </div>
          </div>

          {message && (
            <Alert className="mb-4">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-8 gap-1 bg-green-800 p-1 rounded-md">
            {board.map((row, rowIndex) =>
              row.map((cell, colIndex) => {
                const isValidMove = validMoves[`${rowIndex},${colIndex}`]

                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`
                      w-full aspect-square bg-green-700 flex items-center justify-center
                      ${isValidMove ? "cursor-pointer hover:bg-green-600" : "cursor-default"}
                    `}
                    onClick={() => isValidMove && placeDisk(rowIndex, colIndex)}
                  >
                    {cell && (
                      <div
                        className={`
                          w-4/5 h-4/5 rounded-full
                          ${cell === "black" ? "bg-black" : "bg-white border border-gray-300"}
                        `}
                      />
                    )}
                    {!cell && isValidMove && currentPlayer === "black" && (
                      <div className="w-3 h-3 rounded-full bg-black opacity-30" />
                    )}
                    {!cell && isValidMove && currentPlayer === "white" && (
                      <div className="w-3 h-3 rounded-full bg-white opacity-30 border border-gray-300" />
                    )}
                  </div>
                )
              }),
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={resetGame} className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            ゲームをリセット
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

