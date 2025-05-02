"use client"

import { motion } from "framer-motion"

const HeartSVG = ({ color = "#ff4b4b" }) => (
  <svg viewBox="0 0 512 512" width="100%" height="100%">
    <motion.path
      d="M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z"
      fill={color}
      initial={{ pathLength: 0, fillOpacity: 0 }}
      animate={{ pathLength: 1, fillOpacity: 1 }}
      transition={{ duration: 2, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
    />
  </svg>
)

export function Hearts() {
  // Create more hearts with varied sizes, delays, and colors
  const hearts = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 10,
    duration: 10 + Math.random() * 10,
    scale: 0.3 + Math.random() * 0.7,
    opacity: 0.6 + Math.random() * 0.4,
    color: `hsl(${Math.random() * 40 + 340}, 100%, ${50 + Math.random() * 20}%)`, // Shades of red and pink
  }))

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          className="absolute w-16 h-16"
          initial={{
            left: `${heart.x}%`,
            top: "110%",
            scale: heart.scale,
            opacity: heart.opacity,
          }}
          animate={{
            top: "-20%",
            opacity: [heart.opacity, heart.opacity, 0],
            scale: [heart.scale, heart.scale * 1.2, heart.scale * 0.8],
          }}
          transition={{
            duration: heart.duration,
            repeat: Number.POSITIVE_INFINITY,
            delay: heart.delay,
            ease: "easeInOut",
          }}
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          >
            <HeartSVG color={heart.color} />
          </motion.div>
        </motion.div>
      ))}
    </div>
  )
}
