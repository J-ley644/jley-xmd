
export default function JleyLogo({
  size = 48,
  showWordmark = false,
  subtitle = false,
  className = "",
}) {
  return (
    <div
      className={`jley-logo ${className}`.trim()}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="JLEY Nexus logo"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <linearGradient
            id="jley-nexus-gradient"
            x1="12"
            y1="12"
            x2="88"
            y2="88"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#65E7FF" />
            <stop offset="52%" stopColor="#547DFF" />
            <stop offset="100%" stopColor="#B16BFF" />
          </linearGradient>

          <linearGradient
            id="jley-nexus-frame"
            x1="10"
            y1="10"
            x2="90"
            y2="90"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#547DFF" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#B16BFF" stopOpacity="0.5" />
          </linearGradient>
        </defs>

        <rect
          x="3"
          y="3"
          width="94"
          height="94"
          rx="27"
          fill="#0A1020"
        />

        <rect
          x="3.75"
          y="3.75"
          width="92.5"
          height="92.5"
          rx="26.25"
          stroke="url(#jley-nexus-frame)"
          strokeWidth="1.5"
        />

        <path
          d="M22 28H48V61C48 73 41 80 29 80H24"
          stroke="url(#jley-nexus-gradient)"
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M54 28H76V55C76 67 69 74 58 74H54"
          stroke="url(#jley-nexus-gradient)"
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M64 45L76 55L87 44"
          stroke="#65E7FF"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.95"
        />

        <circle cx="78" cy="23" r="3" fill="#65E7FF" />
      </svg>

      {showWordmark && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "3px",
            lineHeight: 1.1,
          }}
        >
          <span
            style={{
              color: "#F4F7FF",
              fontSize: "20px",
              fontWeight: 800,
              letterSpacing: "2.5px",
            }}
          >
            JLEY<span style={{ color: "#65E7FF" }}>.</span>
          </span>

          {subtitle && (
            <span
              style={{
                color: "#94A3B8",
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "2px",
                textTransform: "uppercase",
              }}
            >
              Platform
            </span>
          )}
        </div>
      )}
    </div>
  );
}
