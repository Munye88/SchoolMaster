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
    
    // Log the image source type for debugging
    if (imageUrl.startsWith('data:')) {
      console.log(`Loading base64 image for ${name} (length: ${imageUrl.length.toLocaleString()} chars)`);
    } else {
      console.log(`Loading URL image for ${name}: ${imageUrl}`);
    }
  }, [imageUrl, name]);
  
  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  // Size classes with consistent proportions - ensuring all have exact same dimensions
  const sizeClasses = {
    sm: "h-14 w-14 min-h-[3.5rem] min-w-[3.5rem] text-base",  // Slightly larger for consistency
    md: "h-20 w-20 min-h-[5rem] min-w-[5rem] text-xl",    // Standard size with minimum dimensions
    lg: "h-28 w-28 min-h-[7rem] min-w-[7rem] text-2xl",
    xl: "h-36 w-36 min-h-[9rem] min-w-[9rem] text-3xl",
    '2xl': "h-48 w-48 min-h-[12rem] min-w-[12rem] text-4xl", // Larger size for profile pictures
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
  
  // Use a blue border for the avatar to match the screenshot
  const getBorderColor = () => {
    return "border-[#00AEEF]"; // Light blue border to match the screenshot
  };
  
  const containerClassName = `${sizeClasses[size]} rounded-full ${getBorderColor()} border-4 overflow-hidden flex items-center justify-center shadow-md flex-shrink-0 flex-grow-0 bg-white`;
  
  return (
    <div className={containerClassName}>
      {imageSource && !imageError ? (
        <div className="h-full w-full bg-white">
          <img
            src={imageSource}
            alt={name}
            className="h-full w-full object-cover bg-white" 
            style={{ 
              objectPosition: "center 15%", // Position higher to show faces properly
              transform: "scale(1)", // Don't scale down to ensure consistent size
              width: "100%",
              height: "100%",
              backgroundColor: "white" // Force white background
            }}
            onError={handleImageError}
          />
        </div>
      ) : (
        <div 
          className={`h-full w-full flex items-center justify-center text-white font-bold ${initialsFontSize[size]}`}
          style={{ backgroundColor: schoolColor }}
        >
          {getInitials(name)}
        </div>
      )}
    </div>
  );
}