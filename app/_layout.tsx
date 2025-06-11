import { Drawer } from 'expo-router/drawer'

export default function RootLayout() {
  return (
    <Drawer>
      <Drawer.Screen name="index" options={{ title: 'Home' }} />
      <Drawer.Screen name="recent-trips" options={{ title: 'Recent Trips' }} />
      <Drawer.Screen name="app-settings" options={{ title: 'App Settings' }} />
      <Drawer.Screen name="info" options={{ title: 'Info' }} />
    </Drawer>
  )
}