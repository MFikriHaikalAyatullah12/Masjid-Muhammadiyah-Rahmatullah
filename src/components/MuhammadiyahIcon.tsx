import React from 'react';

interface MuhammadiyahIconProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const MuhammadiyahIcon: React.FC<MuhammadiyahIconProps> = ({ 
  className = '', 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  return (
    <div className={`${sizeClasses[size]} ${className} flex items-center justify-center`}>
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full"
        fill="currentColor"
      >
        {/* Sinar-sinar matahari yang memancar */}
        <g>
          {Array.from({ length: 32 }, (_, i) => {
            const angle = (i * 11.25) * Math.PI / 180;
            const length = i % 2 === 0 ? 48 : 46;
            const width = i % 2 === 0 ? 1.2 : 0.8;
            const x1 = 50 + Math.cos(angle) * 30;
            const y1 = 50 + Math.sin(angle) * 30;
            const x2 = 50 + Math.cos(angle) * length;
            const y2 = 50 + Math.sin(angle) * length;
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="currentColor"
                strokeWidth={width}
                strokeLinecap="round"
              />
            );
          })}
          
          {/* Lingkaran utama untuk matahari */}
          <circle
            cx="50"
            cy="50"
            r="26"
            fill="currentColor"
            stroke="none"
          />
          
          {/* Area putih di dalam untuk kaligrafi */}
          <circle
            cx="50"
            cy="50"
            r="22"
            fill="white"
            stroke="none"
          />
          
          {/* Kaligrafi Muhammad stylized sederhana */}
          <g fill="currentColor">
            {/* Representasi kaligrafi Arab yang disederhanakan */}
            <path
              d="M35,45 Q40,40 45,45 Q50,42 55,45 Q60,40 65,45 
                 L62,50 Q55,52 50,50 Q45,52 38,50 Z"
            />
            <path
              d="M40,52 Q45,48 50,52 Q55,48 60,52 
                 L58,55 Q50,57 42,55 Z"
            />
            {/* Titik-titik decorative */}
            <circle cx="42" cy="42" r="1" />
            <circle cx="58" cy="42" r="1" />
            <circle cx="50" cy="58" r="1" />
          </g>
          
          {/* Figur manusia berdoa di bawah */}
          <g transform="translate(50, 75)">
            {/* Kepala */}
            <circle cx="0" cy="-5" r="3" fill="currentColor" />
            
            {/* Badan */}
            <rect x="-2" y="-2" width="4" height="8" rx="1" fill="currentColor" />
            
            {/* Tangan terangkat (posisi doa) */}
            <path
              d="M-2,-1 Q-6,-3 -7,0 Q-6,1 -4,0
                 M2,-1 Q6,-3 7,0 Q6,1 4,0"
              fill="currentColor"
            />
            
            {/* Kaki */}
            <rect x="-2" y="6" width="1.5" height="4" rx="0.5" fill="currentColor" />
            <rect x="0.5" y="6" width="1.5" height="4" rx="0.5" fill="currentColor" />
          </g>
          
          {/* Figur manusia kedua */}
          <g transform="translate(35, 75)">
            <circle cx="0" cy="-5" r="3" fill="currentColor" />
            <rect x="-2" y="-2" width="4" height="8" rx="1" fill="currentColor" />
            <path
              d="M-2,-1 Q-6,-3 -7,0 Q-6,1 -4,0
                 M2,-1 Q6,-3 7,0 Q6,1 4,0"
              fill="currentColor"
            />
            <rect x="-2" y="6" width="1.5" height="4" rx="0.5" fill="currentColor" />
            <rect x="0.5" y="6" width="1.5" height="4" rx="0.5" fill="currentColor" />
          </g>
          
          {/* Figur manusia ketiga */}
          <g transform="translate(65, 75)">
            <circle cx="0" cy="-5" r="3" fill="currentColor" />
            <rect x="-2" y="-2" width="4" height="8" rx="1" fill="currentColor" />
            <path
              d="M-2,-1 Q-6,-3 -7,0 Q-6,1 -4,0
                 M2,-1 Q6,-3 7,0 Q6,1 4,0"
              fill="currentColor"
            />
            <rect x="-2" y="6" width="1.5" height="4" rx="0.5" fill="currentColor" />
            <rect x="0.5" y="6" width="1.5" height="4" rx="0.5" fill="currentColor" />
          </g>
        </g>
      </svg>
    </div>
  );
};

export default MuhammadiyahIcon;