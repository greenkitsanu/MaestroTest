import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";

interface Item {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

const DATA: Item[] = [
  {
    id: "1",
    title: "React Native",
    description: "Build native apps using React",
    icon: "⚛️",
    color: "#61DAFB",
  },
  {
    id: "2",
    title: "Expo",
    description: "Universal app platform",
    icon: "📱",
    color: "#000020",
  },
  {
    id: "3",
    title: "TypeScript",
    description: "Typed JavaScript at any scale",
    icon: "🔷",
    color: "#3178C6",
  },
  {
    id: "4",
    title: "Maestro",
    description: "Mobile UI testing framework",
    icon: "🎭",
    color: "#FF6B6B",
  },
  {
    id: "5",
    title: "Expo Router",
    description: "File-based routing for React Native",
    icon: "🧭",
    color: "#6C63FF",
  },
];

export default function DashboardScreen() {
  const router = useRouter();

  const handleItemPress = (item: Item) => {
    router.push(`/detail/${item.id}`);
  };

  const handleLogout = () => {
    router.replace("/");
  };

  const renderItem = ({ item }: { item: Item }) => (
    <TouchableOpacity
      testID={`item-${item.id}`}
      style={styles.card}
      onPress={() => handleItemPress(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
        <Text style={styles.icon}>{item.icon}</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDescription}>{item.description}</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Welcome back!</Text>
          <Text style={styles.headerSubtitle}>
            Explore our tech stack
          </Text>
        </View>
        <TouchableOpacity
          testID="logout-button"
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        testID="dashboard-list"
        data={DATA}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  welcome: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#999",
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  listContent: {
    padding: 16,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    fontSize: 24,
  },
  cardContent: {
    flex: 1,
    marginLeft: 14,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#333",
  },
  cardDescription: {
    fontSize: 13,
    color: "#999",
    marginTop: 4,
  },
  arrow: {
    fontSize: 24,
    color: "#CCC",
    fontWeight: "300",
  },
});
