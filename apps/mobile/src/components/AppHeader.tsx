import { useState } from "react";
import { Image, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import { MORE_MENU_LINKS } from "../lib/menu-links";
import { LEGAL_DOCS, type LegalDocs } from "../lib/static-content";
import { useSiteContent } from "../lib/site-content";
import { adminUrlFor } from "../lib/admin-links";
import PageModalHeader from "./PageModalHeader";
import ServicesPageView from "../screens/pages/ServicesPageView";
import BlogPageView from "../screens/pages/BlogPageView";
import CareersPageView from "../screens/pages/CareersPageView";
import FaqPageView from "../screens/pages/FaqPageView";
import HowToBuyPageView from "../screens/pages/HowToBuyPageView";
import AdoptionPageView from "../screens/pages/AdoptionPageView";
import PetTagArchivePageView from "../screens/pages/PetTagArchivePageView";
import MicrochippingArchivePageView from "../screens/pages/MicrochippingArchivePageView";
import AdminLoginPageView from "../screens/pages/AdminLoginPageView";
import LegalPageView from "../screens/pages/LegalPageView";

const PAGE_TITLES: Record<string, string> = {
  services: "Services",
  blog: "Blog",
  careers: "Careers",
  faq: "FAQ",
  "how-to-buy": "How to Buy",
  adoption: "Dog Adoption",
  "pet-tag-archive": "Pet Tag Archive",
  "microchipping-archive": "Microchipping Archive",
  "admin-login": "Admin Login",
  terms: "Terms & Conditions",
  privacy: "Privacy Policy",
  refund: "Return & Refund",
};

function renderPage(key: string, legalDocs: LegalDocs) {
  switch (key) {
    case "services":
      return <ServicesPageView />;
    case "blog":
      return <BlogPageView />;
    case "careers":
      return <CareersPageView />;
    case "faq":
      return <FaqPageView />;
    case "how-to-buy":
      return <HowToBuyPageView />;
    case "adoption":
      return <AdoptionPageView />;
    case "pet-tag-archive":
      return <PetTagArchivePageView />;
    case "microchipping-archive":
      return <MicrochippingArchivePageView />;
    case "admin-login":
      return <AdminLoginPageView />;
    case "terms":
      return <LegalPageView title="Terms & Conditions" body={legalDocs.terms.content} />;
    case "privacy":
      return <LegalPageView title="Privacy Policy" body={legalDocs.privacy.content} />;
    case "refund":
      return <LegalPageView title="Return & Refund" body={legalDocs.refund.content} />;
    default:
      return null;
  }
}

/** Matches the web app's mobile SiteHeader + HeaderSearch exactly, so both surfaces look identical. */
export default function AppHeader() {
  const [moreOpen, setMoreOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activePage, setActivePage] = useState<string | null>(null);
  const legalDocs = useSiteContent("cph_legal_docs", LEGAL_DOCS);

  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <View style={styles.brandRow}>
          <Image source={require("../../assets/brand/cph-logo.jpeg")} style={styles.logo} resizeMode="contain" />
          <Text style={styles.tagline} numberOfLines={1}>
            One Roof Solution to Your Pet Care
          </Text>
        </View>
        <View style={styles.actions}>
          <Pressable style={styles.iconButton} onPress={() => setMoreOpen(true)}>
            <Text style={styles.iconText}>⋯</Text>
          </Pressable>
          <Pressable style={styles.iconButton}>
            <Text style={styles.iconText}>👤</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.searchBar}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search for dog food, vet booking, puppies…"
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
        />
        <Pressable style={styles.searchButton}>
          <Text style={styles.searchButtonText}>Search</Text>
        </Pressable>
      </View>

      <Modal visible={moreOpen} transparent animationType="fade" onRequestClose={() => setMoreOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setMoreOpen(false)}>
          <View style={styles.menu}>
            {MORE_MENU_LINKS.map((l, i) => (
              <Pressable
                key={l.key}
                onPress={() => {
                  setMoreOpen(false);
                  setActivePage(l.key);
                }}
                style={[styles.menuItem, i < MORE_MENU_LINKS.length - 1 && styles.menuItemBorder]}
              >
                <Text style={styles.menuItemText}>{l.label}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      <Modal visible={activePage !== null} animationType="slide" onRequestClose={() => setActivePage(null)}>
        <SafeAreaView style={styles.pageWrap} edges={["top"]}>
          <PageModalHeader
            title={activePage ? PAGE_TITLES[activePage] ?? "" : ""}
            onClose={() => setActivePage(null)}
            adminUrl={activePage ? adminUrlFor(activePage) : undefined}
          />
          {activePage && renderPage(activePage, legalDocs)}
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: colors.background },
  pageWrap: { flex: 1, backgroundColor: colors.background },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 1 },
  logo: { width: 28, height: 28, borderRadius: 8 },
  tagline: { fontSize: 12, color: colors.textSecondary, flexShrink: 1 },
  actions: { flexDirection: "row", gap: 8, alignItems: "center" },
  iconButton: {
    width: 30,
    height: 30,
    borderRadius: 999,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: { fontSize: 14 },
  searchBar: {
    marginHorizontal: 16,
    marginBottom: 10,
    height: 42,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 14,
    paddingRight: 6,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 13, color: colors.text, height: "100%" },
  searchButton: { backgroundColor: colors.primary, height: 32, paddingHorizontal: 18, borderRadius: 6, alignItems: "center", justifyContent: "center" },
  searchButtonText: { color: colors.white, fontSize: 12, fontWeight: "600" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.15)" },
  menu: {
    position: "absolute",
    top: 90,
    right: 16,
    width: 220,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    overflow: "hidden",
  },
  menuItem: { paddingHorizontal: 16, paddingVertical: 12 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: "#EEF1F3" },
  menuItemText: { fontSize: 13, color: "#3A4652" },
});
