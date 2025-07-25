import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

export default function DriverApp() {
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState(null);
  const [outboundRoute, setOutboundRoute] = useState([]);
  const [returnRoute, setReturnRoute] = useState([]);
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);

  const STATIONS = {
    mexico: { 
      latitude: 9.011410, 
      longitude: 38.745901,
      name: "Mexico Taxi Station",
      address: "Ras Abebe Aragay St, Addis Ababa"
    },
    kazanchis: { 
      latitude: 9.014795, 
      longitude: 38.771305,
      name: "Kazanchis Taxi Station",
      address: "Tito St, Addis Ababa"
    }
  };

  const WAYPOINTS = {
    outbound: [
      {latitude: 9.017159, longitude: 38.752188}, 
      {latitude: 9.018573, longitude: 38.760305}, 
      {latitude: 9.017232, longitude: 38.763363}, 
      {latitude: 9.016003, longitude: 38.770468}  
    ]
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Location permission is required');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
      
      setRegion({
        latitude: (STATIONS.mexico.latitude + STATIONS.kazanchis.latitude) / 2,
        longitude: (STATIONS.mexico.longitude + STATIONS.kazanchis.longitude) / 2,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04
      });

      await fetchRouteCoordinates();
      setLoading(false);
    })();
  }, []);

  const fetchRouteCoordinates = async () => {
    try {
      const coordinates = [
        `${STATIONS.mexico.longitude},${STATIONS.mexico.latitude}`,
        ...WAYPOINTS.outbound.map(wp => `${wp.longitude},${wp.latitude}`),
        `${STATIONS.kazanchis.longitude},${STATIONS.kazanchis.latitude}`
      ].join(';');

      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`
      );
      const data = await response.json();

      if (data.routes && data.routes[0]) {
        const coords = data.routes[0].geometry.coordinates.map(coord => ({
          latitude: coord[1],
          longitude: coord[0]
        }));
        setOutboundRoute(coords);
        setDistance((data.routes[0].distance / 1000).toFixed(1));
        setDuration((data.routes[0].duration / 60).toFixed(0));
        
        setReturnRoute([...coords].reverse());
      }
    } catch (error) {
      console.error('Error fetching route:', error);
      Alert.alert('Error', 'Could not fetch route data');
      setOutboundRoute([
        STATIONS.mexico,
        ...WAYPOINTS.outbound,
        STATIONS.kazanchis
      ]);
      setReturnRoute([
        STATIONS.kazanchis,
        ...[...WAYPOINTS.outbound].reverse(),
        STATIONS.mexico
      ]);
      setDistance(3.5);
      setDuration(12);
    }
  };

  const toggleOnlineStatus = () => {
    setIsOnline(previousState => !previousState);
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading road-aligned route...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        showsUserLocation={true}
        showsTraffic={true}
        showsCompass={true}
      >
        <Marker
          coordinate={STATIONS.mexico}
          title="Mexico Taxi Station"
          description={STATIONS.mexico.address}
          pinColor="green"
        />
        <Marker
          coordinate={STATIONS.kazanchis}
          title="Kazanchis Taxi Station"
          description={STATIONS.kazanchis.address}
          pinColor="red"
        />

        {outboundRoute.length > 1 && (
          <Polyline
            coordinates={outboundRoute}
            strokeColor="#0a84ff"
            strokeWidth={5}
          />
        )}

        {returnRoute.length > 1 && (
          <Polyline
            coordinates={returnRoute}
            strokeColor="#ff9900"
            strokeWidth={5}
            lineDashPattern={[5, 5]}
          />
        )}

        {WAYPOINTS.outbound.map((point, index) => (
          <Marker
            key={index}
            coordinate={point}
            title={index === 0 ? "Ras Abebe Aragay St" : 
                  index === 1 || index === 2 ? "Yohanis St" : "Tito St"}
            pinColor="blue"
          />
        ))}
      </MapView>

      <View style={[styles.statusBar, { backgroundColor: isOnline ? '#0a84ff' : '#e0e0e0' }]}>
        <View style={styles.statusToggle}>
          <Text style={[styles.statusText, { color: isOnline ? 'white' : 'black' }]}>
            {isOnline ? ' ONLINE ' : ' OFFLINE '}
          </Text>
          <Switch
            value={isOnline}
            onValueChange={toggleOnlineStatus}
            trackColor={{ false: '#767577', true: 'white' }}
            thumbColor={isOnline ? '#0a84ff' : '#f4f3f4'}
          />
        </View>
        
        <View style={styles.routeInfo}>
          <Text style={[styles.routeText, { color: isOnline ? 'white' : 'black' }]}>
            Route: Ras Abebe Aragay → Yohanis → Tito
          </Text>
          <Text style={[styles.routeText, { color: isOnline ? 'white' : 'black' }]}>
            Distance: {distance} km • Time: {duration} mins
          </Text>
        </View>
      </View>
    </View>
  );
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
  loadingText: {
    marginTop: 10,
    fontSize: 16
  },
  statusBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0a84ff',
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  statusToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  routeInfo: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)'
  },
  routeText: {
    fontSize: 14,
    marginVertical: 2
  }
});