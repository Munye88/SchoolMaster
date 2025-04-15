import { useState, useEffect } from 'react';

type StandardInstructorAvatarProps = {
  imageUrl?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  schoolColor?: string;
};

export function StandardInstructorAvatar({ 
  imageUrl, 
  name, 
  size = 'md',
  schoolColor = '#0A2463' // Default blue for KFNA
}: StandardInstructorAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const [imageSource, setImageSource] = useState<string | null>(null);
  
  // Process the image URL when it changes
  useEffect(() => {
    if (!imageUrl) {
      setImageSource(null);
      setImageError(false);
      return;
    }
    
    // If it's already a data URL (base64), use it directly
    if (imageUrl.startsWith('data:')) {
      setImageSource(imageUrl);
    } else {
      // For regular URLs, add a cache-busting parameter
      const timestamp = new Date().getTime();
      const randomString = Math.random().toString(36).substring(2, 8);
      const cacheBustKey = `?v=${timestamp}-${randomString}`;
      setImageSource(`${imageUrl}${cacheBustKey}`);
    }
    
    // Reset error state when imageUrl changes
    setImageError(false);
  }, [imageUrl]);
  
  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  // Size classes - added 2xl size for larger profile views
  const sizeClasses = {
    sm: "h-12 w-12 text-base",
    md: "h-20 w-20 text-xl",
    lg: "h-28 w-28 text-2xl",
    xl: "h-36 w-36 text-3xl",
    '2xl': "h-52 w-52 text-4xl", // Larger size for profile pictures
  };
  
  // Font size for initials
  const initialsFontSize = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
    '2xl': "text-4xl",
  };
  
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error(`Image failed to load for ${name}:`, e);
    setImageError(true);
  };
  
  return (
    <div 
      className={`${sizeClasses[size]} rounded-full border-4 border-white overflow-hidden shadow-xl flex items-center justify-center`}
      style={{ backgroundColor: schoolColor }}
    >
      {imageSource && !imageError ? (
        <div className="h-full w-full relative overflow-hidden">
          <img
            src={imageSource}
            alt={name}
            className="h-full w-full object-cover object-center absolute inset-0" 
            style={{ objectPosition: "center 30%" }} /* Position to show faces better */
            onError={handleImageError}
          />
        </div>
      ) : (
        <div className={`h-full w-full flex items-center justify-center text-white font-bold ${initialsFontSize[size]}`}>
          {getInitials(name)}
        </div>
      )}
    </div>
  );
}