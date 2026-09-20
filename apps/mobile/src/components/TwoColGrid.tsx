import { StyleSheet, View } from "react-native";

/** Simple 2-column grid (React Native has no CSS grid) — chunks children into rows of 2. */
export default function TwoColGrid<T>({ items, renderItem, keyExtractor }: { items: T[]; renderItem: (item: T) => React.ReactNode; keyExtractor: (item: T) => string }) {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += 2) rows.push(items.slice(i, i + 2));

  return (
    <View style={styles.grid}>
      {rows.map((row, i) => (
        <View key={i} style={styles.row}>
          {row.map((item) => (
            <View key={keyExtractor(item)} style={styles.cell}>
              {renderItem(item)}
            </View>
          ))}
          {row.length === 1 && <View style={styles.cell} />}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { paddingHorizontal: 16, paddingBottom: 20, gap: 12 },
  row: { flexDirection: "row", gap: 12 },
  cell: { flex: 1 },
});
