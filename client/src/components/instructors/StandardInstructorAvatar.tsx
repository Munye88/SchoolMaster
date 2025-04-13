import { useState, useEffect } from 'react';

type StandardInstructorAvatarProps = {
  imageUrl?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  schoolColor?: string;
};

export function StandardInstructorAvatar({ 
  imageUrl, 
  name, 
  size = 'md',
  schoolColor = '#0A2463' // Default blue for KFNA
}: StandardInstructorAvatarProps) {
  const [cacheBustKey, setCacheBustKey] = useState<string>('');
  
  // Generate a new cache bust key on mount and when imageUrl changes
  useEffect(() => {
    const timestamp = new Date().getTime();
    const randomString = Math.random().toString(36).substring(2, 8);
    setCacheBustKey(`?v=${timestamp}-${randomString}`);
  }, [imageUrl]);
  
  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  // Size classes
  const sizeClasses = {
    sm: "h-12 w-12 text-base",
    md: "h-20 w-20 text-xl",
    lg: "h-28 w-28 text-2xl",
    xl: "h-36 w-36 text-3xl",
  };
  
  return (
    <div 
      className={`${sizeClasses[size]} rounded-full border-4 border-white overflow-hidden shadow-xl flex items-center justify-center`}
      style={{ backgroundColor: schoolColor }}
    >
      {imageUrl ? (
        <img
          src={`${imageUrl}${cacheBustKey}`}
          alt={name}
          className="h-full w-full object-cover"
          onError={(e) => {
            // If image fails to load, show initials instead
            e.currentTarget.style.display = 'none';
            const parent = e.currentTarget.parentElement;
            if (parent) {
              // Create fallback with initials
              const fallback = document.createElement('div');
              fallback.className = 'h-full w-full flex items-center justify-center text-white font-bold';
              fallback.style.fontSize = size === 'sm' ? '1rem' : 
                                        size === 'md' ? '1.25rem' : 
                                        size === 'lg' ? '1.5rem' : '1.875rem';
              fallback.innerText = getInitials(name);
              parent.appendChild(fallback);
            }
          }}
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center text-white font-bold">
          {getInitials(name)}
        </div>
      )}
    </div>
  );
}