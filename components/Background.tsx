'use client'
import { Noise } from '@/lib/noise'
import { useEffect, useRef } from 'react'

function map(n: number, s1: number, e1: number, s2: number, e2: number) {
  return s2 + (e2 - s2) * ((n - s1) / (e1 - s1))
}

export default function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!

    const NOISE_SCALE = 0.05
    const TIME_SPEED = 0.01
    let gridSize = 200
    let time = 0

    function resize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      gridSize = Math.floor(Math.max(canvas.width, canvas.height) / 12)
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.lineCap = 'square'

      for (let x = 0; x <= canvas.width; x += gridSize) {
        for (let y = 0; y <= canvas.height; y += gridSize) {
          const noiseValue = Noise.perlin3(x * NOISE_SCALE, y * NOISE_SCALE, time)
          const weight = map(noiseValue, -1, 1, 0.1, 2)
          const alpha = map(noiseValue, -1, 1, 0.01, 0.1)

          ctx.strokeStyle = `hsl(0 0% 100% / ${alpha})`
          ctx.lineWidth = weight
          ctx.strokeRect(x, y, gridSize, gridSize)
        }
      }

      time += TIME_SPEED
      requestAnimationFrame(draw)
    }

    window.addEventListener('resize', resize)
    resize()
    draw()

    return () => {
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 z-[-1] invert" />
}
