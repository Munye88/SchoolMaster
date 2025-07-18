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
    sm: "h-24 w-24 min-h-[6rem] min-w-[6rem] text-base",  // Maximum increased for complete head visibility
    md: "h-32 w-32 min-h-[8rem] min-w-[8rem] text-xl",    // Much larger standard size for better display
    lg: "h-40 w-40 min-h-[10rem] min-w-[10rem] text-2xl",   // Very large for profile display
    xl: "h-48 w-48 min-h-[12rem] min-w-[12rem] text-3xl", // Extra large for detailed view
    '2xl': "h-60 w-60 min-h-[15rem] min-w-[15rem] text-4xl", // Maximum size for full profile pictures
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
  
  const containerClassName = `${sizeClasses[size]} rounded-full ${getBorderColor()} border-4 overflow-hidden flex items-center justify-center shadow-md flex-shrink-0 flex-grow-0 bg-white relative`;
  
  return (
    <div className={containerClassName}>
      {imageSource && !imageError ? (
        <img
          src={imageSource}
          alt={name}
          className="absolute rounded-full object-cover" 
          style={{ 
            objectFit: "cover",
            objectPosition: "center top",
            width: "calc(100% - 2px)",
            height: "calc(100% - 2px)",
            left: "1px",
            top: "1px",
            position: "absolute"
          }}
          onError={handleImageError}
        />
      ) : (
        <div 
          className={`absolute rounded-full flex items-center justify-center text-white font-bold ${initialsFontSize[size]}`}
          style={{ 
            backgroundColor: schoolColor,
            width: "calc(100% - 2px)",
            height: "calc(100% - 2px)",
            left: "1px",
            top: "1px"
          }}
        >
          {getInitials(name)}
        </div>
      )}
    </div>
  );
}