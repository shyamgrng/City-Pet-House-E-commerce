"use client";

import { useMemo, useState } from "react";
import ProductFormModal from "@/components/admin/ProductFormModal";
import MediaSlot from "@/components/MediaSlot";
import { useBrand } from "@/context/BrandContext";
import { useCatalog } from "@/context/CatalogContext";
import { useCategory } from "@/context/CategoryContext";
import { useCourierAuth } from "@/context/CourierAuthContext";
import { useDeliverySettings } from "@/context/DeliverySettingsContext";
import { formatRs, salePrice, type Product } from "@/lib/catalog-types";

const subTabs = ["Overview", "Product", "Category Setting", "Brand Setting", "Delivery Setting", "Setting"];

const CHART_PALETTE = ["#1996C8", "#7A56C8", "#1F7A4D", "#C9962B", "#D64545", "#4F8FC0", "#B8860B"];

function stockStatus(p: Product) {
  if (p.status === "draft") return { label: "Draft", color: "#8A96A3" };
  if (p.outOfStock || p.qty === 0) return { label: "Out of Stock", color: "#D64545" };
  if (p.qty <= p.lowStockAlert) return { label: "Low Stock", color: "#C9962B" };
  return { label: "In Stock", color: "#1F7A4D" };
}

export default function ShopPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useCatalog();
  const { categories } = useCategory();
  const [tab, setTab] = useState("Overview");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const byCategory = useMemo(() => {
    const map = new Map<string, Product[]>();
    for (const p of products) {
      if (!map.has(p.category)) map.set(p.category, []);
      map.get(p.category)!.push(p);
    }
    return map;
  }, [products]);

  const trackedCategories = categories.filter((c) => byCategory.has(c));
  const colorForCategory = (cat: string) => CHART_PALETTE[categories.indexOf(cat) % CHART_PALETTE.length];

  const totalSkus = products.length;
  const totalUnits = products.reduce((s, p) => s + p.qty, 0);
  const lowStockCount = products.filter((p) => !p.outOfStock && p.qty > 0 && p.qty <= p.lowStockAlert).length;
  const outOfStockCount = products.filter((p) => p.outOfStock || p.qty === 0).length;

  const unitsByCategory = trackedCategories.map((cat) => ({
    label: cat,
    units: byCategory.get(cat)!.reduce((s, p) => s + p.qty, 0),
    color: colorForCategory(cat),
  }));
  const maxUnits = Math.max(1, ...unitsByCategory.map((u) => u.units));

  const totalTrackedUnits = unitsByCategory.reduce((s, u) => s + u.units, 0) || 1;
  const categoryShare = trackedCategories.map((cat) => ({
    label: cat,
    pct: Math.round((byCategory.get(cat)!.reduce((s, p) => s + p.qty, 0) / totalTrackedUnits) * 100),
    color: colorForCategory(cat),
  }));
  const gradientStops = categoryShare
    .reduce<{ start: number; stops: string[] }>(
      (acc, c) => {
        const end = acc.start + c.pct;
        acc.stops.push(`${c.color} ${acc.start}% ${end}%`);
        return { start: end, stops: acc.stops };
      },
      { start: 0, stops: [] }
    )
    .stops.join(", ");

  const lowStockAndOut = products
    .filter((p) => p.outOfStock || p.qty === 0 || p.qty <= p.lowStockAlert)
    .map((p) => ({ name: p.name, status: p.outOfStock || p.qty === 0 ? "Out of stock" : `${p.qty} left`, level: p.outOfStock || p.qty === 0 ? "out" : "low" }));

  const filteredProducts = products.filter((p) => {
    if (categoryFilter !== "All" && p.category !== categoryFilter) return false;
    if (search.trim() && !p.name.toLowerCase().includes(search.trim().toLowerCase())) return false;
    return true;
  });

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (p: Product) => {
    setEditing(p);
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);
  const handleSave = (draft: Omit<Product, "id">) => {
    if (editing) updateProduct(editing.id, draft);
    else addProduct(draft);
    setModalOpen(false);
  };

  return (
    <div>
      <div className="flex gap-2 mb-5 flex-wrap">
        {subTabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
            style={{ background: tab === t ? "#1996C8" : "#fff", color: tab === t ? "#fff" : "#3A4652", border: tab === t ? "none" : "1px solid #E4E9EC" }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Category Setting" && <CategorySettingTab />}
      {tab === "Brand Setting" && <BrandSettingTab />}
      {tab === "Delivery Setting" && <DeliverySettingTab />}

      {tab !== "Overview" && tab !== "Product" && tab !== "Category Setting" && tab !== "Brand Setting" && tab !== "Delivery Setting" && (
        <div className="bg-white border border-dashed border-[#E4E9EC] rounded-[10px] p-8 text-center text-xs text-[#8A96A3]">
          {tab} — coming soon
        </div>
      )}

      {tab === "Product" && (
        <>
          <div className="flex justify-between items-center mb-[18px]">
            <div className="font-heading font-bold text-[19px] text-[#1A2027]">Catalog</div>
            <button onClick={openAdd} className="bg-primary text-white text-xs font-semibold px-4 py-2.5 rounded-lg cursor-pointer whitespace-nowrap">
              + Add Product
            </button>
          </div>

          <div className="flex gap-2.5 mb-4 flex-wrap">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="flex-1 min-w-[220px] border border-[#E4E9EC] rounded-lg px-3.5 py-2.5 text-[13px]"
            />
            {["All", ...categories].map((c) => (
              <button
                key={c}
                onClick={() => setCategoryFilter(c)}
                className="px-4 py-2 rounded-full text-xs font-semibold cursor-pointer whitespace-nowrap"
                style={{ background: categoryFilter === c ? "#1996C8" : "#F0F2F4", color: categoryFilter === c ? "#fff" : "#5B6773" }}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden">
            <div className="grid grid-cols-[88px_1.6fr_1fr_0.8fr_1fr_0.9fr_0.9fr] px-4 py-2.5 text-[11px] font-bold text-[#8A96A3] uppercase border-b border-[#E4E9EC]">
              <div />
              <div>Product</div>
              <div>Category</div>
              <div>Qty</div>
              <div>Price</div>
              <div>Status</div>
              <div>Actions</div>
            </div>
            {filteredProducts.length === 0 ? (
              <div className="px-4 py-6 text-xs text-[#8A96A3] text-center">No products match.</div>
            ) : (
              filteredProducts.map((p) => {
                const status = stockStatus(p);
                return (
                  <div key={p.id} className="grid grid-cols-[88px_1.6fr_1fr_0.8fr_1fr_0.9fr_0.9fr] px-4 py-2.5 text-xs items-center border-b border-[#F0F2F4] last:border-0">
                    <MediaSlot src={p.photo} label="product photo" className="w-[72px] h-[72px] rounded-lg" />
                    <div>
                      <div className="font-semibold text-[#1A2027]">{p.name}</div>
                      {(p.sizes.length > 0 || p.colours.length > 0) && (
                        <div className="text-[11px] text-[#8A96A3] mt-0.5">{[...p.sizes, ...p.colours].join(", ")}</div>
                      )}
                      {p.suppliedBy && <div className="text-[11px] text-[#7A56C8] mt-0.5">Supplied by {p.suppliedBy}</div>}
                    </div>
                    <div className="text-[#5B6773]">{p.category}</div>
                    <div className="font-semibold" style={{ color: p.qty <= p.lowStockAlert ? "#C9962B" : "#1A2027" }}>
                      {p.qty}
                    </div>
                    <div>
                      <div className="font-semibold">{formatRs(p.price)}</div>
                      {p.hotSale && (
                        <div className="text-[10px] text-[#D64545] font-bold mt-0.5">
                          🔥 -{p.hotDiscount}% · now {formatRs(salePrice(p))}
                        </div>
                      )}
                      {p.costPrice > 0 && (
                        <div className="text-[10px] text-[#8A96A3] mt-0.5">
                          Cost {formatRs(p.costPrice)} ·{" "}
                          <span style={{ color: p.price - p.costPrice >= 0 ? "#1F7A4D" : "#D64545" }}>{formatRs(p.price - p.costPrice)} profit</span>
                        </div>
                      )}
                    </div>
                    <div className="text-[11px] font-semibold" style={{ color: status.color }}>
                      {status.label}
                    </div>
                    <div className="flex gap-2.5 text-[11px] font-semibold">
                      <span onClick={() => openEdit(p)} className="text-primary cursor-pointer">
                        Edit
                      </span>
                      <span onClick={() => deleteProduct(p.id)} className="text-[#D64545] cursor-pointer">
                        Delete
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {tab === "Overview" && (
        <>
          <div className="font-heading font-bold text-[19px] text-[#1A2027] mb-4">Stock Dashboard</div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-4">
            <StatCard label="Total SKUs" value={totalSkus} />
            <StatCard label="Total Units in Stock" value={totalUnits} color="#1996C8" />
            <StatCard label="Low Stock Items" value={lowStockCount} color="#C9962B" />
            <StatCard label="Out of Stock" value={outOfStockCount} color="#D64545" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-3.5 mb-4">
            <div className="bg-white border border-[#E4E9EC] rounded-[10px] p-5">
              <div className="text-[13px] font-bold text-[#1A2027] mb-4">Units in Stock by Category</div>
              {unitsByCategory.map((c) => (
                <div key={c.label} className="mb-3.5 last:mb-0">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-[#1A2027]">{c.label}</span>
                    <span className="text-[#5B6773]">{c.units} units</span>
                  </div>
                  <div className="h-1.5 bg-[#EEF1F3] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(c.units / maxUnits) * 100}%`, background: c.color }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white border border-[#E4E9EC] rounded-[10px] p-5">
              <div className="text-[13px] font-bold text-[#1A2027] mb-4">Category Share</div>
              <div className="w-36 h-36 rounded-full mx-auto mb-4" style={{ background: `conic-gradient(${gradientStops})` }} />
              {categoryShare.map((c) => (
                <div key={c.label} className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                    <span className="text-[#3A4652]">{c.label}</span>
                  </div>
                  <span className="font-semibold">{c.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-[#E4E9EC] rounded-[10px] p-5 mb-4">
            <div className="text-[13px] font-bold text-[#1A2027]">Low Stock &amp; Out of Stock</div>
            <div className="text-[11px] text-[#8A96A3] mb-3">Items at or below their reorder threshold</div>
            {lowStockAndOut.length === 0 ? (
              <div className="text-xs text-[#8A96A3] py-2">Nothing low or out of stock right now.</div>
            ) : (
              lowStockAndOut.map((it) => (
                <div key={it.name} className="flex justify-between py-2 border-b border-[#F0F2F4] text-xs last:border-0">
                  <span className="font-semibold text-[#1A2027]">{it.name}</span>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={it.level === "out" ? { background: "#FCEAEA", color: "#D64545" } : { background: "#FBF1DD", color: "#C9962B" }}
                  >
                    {it.status}
                  </span>
                </div>
              ))
            )}
          </div>

          {trackedCategories.map((cat) => {
            const items = byCategory.get(cat)!;
            return (
              <div key={cat} className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-[13px] font-bold text-[#1A2027]">
                    {cat} ({items.length})
                  </div>
                  <button
                    onClick={openAdd}
                    className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm cursor-pointer"
                  >
                    +
                  </button>
                </div>
                <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden">
                  {items.map((p) => {
                    const status = stockStatus(p);
                    return (
                      <div key={p.id} className="grid grid-cols-3 px-4 py-3 text-xs items-center border-b border-[#F0F2F4] last:border-0">
                        <div className="font-medium text-[#1A2027]">{p.name}</div>
                        <div className="text-[#5B6773]">{p.qty}</div>
                        <div className="font-semibold" style={{ color: status.color }}>
                          {status.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </>
      )}

      {modalOpen && <ProductFormModal initial={editing} onClose={closeModal} onSave={handleSave} />}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="bg-white border border-[#E4E9EC] rounded-[10px] p-4">
      <div className="text-[11px] text-[#8A96A3] font-semibold mb-2">{label}</div>
      <div className="font-heading font-bold text-xl" style={{ color: color || "#1A2027" }}>
        {value}
      </div>
    </div>
  );
}

function CategorySettingTab() {
  const { categories, addCategory, renameCategory, removeCategory } = useCategory();
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [newName, setNewName] = useState("");

  const startEdit = (name: string) => {
    setEditingName(name);
    setEditValue(name);
  };
  const saveEdit = () => {
    if (editingName) renameCategory(editingName, editValue);
    setEditingName(null);
  };

  return (
    <div className="max-w-[520px]">
      <div className="font-heading font-bold text-[19px] text-[#1A2027] mb-1.5">Category Setting</div>
      <div className="text-[13px] text-[#5B6773] mb-[18px]">Manage the categories available when adding products.</div>

      <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden mb-4">
        {categories.map((c) =>
          editingName === c ? (
            <div key={c} className="flex items-center gap-2.5 px-4 py-2.5 border-b border-[#F0F2F4] last:border-0">
              <input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                autoFocus
                className="flex-1 px-3 py-2.5 rounded-lg border border-primary text-[13px] box-border"
              />
              <button onClick={saveEdit} className="text-[11px] font-semibold text-[#1F7A4D] cursor-pointer whitespace-nowrap">
                Save
              </button>
              <button onClick={() => setEditingName(null)} className="text-[11px] font-semibold text-[#8A96A3] cursor-pointer whitespace-nowrap">
                Cancel
              </button>
            </div>
          ) : (
            <div key={c} className="flex justify-between items-center px-4 py-3.5 border-b border-[#F0F2F4] last:border-0">
              <div className="text-[13px] font-semibold text-[#1A2027]">{c}</div>
              <div className="flex gap-3.5">
                <button onClick={() => startEdit(c)} className="text-[11px] font-semibold text-primary cursor-pointer">
                  Edit
                </button>
                <button onClick={() => removeCategory(c)} className="text-[11px] font-semibold text-[#D64545] cursor-pointer">
                  Remove
                </button>
              </div>
            </div>
          )
        )}
      </div>

      <div className="flex gap-2.5">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New category name"
          className="flex-1 px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] box-border"
        />
        <button
          onClick={() => {
            addCategory(newName);
            setNewName("");
          }}
          className="bg-primary text-white px-[18px] py-2.5 rounded-lg text-[13px] font-semibold cursor-pointer"
        >
          Add
        </button>
      </div>
    </div>
  );
}

function BrandSettingTab() {
  const { brands, addBrand, removeBrand } = useBrand();
  const [newName, setNewName] = useState("");

  return (
    <div className="max-w-[520px]">
      <div className="font-heading font-bold text-[19px] text-[#1A2027] mb-1.5">Brand Setting</div>
      <div className="text-[13px] text-[#5B6773] mb-[18px]">
        Manage the brands available when adding products — new brands appear automatically in Shop by Brand on the homepage.
      </div>

      <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden mb-4">
        {brands.map((b) => (
          <div key={b} className="flex justify-between items-center px-4 py-3.5 border-b border-[#F0F2F4] last:border-0">
            <div className="text-[13px] font-semibold text-[#1A2027]">{b}</div>
            <button onClick={() => removeBrand(b)} className="text-[11px] font-semibold text-[#D64545] cursor-pointer">
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2.5">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New brand name"
          className="flex-1 px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] box-border"
        />
        <button
          onClick={() => {
            addBrand(newName);
            setNewName("");
          }}
          className="bg-primary text-white px-[18px] py-2.5 rounded-lg text-[13px] font-semibold cursor-pointer"
        >
          Add
        </button>
      </div>
    </div>
  );
}

const emptyCourierForm = {
  companyName: "",
  phone: "",
  address: "",
  priceSmall: "",
  priceMedium: "",
  priceLarge: "",
  priceVeryLarge: "",
  usesDistancePricing: false,
  ratePerKg: "",
  ratePerKm: "",
  defaultFlatPrice: "",
};

function DeliverySettingTab() {
  const { standardFee, puppyFee, setFees } = useDeliverySettings();
  const { accounts, addCourier, removeCourier } = useCourierAuth();
  const [standardInput, setStandardInput] = useState(String(standardFee));
  const [puppyInput, setPuppyInput] = useState(String(puppyFee));
  const [feesSaved, setFeesSaved] = useState(false);

  const [form, setForm] = useState(emptyCourierForm);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<{ courierId: string; password: string } | null>(null);
  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  const saveFees = () => {
    setFees(Number(standardInput) || 0, Number(puppyInput) || 0);
    setFeesSaved(true);
    setTimeout(() => setFeesSaved(false), 3000);
  };

  const submitCourier = () => {
    if (!form.companyName.trim() || !form.phone.trim()) {
      setError("Please fill in company name and phone number.");
      return;
    }
    const result = addCourier({
      companyName: form.companyName.trim(),
      phone: form.phone.trim(),
      altPhone: "",
      address: form.address.trim(),
      priceSmall: Number(form.priceSmall) || 0,
      priceMedium: Number(form.priceMedium) || 0,
      priceLarge: Number(form.priceLarge) || 0,
      priceVeryLarge: Number(form.priceVeryLarge) || 0,
      usesDistancePricing: form.usesDistancePricing,
      ratePerKg: Number(form.ratePerKg) || 0,
      ratePerKm: Number(form.ratePerKm) || 0,
      defaultFlatPrice: Number(form.defaultFlatPrice) || 0,
    });
    setForm(emptyCourierForm);
    setError("");
    setCreated(result);
  };

  return (
    <div className="max-w-[560px]">
      <div className="font-heading font-bold text-[19px] text-[#1A2027] mb-1.5">Delivery Setting</div>
      <div className="text-[13px] text-[#5B6773] mb-[18px]">Default delivery fee and rules applied at checkout.</div>

      <div className="bg-white border border-[#E4E9EC] rounded-[10px] p-5 mb-4">
        <div className="text-xs font-semibold text-[#3A4652] mb-1.5">Standard Delivery Fee (Rs.)</div>
        <input
          type="number"
          value={standardInput}
          onChange={(e) => {
            setStandardInput(e.target.value);
            setFeesSaved(false);
          }}
          className="w-full px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] mb-4 box-border"
        />
        <div className="text-xs font-semibold text-[#3A4652] mb-1.5">Puppy Delivery Fee (Rs.)</div>
        <input
          type="number"
          value={puppyInput}
          onChange={(e) => {
            setPuppyInput(e.target.value);
            setFeesSaved(false);
          }}
          className="w-full px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] box-border"
        />
      </div>
      <button onClick={saveFees} className="w-full bg-primary text-white text-center py-3 rounded-lg text-sm font-semibold cursor-pointer mb-2">
        Save
      </button>
      {feesSaved && <div className="text-[11px] text-[#1F7A4D] mb-4">✓ Delivery fees saved</div>}

      <div className="font-heading font-bold text-[15px] text-[#1A2027] mt-8 mb-1">Courier Suppliers</div>
      <div className="text-[13px] text-[#5B6773] mb-3.5">Rates per parcel size, with an optional default/distance-based price.</div>

      <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-x-auto mb-4">
        <div className="grid grid-cols-[1.4fr_1.2fr_1.1fr_0.7fr_0.7fr_0.7fr_0.7fr_0.7fr] gap-2 px-4 py-2.5 text-[11px] font-bold text-[#8A96A3] uppercase border-b border-[#E4E9EC] min-w-[640px]">
          <div>Company</div>
          <div>Address</div>
          <div>Phone</div>
          <div>Small</div>
          <div>Medium</div>
          <div>Large</div>
          <div>V.Large</div>
          <div></div>
        </div>
        {accounts.length === 0 ? (
          <div className="px-4 py-5 text-xs text-[#8A96A3] text-center">No courier suppliers yet</div>
        ) : (
          accounts.map((co) => (
            <div
              key={co.courierId}
              className="grid grid-cols-[1.4fr_1.2fr_1.1fr_0.7fr_0.7fr_0.7fr_0.7fr_0.7fr] gap-2 px-4 py-3 text-xs items-center border-b border-[#F0F2F4] last:border-0 min-w-[640px]"
            >
              <div className="font-semibold text-[#1A2027]">{co.companyName}</div>
              <div className="text-[#5B6773]">{co.address || "—"}</div>
              <div className="text-[#5B6773]">{co.phone}</div>
              <div>Rs.{co.priceSmall}</div>
              <div>Rs.{co.priceMedium}</div>
              <div>Rs.{co.priceLarge}</div>
              <div>Rs.{co.priceVeryLarge}</div>
              <button onClick={() => removeCourier(co.courierId)} className="text-[#D64545] font-semibold cursor-pointer text-left">
                Remove
              </button>
            </div>
          ))
        )}
      </div>

      <div className="bg-white border border-[#E4E9EC] rounded-[10px] p-5">
        <div className="text-[13px] font-bold text-[#1A2027] mb-3.5">Add Courier Supplier</div>

        <div className="grid grid-cols-2 gap-2.5 mb-3">
          <div>
            <div className="text-xs font-semibold text-[#3A4652] mb-1.5">Company Name *</div>
            <input
              value={form.companyName}
              onChange={(e) => set({ companyName: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] box-border"
            />
          </div>
          <div>
            <div className="text-xs font-semibold text-[#3A4652] mb-1.5">Phone Number *</div>
            <input
              value={form.phone}
              onChange={(e) => set({ phone: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] box-border"
            />
          </div>
        </div>

        <div className="text-xs font-semibold text-[#3A4652] mb-1.5">Address</div>
        <input
          value={form.address}
          onChange={(e) => set({ address: e.target.value })}
          className="w-full px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] mb-3 box-border"
        />

        <div className="text-xs font-semibold text-[#3A4652] mb-1.5">Price by Parcel Size (Rs.)</div>
        <div className="grid grid-cols-4 gap-2 mb-3">
          <SizeField label="Small" value={form.priceSmall} onChange={(v) => set({ priceSmall: v })} />
          <SizeField label="Medium" value={form.priceMedium} onChange={(v) => set({ priceMedium: v })} />
          <SizeField label="Large" value={form.priceLarge} onChange={(v) => set({ priceLarge: v })} />
          <SizeField label="Very Large" value={form.priceVeryLarge} onChange={(v) => set({ priceVeryLarge: v })} />
        </div>

        <div
          onClick={() => set({ usesDistancePricing: !form.usesDistancePricing })}
          className="flex items-center justify-between cursor-pointer mb-3"
        >
          <div className="text-[13px] font-semibold text-[#1A2027]">Also price by weight/distance (else use a flat default price)</div>
          <div
            className="w-[38px] h-[22px] rounded-full relative shrink-0 transition-colors"
            style={{ background: form.usesDistancePricing ? "#25D366" : "#D8DCE0" }}
          >
            <span
              className="absolute top-0.5 w-[18px] h-[18px] bg-white rounded-full transition-all"
              style={{ left: form.usesDistancePricing ? "18px" : "2px" }}
            />
          </div>
        </div>

        {form.usesDistancePricing ? (
          <div className="grid grid-cols-2 gap-2.5 mb-3">
            <div>
              <div className="text-xs font-semibold text-[#3A4652] mb-1.5">Rate per Kg (Rs.)</div>
              <input
                type="number"
                value={form.ratePerKg}
                onChange={(e) => set({ ratePerKg: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] box-border"
              />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#3A4652] mb-1.5">Rate per Km (Rs.)</div>
              <input
                type="number"
                value={form.ratePerKm}
                onChange={(e) => set({ ratePerKm: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] box-border"
              />
            </div>
          </div>
        ) : (
          <div className="mb-3">
            <div className="text-xs font-semibold text-[#3A4652] mb-1.5">Default Flat Price (Rs.)</div>
            <input
              type="number"
              value={form.defaultFlatPrice}
              onChange={(e) => set({ defaultFlatPrice: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] box-border"
            />
          </div>
        )}

        {error && <div className="text-xs text-[#D64545] mb-2.5">{error}</div>}
        <button onClick={submitCourier} className="w-full bg-primary text-white text-center py-2.5 rounded-lg text-[13px] font-semibold cursor-pointer">
          + Add Courier Supplier
        </button>

        {created && (
          <div className="mt-3.5 bg-[#EAF4F9] border border-[#CFE6F1] rounded-lg p-3.5 text-xs">
            <div className="font-bold text-[#146A8C] mb-1">Courier account created — share these login details:</div>
            <div className="text-[#3A4652]">
              Courier ID: <strong>{created.courierId}</strong> · Password: <strong>{created.password}</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SizeField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <div className="text-[10px] font-semibold text-[#8A96A3] mb-1">{label}</div>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2 py-2 rounded-lg border border-[#E4E9EC] text-[13px] box-border"
      />
    </div>
  );
}
