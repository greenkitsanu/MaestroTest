import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

interface ItemDetail {
  title: string;
  icon: string;
  color: string;
  description: string;
  details: string;
  features: string[];
}

const ITEM_DETAILS: Record<string, ItemDetail> = {
  "1": {
    title: "React Native",
    icon: "⚛️",
    color: "#61DAFB",
    description: "Build native apps using React",
    details:
      "React Native lets you build mobile apps using only JavaScript and React. It uses the same design as React, letting you compose a rich mobile UI from declarative components.",
    features: [
      "Cross-platform development",
      "Hot reloading",
      "Native components",
      "Large community",
      "Reusable code",
    ],
  },
  "2": {
    title: "Expo",
    icon: "📱",
    color: "#000020",
    description: "Universal app platform",
    details:
      "Expo is an open-source platform for making universal native apps for Android, iOS, and the web with JavaScript and React.",
    features: [
      "Over-the-air updates",
      "Managed workflow",
      "Rich SDK",
      "Easy deployment",
      "Development builds",
    ],
  },
  "3": {
    title: "TypeScript",
    icon: "🔷",
    color: "#3178C6",
    description: "Typed JavaScript at any scale",
    details:
      "TypeScript extends JavaScript by adding types. By understanding JavaScript, TypeScript saves you time catching errors and providing fixes before you run code.",
    features: [
      "Static type checking",
      "IDE support",
      "Latest ECMAScript features",
      "Gradual adoption",
      "Rich type system",
    ],
  },
  "4": {
    title: "Maestro",
    icon: "🎭",
    color: "#FF6B6B",
    description: "Mobile UI testing framework",
    details:
      "Maestro is a mobile UI testing framework that provides a simple and effective way to automate end-to-end testing for mobile apps.",
    features: [
      "Simple YAML syntax",
      "Cross-platform",
      "CI/CD integration",
      "Visual testing",
      "Flake-resistant",
    ],
  },
  "5": {
    title: "Expo Router",
    icon: "🧭",
    color: "#6C63FF",
    description: "File-based routing for React Native",
    details:
      "Expo Router is a file-based router for React Native and web apps. It allows you to manage navigation between screens in your app using files in the app directory.",
    features: [
      "File-based routing",
      "Deep linking",
      "Type-safe navigation",
      "Universal links",
      "Nested layouts",
    ],
  },
};

export default function DetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const item = ITEM_DETAILS[id] || ITEM_DETAILS["1"];

  return (
    <ScrollView style={styles.container} testID="detail-screen">
      <View style={[styles.heroSection, { backgroundColor: item.color }]}>
        <Text style={styles.heroIcon}>{item.icon}</Text>
        <Text style={styles.heroTitle}>{item.title}</Text>
        <Text style={styles.heroDescription}>{item.description}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text testID="detail-description" style={styles.detailText}>
            {item.details}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Features</Text>
          {item.features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <View
                style={[styles.featureDot, { backgroundColor: item.color }]}
              />
              <Text testID={`feature-${index}`} style={styles.featureText}>
                {feature}
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          testID="back-to-dashboard"
          style={[styles.backButton, { backgroundColor: item.color }]}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  heroSection: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  heroIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  heroDescription: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
  },
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  detailText: {
    fontSize: 15,
    lineHeight: 24,
    color: "#666",
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  featureText: {
    fontSize: 15,
    color: "#555",
  },
  backButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 40,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
