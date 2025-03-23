import "react-native-get-random-values";
import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { View, Dimensions, Platform, Text, Animated } from "react-native";
import MapView, { Marker, Region, PROVIDER_GOOGLE } from "react-native-maps";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import StreetView from "react-native-streetview";
import Constants from "expo-constants";
import { Button, ButtonText } from "@/components/ui/button";
import { Location } from "@/lib/@types/properties";

interface GooglePlaceDetail {
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  formatted_address?: string;
  address_components?: {
    long_name: string;
    short_name: string;
    types: string[];
  }[];
}

interface GooglePlace {
  description: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
}

interface LocationSearchMapProps {
  onSaveLocation?: (location: Location, address: string) => void;
}

const SHEET_HEIGHT = 300;
const LATITUDE_OFFSET = 0.0025;

const LocationSearchMap: React.FC<LocationSearchMapProps> = ({
  onSaveLocation,
}) => {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null,
  );
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [streetViewError, setStreetViewError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const mapRef = useRef<MapView | null>(null);
  const bottomSheetAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;

  const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.extra?.googleMapsKey;

  // Memoize the initialRegion to prevent unnecessary re-renders
  const initialRegion = useMemo<Region>(
    () => ({
      latitude: 39.8283,
      longitude: -98.5795,
      latitudeDelta: 50,
      longitudeDelta: 50,
    }),
    [],
  );

  // Memoize the API query parameters
  const queryParams = useMemo(
    () => ({
      key: GOOGLE_MAPS_API_KEY,
      language: "en",
    }),
    [GOOGLE_MAPS_API_KEY],
  );

  // Memoize the autocomplete styles
  const autocompleteStyles = useMemo(
    () => ({
      textInput: {
        height: 50,
        borderRadius: 10,
        paddingHorizontal: 10,
        backgroundColor: "white",
        marginHorizontal: 10,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      },
      container: {
        flex: 0,
        width: "100%",
        zIndex: 1,
      },
      listView: {
        backgroundColor: "white",
        marginHorizontal: 10,
        marginTop: 5,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      },
      row: {
        padding: 13,
        minHeight: 44,
      },
      description: {
        fontSize: 15,
      },
    }),
    [],
  );

  const handleConfirm = useCallback(async () => {
    if (selectedLocation && selectedAddress && onSaveLocation) {
      setIsLoading(true);
      try {
        onSaveLocation(selectedLocation, selectedAddress);
      } catch (error) {
        console.error("Error in location save:", error);
      } finally {
        setIsLoading(false);
        setShowConfirmation(false);
      }
    }
  }, [selectedLocation, selectedAddress, onSaveLocation]);

  const handleCancel = useCallback(() => {
    setShowConfirmation(false);
    setSelectedLocation(null);
    setSelectedAddress(null);
    setStreetViewError(false);
  }, []);

  const handleStreetViewError = useCallback(() => {
    setStreetViewError(true);
  }, []);

  // Handle map initialization
  useEffect(() => {
    if (mapRef.current && mapReady) {
      mapRef.current.animateToRegion(initialRegion, 100);
    }
  }, [initialRegion, mapReady]);

  // Handle bottom sheet animation
  useEffect(() => {
    Animated.spring(bottomSheetAnim, {
      toValue: showConfirmation ? 0 : SHEET_HEIGHT,
      useNativeDriver: true,
      tension: 65,
      friction: 10,
    }).start();
  }, [showConfirmation, bottomSheetAnim]);

  const handleLocationSelect = useCallback(
    (data: GooglePlace, details: GooglePlaceDetail | null = null): void => {
      if (!details?.geometry?.location) {
        console.error("Invalid location data received");
        return;
      }

      try {
        const location: Location = {
          latitude: details.geometry.location.lat,
          longitude: details.geometry.location.lng,
        };

        setSelectedLocation(location);
        setSelectedAddress(details.formatted_address || null);
        setStreetViewError(false);

        if (mapRef.current && mapReady) {
          mapRef.current.animateToRegion(
            {
              latitude: location.latitude - LATITUDE_OFFSET,
              longitude: location.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            },
            1000,
          );
        }

        // Use requestAnimationFrame instead of setTimeout for better performance
        requestAnimationFrame(() => {
          setShowConfirmation(true);
        });
      } catch (error) {
        console.error("Error processing location:", error);
      }
    },
    [mapReady],
  );

  const renderRow = useCallback((rowData: GooglePlace) => {
    const mainText = rowData.structured_formatting?.main_text || "";
    const secondaryText = rowData.structured_formatting?.secondary_text || "";

    return (
      <View className="p-3 min-h-11">
        <Text className="text-base font-bold">{mainText}</Text>
        {secondaryText ? (
          <Text className="text-sm text-gray-500 mt-0.5">{secondaryText}</Text>
        ) : null}
      </View>
    );
  }, []);

  const renderStreetView = useMemo(() => {
    if (!selectedLocation) return null;

    return (
      <View className="h-32 mb-5 rounded-lg overflow-hidden">
        {streetViewError ? (
          <View className="flex-1 bg-black justify-center items-center">
            <Text className="text-white text-base font-semibold">
              Preview Unavailable
            </Text>
          </View>
        ) : (
          <StreetView
            style={{ flex: 1 }}
            allGesturesEnabled={true}
            coordinate={selectedLocation}
            onError={handleStreetViewError}
            pov={{
              tilt: 0,
              bearing: 0,
              zoom: 1,
            }}
          />
        )}
      </View>
    );
  }, [selectedLocation, streetViewError, handleStreetViewError]);

  return (
    <View className="flex-1">
      <View className="flex-1">
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={{
            width: Dimensions.get("window").width,
            height: Dimensions.get("window").height,
          }}
          initialRegion={initialRegion}
          onMapReady={() => setMapReady(true)}
        >
          {selectedLocation && (
            <Marker
              coordinate={selectedLocation}
              title={selectedAddress || "Selected Location"}
            />
          )}
        </MapView>
      </View>

      <View
        className={`absolute ${Platform.OS === "ios" ? "top-8" : "top-3"} w-full z-10`}
      >
        <GooglePlacesAutocomplete
          placeholder="Search for any address"
          minLength={2}
          fetchDetails={true}
          enablePoweredByContainer={false}
          onPress={handleLocationSelect}
          onFail={(error: Error) => console.error("Places API Error:", error)}
          onNotFound={() => console.log("No results found")}
          query={queryParams}
          styles={autocompleteStyles}
          renderRow={renderRow}
        />
      </View>

      {showConfirmation && (
        <View className="absolute inset-0 bg-black opacity-50" />
      )}

      <Animated.View
        className="absolute left-0 right-0 bottom-0 bg-white rounded-t-3xl shadow-md"
        style={{
          height: SHEET_HEIGHT,
          transform: [{ translateY: bottomSheetAnim }],
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        <View className="w-10 h-1 bg-gray-300 rounded-full self-center mt-3" />
        <View className="flex-1 p-5 pt-2">
          <View className="mb-5">
            <Text className="text-xl font-bold mb-2">Confirm Location</Text>
            <Text
              className="text-base text-gray-500 leading-6"
              numberOfLines={2}
            >
              {selectedAddress}
            </Text>
          </View>

          {renderStreetView}

          <View className="flex-row gap-3 w-full">
            <Button
              onPress={handleCancel}
              size="md"
              variant="outline"
              action="primary"
              className="w-full flex-1"
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
            <Button
              onPress={handleConfirm}
              disabled={isLoading}
              size="md"
              variant="solid"
              className="w-full flex-1"
              action="primary"
            >
              <ButtonText>{isLoading ? "Saving..." : "Confirm"}</ButtonText>
            </Button>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

export default LocationSearchMap;
