export default function Logo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="cnsGrad" x1="20%" y1="10%" x2="80%" y2="95%">
          <stop offset="0%" stopColor="#FB923C" />
          <stop offset="55%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#C2410C" />
        </linearGradient>

        <linearGradient id="bgCard" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF7ED" />
          <stop offset="100%" stopColor="#FFEDD5" />
        </linearGradient>
      </defs>

      {/* Base estilo App Icon */}
      <rect
        x="8"
        y="8"
        width="104"
        height="104"
        rx="28"
        fill="url(#bgCard)"
        stroke="#F97316"
        strokeWidth="3"
        strokeOpacity="0.35"
      />

      {/* Contorno externo del Cerebro (perfil) + Tronco + Médula Espinal */}
      <path
        d="M55 24
           C40 24, 30 33, 30 46
           C30 55, 36 62, 45 64
           L53 66
           C56 67, 57 70, 56 74
           C54 81, 58 88, 56 97
           M55 24
           C71 24, 83 34, 83 48
           C83 59, 75 66, 65 67
           C62 67, 61 70, 62 74
           C64 81, 60 88, 62 97"
        stroke="url(#cnsGrad)"
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Pliegues cerebrales internos (circunvoluciones minimalistas) */}
      <path
        d="M42 42 C46 37, 54 37, 58 42 M62 45 C66 41, 72 43, 73 49 M44 53 C50 51, 56 54, 60 52"
        stroke="#EA580C"
        strokeWidth="4.2"
        strokeLinecap="round"
      />

      {/* Segmentos de mielina / vértebras a lo largo de la médula */}
      <circle cx="59" cy="76" r="2.6" fill="#FFFFFF" />
      <circle cx="59" cy="85" r="2.6" fill="#FFFFFF" />
      <circle cx="59" cy="94" r="2.6" fill="#FFFFFF" />
    </svg>
  );
}