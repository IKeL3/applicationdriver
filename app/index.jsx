import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ActivityIndicator,
  Pressable
} from 'react-native'
import MapView, { Marker, Polyline } from 'react-native-maps'
import * as Location from 'expo-location'
import { Ionicons } from '@expo/vector-icons'

export default function DriverMain() {
  const [location, setLocation] = useState(null)
  const [region, setRegion] = useState(null)
  const [isOnline, setIsOnline] = useState(true)
  const [destination, setDestination] = useState(null)
  const [routeCoords, setRouteCoords] = useState([])

  // Simulated passenger location
  const passengers = [
    { id: 1, latitude: 37.785, longitude: -122.42, name: 'Passenger A' },
    { id: 2, latitude: 37.787, longitude: -122.41, name: 'Passenger B' }
  ]

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        alert('Permission to access location was denied')
        return
      }

      const loc = await Location.getCurrentPositionAsync({})
      const coords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01
      }

      setLocation(loc.coords)
      setRegion(coords)
    })()
  }, [])

  const handleMapLongPress = (event) => {
    const { coordinate } = event.nativeEvent
    setDestination(coordinate)

    // Fake a route (in real app use Google Directions API or Mapbox)
    setRouteCoords([
      { latitude: location.latitude, longitude: location.longitude },
      coordinate
    ])
  }

  if (!region) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        showsUserLocation={true}
        onLongPress={handleMapLongPress}
      >
        {/* Destination Marker */}
        {destination && (
          <Marker coordinate={destination} pinColor="green" title="Destination" />
        )}

        {/* Passenger Markers */}
        {passengers.map((p) => (
          <Marker
            key={p.id}
            coordinate={{ latitude: p.latitude, longitude: p.longitude }}
            title={p.name}
            pinColor="blue"
          />
        ))}

        {/* Route Line */}
        {routeCoords.length >= 2 && (
          <Polyline
            coordinates={routeCoords}
            strokeColor="#000"
            strokeWidth={4}
          />
        )}
      </MapView>

      {/* Online/Offline Toggle */}
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>Status: {isOnline ? 'Online' : 'Offline'}</Text>
        <Switch value={isOnline} onValueChange={setIsOnline} />
      </View>

      {/* Trip Info Button */}
      <Pressable style={styles.tripButton}>
        <Ionicons name="car-outline" size={24} color="white" />
        <Text style={styles.tripText}>View Trip</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  map: {
    flex: 1
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  statusBar: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center'
  },
  statusText: {
    color: 'white',
    marginRight: 10
  },
  tripButton: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20
  },
  tripText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: '600'
  }
})
