import "react-native-get-random-values";
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Platform,
  Text,
  Animated,
} from "react-native";
import MapView, { Marker, Region, PROVIDER_GOOGLE } from "react-native-maps";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import StreetView from "react-native-streetview";
import Constants from "expo-constants";
import { Button, ButtonText } from "@/components/ui/button";

interface Location {
  latitude: number;
  longitude: number;
}

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

const SHEET_HEIGHT = 400; // Increased height
const STREET_VIEW_HEIGHT = 130; // Increased height for street view

const LocationSearchMap: React.FC<LocationSearchMapProps> = ({
  onSaveLocation,
}) => {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const mapRef = useRef<MapView | null>(null);
  const bottomSheetAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;

  const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.extra?.googleMapsKey;

  const initialRegion: Region = {
    latitude: 39.8283,
    longitude: -98.5795,
    latitudeDelta: 50,
    longitudeDelta: 50,
  };
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (selectedLocation && selectedAddress && onSaveLocation) {
      setIsLoading(true);
      try {
        await onSaveLocation(selectedLocation, selectedAddress);
      } catch (error) {
        console.error("Error in location save:", error);
      } finally {
        setIsLoading(false);
        setShowConfirmation(false);
      }
    }
  };

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(initialRegion, 100);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    Animated.spring(bottomSheetAnim, {
      toValue: showConfirmation ? 0 : SHEET_HEIGHT,
      useNativeDriver: true,
      tension: 65,
      friction: 10,
    }).start();
  }, [showConfirmation, bottomSheetAnim]);

  const handleLocationSelect = (
    data: GooglePlace,
    details: GooglePlaceDetail | null = null
  ): void => {
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

      if (mapRef.current && mapReady) {
        mapRef.current.animateToRegion(
          {
            ...location,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          1000
        );
      }

      setTimeout(() => {
        setShowConfirmation(true);
      }, 500);
    } catch (error) {
      console.error("Error processing location:", error);
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    setSelectedLocation(null);
    setSelectedAddress(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={initialRegion}
          onMapReady={() => {
            console.log("Map ready event triggered");
            setMapReady(true);
          }}
        >
          {selectedLocation && (
            <Marker
              coordinate={selectedLocation}
              title={selectedAddress || "Selected Location"}
            />
          )}
        </MapView>
      </View>

      <View style={styles.searchContainer}>
        <GooglePlacesAutocomplete
          placeholder="Search for any address"
          minLength={2}
          fetchDetails={true}
          enablePoweredByContainer={false}
          onPress={handleLocationSelect}
          onFail={(error: Error) => console.error("Places API Error:", error)}
          onNotFound={() => console.log("No results found")}
          query={{
            key: GOOGLE_MAPS_API_KEY,
            language: "en",
          }}
          styles={{
            textInput: styles.searchInput,
            container: styles.autocompleteContainer,
            listView: styles.listView,
            row: styles.row,
            description: styles.description,
          }}
          renderRow={(rowData: GooglePlace) => {
            const mainText = rowData.structured_formatting?.main_text || "";
            const secondaryText =
              rowData.structured_formatting?.secondary_text || "";

            return (
              <View style={styles.row}>
                <Text style={styles.mainText}>{mainText}</Text>
                {secondaryText ? (
                  <Text style={styles.secondaryText}>{secondaryText}</Text>
                ) : null}
              </View>
            );
          }}
        />
      </View>

      {showConfirmation && <View style={styles.overlay} />}

      <Animated.View
        style={[
          styles.bottomSheet,
          {
            transform: [
              {
                translateY: bottomSheetAnim,
              },
            ],
          },
        ]}
      >
        <View style={styles.bottomSheetHandle} />
        <View style={styles.contentContainer}>
          <View style={styles.textContainer}>
            <Text style={styles.confirmationTitle}>Confirm Location</Text>
            <Text style={styles.addressText} numberOfLines={2}>
              {selectedAddress}
            </Text>
          </View>

          {selectedLocation && (
            <View style={styles.streetViewContainer}>
              <StreetView
                style={styles.streetView}
                allGesturesEnabled={true}
                coordinate={selectedLocation}
                onError={(error: any) => console.error("StreetView Error:", error)}
                onSuccess={() => console.log("StreetView loaded successfully")}
                onLoading={() => console.log("StreetView is loading...")}
                onStatus={(status: any) => console.log("StreetView status:", status)}
                pov={{
                  tilt: 0,
                  bearing: 0,
                  zoom: 1,
                }}
              />
            </View>
          )}

          <View style={styles.buttonContainer}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
  },
  searchContainer: {
    position: "absolute",
    top: Platform.OS === "ios" ? 100 : 80,
    width: "100%",
    zIndex: 1,
  },
  autocompleteContainer: {
    flex: 0,
    width: "100%",
    zIndex: 1,
  },
  searchInput: {
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
  description: {
    fontSize: 15,
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  streetViewContainer: {
    height: STREET_VIEW_HEIGHT,
    marginBottom: 20,
    borderRadius: 10,
    overflow: "hidden",
  },
  streetView: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "black",
    opacity: 0.5,
  },
  row: {
    padding: 13,
    minHeight: 44,
  },
  mainText: {
    fontSize: 15,
    fontWeight: "bold",
  },
  secondaryText: {
    fontSize: 13,
    color: "#666",
    marginTop: 3,
  },
  bottomSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: SHEET_HEIGHT,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#DEDEDE",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 8,
  },
  textContainer: {
    marginBottom: 20,
  },
  confirmationTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  addressText: {
    fontSize: 16,
    color: "#666",
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
});

export default LocationSearchMap;
