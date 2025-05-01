import { motion } from "framer-motion";

interface AnimatedPointsProps {
  points: number;
  animate: boolean;
}

export const AnimatedPoints: React.FC<AnimatedPointsProps> = ({
  points,
  animate,
}) => {
  return (
    <div className="relative">
      {/* Orbiting rings - soft pinks/rose hues */}
      <motion.div
        className="absolute inset-0 border-2 border-[#f4b6b6]/40 rounded-full"
        animate={{
          rotate: 360,
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <motion.div
        className="absolute inset-0 border-2 border-[#f6dede]/30 rounded-full"
        animate={{
          rotate: -360,
          scale: [1.1, 1.2, 1.1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Points bubble - blush to rose gold */}
      <motion.div
        className="relative z-10 bg-gradient-to-r from-[#f4b6b6] to-[#fce8e6] rounded-full px-6 py-2 shadow-lg shadow-rose-200"
        animate={{
          scale: animate ? [1, 1.1, 1] : 1,
          boxShadow: animate
            ? [
                "0 10px 15px -3px rgba(244,182,182,0.3)",
                "0 15px 20px -3px rgba(252,232,230,0.4)",
                "0 10px 15px -3px rgba(244,182,182,0.3)",
              ]
            : "0 10px 15px -3px rgba(244,182,182,0.3)",
        }}
        transition={{
          duration: 0.5,
          ease: "easeInOut",
        }}
      >
        <div className="relative flex items-center space-x-2">
          <span className="text-[#832c2c] font-bold">{points}</span>
          <span className="text-[#832c2c]/80">Verxios</span>

          {/* Subtle inner glow */}
          <motion.div
            className="absolute inset-0 bg-white/20 rounded-full blur-md"
            animate={{
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
      </motion.div>
    </div>
  );
};
