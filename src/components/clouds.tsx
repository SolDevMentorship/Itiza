export function Clouds() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Top clouds */}
      <div className="absolute top-0 left-0 right-0 h-40">
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className="absolute bg-white/80 rounded-full blur-md"
            style={{
              width: `${10 + Math.random() * 100}px`,
              height: `${3 + Math.random() * 60}px`,
              left: `${i * 25 - 10}%`,
              top: `${Math.random() * 20}%`,
              animation: `float ${5 + Math.random() * 5}s ease-in-out infinite alternate`,
              animationDelay: `${-Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Bottom clouds */}
      <div className="absolute bottom-0 left-0 right-0 h-40">
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className="absolute bg-white/70 rounded-full blur-md"
            style={{
              width: `${120 + Math.random() * 100}px`,
              height: `${90 + Math.random() * 60}px`,
              left: `${i * 25 - 15}%`,
              bottom: `${Math.random() * 20}%`,
              animation: `float ${6 + Math.random() * 5}s ease-in-out infinite alternate-reverse`,
              animationDelay: `${-Math.random() * 5}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
