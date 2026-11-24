import { useState, useEffect } from 'react';
import { getInitials, getAvatarColor, getAvatarUrl } from '../../utils/helpers';

const sizeConfig = {
  xs: { container: 'h-6 w-6', text: 'text-xs', ring: 'ring-1', online: 'h-1.5 w-1.5' },
  sm: { container: 'h-8 w-8', text: 'text-sm', ring: 'ring-1', online: 'h-2 w-2' },
  md: { container: 'h-10 w-10', text: 'text-sm', ring: 'ring-2', online: 'h-2.5 w-2.5' },
  lg: { container: 'h-12 w-12', text: 'text-base', ring: 'ring-2', online: 'h-3 w-3' },
  xl: { container: 'h-16 w-16', text: 'text-xl', ring: 'ring-2', online: 'h-3.5 w-3.5' },
  '2xl': { container: 'h-24 w-24', text: 'text-3xl', ring: 'ring-4', online: 'h-4 w-4' },
  '3xl': { container: 'h-36 w-36 sm:h-40 sm:w-40', text: 'text-4xl', ring: 'ring-4', online: 'h-5 w-5' },
};

export default function Avatar({
  src,
  name = '',
  size = 'md',
  online = false,
  ring = false,
  ringColor = 'ring-white',
  className = '',
  onClick,
}) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [src]);

  const cfg = sizeConfig[size] || sizeConfig.md;
  const initials = getInitials(name);
  const bgColor = getAvatarColor(name);
  const avatarUrl = src ? getAvatarUrl(src) : null;
  const showImage = Boolean(avatarUrl && !imgError);

  return (
    <div
      className={`relative inline-flex flex-shrink-0 rounded-full ${cfg.container} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
        {showImage ? (
          <img
            src={avatarUrl}
            alt={name || 'Avatar'}
            onError={() => setImgError(true)}
            className={`
              w-full h-full rounded-full object-cover
              ${ring ? `${cfg.ring} ${ringColor}` : ''}
            `}
          />
        ) : (
          <div
            className={`
              w-full h-full rounded-full flex items-center justify-center font-semibold text-white select-none
              ${ring ? `${cfg.ring} ${ringColor}` : ''}
            `}
            style={{ backgroundColor: bgColor }}
          >
            <span className={cfg.text}>{initials}</span>
          </div>
        )}
      </div>
      {online && (
        <span
          className={`absolute bottom-0 right-0 ${cfg.online} rounded-full bg-secondary border-2 border-white z-10`}
        />
      )}
    </div>
  );
}
