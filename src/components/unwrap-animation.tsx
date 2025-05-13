"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import confetti from "canvas-confetti"

export default function UnwrapAnimation() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Create confetti effect when component mounts
    if (containerRef.current) {
      const canvas = document.createElement("canvas")
      canvas.style.position = "absolute"
      canvas.style.width = "100%"
      canvas.style.height = "100%"
      canvas.style.top = "0"
      canvas.style.left = "0"
      canvas.style.pointerEvents = "none"
      containerRef.current.appendChild(canvas)

      const myConfetti = confetti.create(canvas, {
        resize: true,
        useWorker: true,
      })

      // Fire confetti with pink colors
      const timer = setTimeout(() => {
        myConfetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#FF1493", "#FF69B4", "#FFC0CB", "#FFB6C1", "#FF00FF"],
        })
      }, 1000)

      return () => {
        clearTimeout(timer)
        if (containerRef.current?.contains(canvas)) {
          containerRef.current.removeChild(canvas)
        }
      }
    }
  }, [])

  return (
    <div ref={containerRef} className="relative w-64 h-64 flex items-center justify-center">
      <motion.div
        className="w-40 h-40 bg-gradient-to-r from-pink-500 to-rose-400 rounded-lg flex items-center justify-center"
        initial={{ scale: 0.5, rotate: 0 }}
        animate={{
          scale: [0.5, 1.1, 1],
          rotate: [0, 10, -10, 0],
        }}
        transition={{
          duration: 1.5,
          ease: "easeInOut",
        }}
      >
        <motion.div
          className="text-white"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3v12" />
            <path d="m8 11 4 4 4-4" />
            <path d="M8 5H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-4" />
          </svg>
        </motion.div>
      </motion.div>

      {/* Animated ribbons */}
      <motion.div
        className="absolute w-full h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-20 bg-pink-400 origin-bottom"
            style={{
              left: `calc(50% + ${Math.cos((i * Math.PI) / 4) * 60}px)`,
              top: `calc(50% + ${Math.sin((i * Math.PI) / 4) * 60}px)`,
              transform: `rotate(${i * 45}deg)`,
            }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: [0, 1, 0.8] }}
            transition={{
              duration: 1,
              delay: i * 0.05,
              ease: "easeOut",
            }}
          />
        ))}
      </motion.div>
    </div>
  )
}
