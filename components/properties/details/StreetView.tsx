import Constants from "expo-constants";
import { Image } from "@/components/ui/image";

interface StreetViewImageProps {
  latitude: number;
  longitude: number;
  size?: {
    width: number;
    height: number;
  };
  onError?: () => void;
}

const StreetViewImage: React.FC<StreetViewImageProps> = ({
  latitude,
  longitude,
  size = { width: 400, height: 200 },
  onError,
}) => {
  // Get API key from Expo Constants
  const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.extra?.googleMapsKey || "";

  const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=${size.width}x${size.height}&location=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`;

  return (
    <Image
      source={{ uri: streetViewUrl }}
      alt="Street View"
      className="h-full w-full object-cover rounded-md"
      onError={() => {
        console.log("Street View image failed to load");
        onError && onError();
      }}
    />
  );
};

export default StreetViewImage;
