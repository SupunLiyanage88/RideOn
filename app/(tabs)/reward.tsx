import { fetchSubscriptionPackages } from '@/api/subscription'; // Import the function from api/subscription
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Define the shape of the package
interface Package {
  _id: string;
  name: string;
  rc: string;
  price: string;
  recommended: boolean;
  icon: string;
  description: string;
  isActive: boolean;
}

const Reward = () => {
  const [activeTab, setActiveTab] = useState('Available');
  const [packages, setPackages] = useState<Package[]>([]); // Use the Package type for the state
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchPackages = async () => {
      setLoading(true); // Start loading before the API call

      try {
        const token = await AsyncStorage.getItem('token'); // Retrieve token from AsyncStorage

        if (!token) {
          console.log("No token found in AsyncStorage");
          setLoading(false); // Stop loading if no token is found
          return;
        }

        // Fetch subscription packages using the new API function
        const fetchedPackages = await fetchSubscriptionPackages(token); // Call the API function
        setPackages(fetchedPackages); // Set the fetched packages
        setLoading(false); // Stop loading after data is fetched
      } catch (err) {
        console.error('Error fetching packages:', err); // Log the error
        setLoading(false); // Stop loading on error
      }
    };

    fetchPackages(); // Call the fetchPackages function on component mount
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>RC Packages</Text>
      </View>

      {/* Toggle Buttons */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            activeTab === 'Available' ? styles.activeToggle : styles.inactiveToggle,
          ]}
          onPress={() => setActiveTab('Available')}
        >
          <Text
            style={[
              styles.toggleText,
              activeTab === 'Available' ? styles.activeToggleText : styles.inactiveToggleText,
            ]}
          >
            Available
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            activeTab === 'Active' ? styles.activeToggle : styles.inactiveToggle,
          ]}
          onPress={() => setActiveTab('Active')}
        >
          <Text
            style={[
              styles.toggleText,
              activeTab === 'Active' ? styles.activeToggleText : styles.inactiveToggleText,
            ]}
          >
            Active
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search RC Packages"
          placeholderTextColor="#999"
        />
      </View>

      {/* Package List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {loading ? (
          <Text>Loading...</Text>
        ) : (
          packages.map((pkg) => (
            <View key={pkg._id} style={styles.packageCard}>
              {pkg.recommended && (
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedText}>Recommended</Text>
                </View>
              )}

              <View style={styles.packageContent}>
                <View style={styles.packageInfo}>
                  <Text style={styles.packageName}>{pkg.name}</Text>
                  <Text style={styles.packageRC}>{pkg.rc}</Text>
                  <Text style={styles.packagePrice}>{pkg.price}</Text>
                </View>

                <View style={styles.packageRight}>
                  <View style={styles.iconContainer}>
                    <Text style={styles.packageIcon}>{pkg.icon}</Text>
                  </View>
                  <TouchableOpacity style={styles.buyButton}>
                    <Text style={styles.buyButtonText}>Buy</Text>
                  </TouchableOpacity>
                  <Ionicons name="chevron-forward" size={20} color="#666" style={styles.chevron} />
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="qr-code" size={24} color="#666" />
          <Text style={styles.navText}>Scan</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="card" size={24} color="#4CAF50" />
          <Text style={[styles.navText, { color: '#4CAF50' }]}>VC</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={24} color="#666" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="car" size={24} color="#666" />
          <Text style={styles.navText}>SOS</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person" size={24} color="#666" />
          <Text style={styles.navText}>Me</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#f0f0f0',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 15,
    backgroundColor: '#e0e0e0',
    borderRadius: 25,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  activeToggle: {
    backgroundColor: '#4CAF50',
  },
  inactiveToggle: {
    backgroundColor: 'transparent',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '500',
  },
  activeToggleText: {
    color: 'white',
  },
  inactiveToggleText: {
    color: '#666',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#2C5F6F',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 10,
    color: 'white',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: 'white',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  packageCard: {
    backgroundColor: '#2C5F6F',
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recommendedBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: '#4CAF50',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    zIndex: 1,
  },
  recommendedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  packageContent: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
  },
  packageInfo: {
    flex: 1,
  },
  packageName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  packageRC: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 3,
  },
  packagePrice: {
    fontSize: 14,
    color: '#B0B0B0',
  },
  packageRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  packageIcon: {
    fontSize: 24,
  },
  buyButton: {
    backgroundColor: '#1E4A54',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginBottom: 10,
  },
  buyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  chevron: {
    color: 'white',
    opacity: 0.7,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#2C5F6F',
    paddingVertical: 10,
    paddingBottom: 20,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 5,
  },
  navText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});

export default Reward;
