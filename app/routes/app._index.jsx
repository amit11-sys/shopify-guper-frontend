import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";

const GUPER_API = "http://31.97.202.45:5000";


export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;


  const settings = await db.guperSettings.findUnique({ where: { shop } });

  if (!settings?.isActive) {
    return {
      shop,
      connected: false,
      stats: null,
      status: null,
      customers: [],
      account: null,
      fetchError: false,
    };
  }

  try {
    const [statsRes, statusRes, customersRes] = await Promise.all([
      fetch(`${GUPER_API}/api/merchant/stats/${shop}`),
      fetch(`${GUPER_API}/api/merchant/status/${shop}`),
      fetch(`${GUPER_API}/api/merchant/customers/${shop}`),
    ]);

    const statsJson = await statsRes.json();
    const statusJson = await statusRes.json();
    const customersJson = await customersRes.json();

    return {
      shop,
      connected: true,
      account: settings.account,
      stats: statsJson.success ? statsJson.data : null,
      status: statusJson.success ? statusJson.data : null,
      customers: customersJson.success ? customersJson.data?.customers || [] : [],
      fetchError: false,
    };
  } catch (error) {
    console.error("Dashboard fetch error:", error);

    return {
      shop,
      connected: true,
      account: settings.account,
      stats: null,
      status: null,
      customers: [],
      fetchError: true,
    };
  }
};

export default function Dashboard() {
  const { shop, connected, account, stats, customers, fetchError } = useLoaderData();

  // ─── Not connected ───────────────────────────────────────────────────────────
  if (!connected) {
    return (
      <s-page heading="🎁 Guper Loyalty Dashboard">
        <div style={styles.notConnectedWrap}>
          <div style={styles.notConnectedCard}>
            <div style={styles.notConnectedIcon}>🔌</div>
            <h2 style={styles.notConnectedTitle}>GUPER Account Not Connected</h2>
            <p style={styles.notConnectedText}>
              Please enter your GUPER API credentials to activate the loyalty program.
            </p>
            <a href="/app/settings" style={styles.connectBtn}>
              ⚙️ Settings — Connect GUPER Account
            </a>
          </div>
        </div>
      </s-page>
    );
  }

  // ─── Fetch error ─────────────────────────────────────────────────────────────
  if (fetchError) {
    return (
      <s-page heading="🎁 Guper Loyalty Dashboard">
        <div style={styles.errorBanner}>
          ⚠️ Failed to load data from GUPER server. Please try again later.
        </div>
      </s-page>
    );
  }

  // ─── Stats ───────────────────────────────────────────────────────────────────
  const totalMembers = stats?.totalCustomers ?? "—";
  const totalPoints = stats?.totalPointsAwarded ?? "—";
  const totalRedemptions = stats?.totalRedemptions ?? "—";
  const totalOrders = stats?.totalOrders ?? "—";

  return (
    <s-page heading="🎁 Guper Loyalty Dashboard">
      {/* ── Connection Status Bar ── */}
      <div style={styles.statusBar}>
        <span style={styles.statusDot}>●</span>
        <span style={styles.statusText}>
          Connected to GUPER &nbsp;·&nbsp; Account: <strong>{account}</strong> &nbsp;·&nbsp; Store: {shop}
        </span>
        <a href="/app/settings" style={styles.settingsLink}>⚙️ Settings</a>
      </div>

      {/* ── Stats Cards ── */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>👥</div>
          <div style={styles.statValue}>{totalMembers}</div>
          <div style={styles.statLabel}>Total Members</div>
          <div style={styles.statSub}>Customers enrolled in the loyalty program</div>
        </div>

        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: "#008060" }}>{totalPoints}</div>
          <div style={styles.statLabel}>Total Points Awarded</div>
          <div style={styles.statSub}>Total points awarded so far</div>
        </div>

        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: "#8B5CF6" }}>{totalRedemptions}</div>
          <div style={styles.statLabel}>Total Redemptions</div>
          <div style={styles.statSub}>Total point redemption transactions</div>
        </div>

        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: "#F59E0B" }}>{totalOrders}</div>
          <div style={styles.statLabel}>Total Orders</div>
          <div style={styles.statSub}>Total orders earning points</div>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div style={styles.actionsCard}>
        <h2 style={styles.actionsTitle}>⚡ Quick Actions</h2>
        <div style={styles.actionsGrid}>
          <a href="/app/customers" style={styles.actionBtn}>
            <span style={styles.actionBtnIcon}>👥</span>
            <span>View Customers</span>
          </a>
          <a href="/app/settings" style={styles.actionBtn}>
            <span style={styles.actionBtnIcon}>⚙️</span>
            <span>Settings / API Keys</span>
          </a>
        </div>
      </div>

      {/* ── Recent Customers ── */}
      <div style={styles.customersCard}>
        <h2 style={styles.actionsTitle}>👥 Recent Customers</h2>

        {customers?.length > 0 ? (
          <div style={styles.customerList}>
            {customers.slice(0, 5).map((customer) => (
              <div key={customer.id} style={styles.customerItem}>
                <div>
                  <div style={styles.customerName}>
                    {customer.customerName || "Customer"}
                  </div>
                  <div style={styles.customerMeta}>
                    {customer.customerEmail || customer.identifierValue}
                  </div>
                </div>
                <div style={styles.customerMeta}>
                  Guper ID: {customer.guperCustomerId}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.emptyText}>No customers connected yet.</div>
        )}
      </div>

      {/* ── How It Works ── */}
      <div style={styles.howCard}>
        <h2 style={styles.actionsTitle}>📖 How This App Works</h2>
        <div style={styles.stepsList}>
          {[
            { icon: "1️⃣", text: "New customer signs up → automatically registered in GUPER" },
            { icon: "2️⃣", text: "Customer places an order and pays → loyalty points awarded instantly" },
            { icon: "3️⃣", text: "Customer can view their points balance on the checkout page" },
            { icon: "4️⃣", text: "When an order is refunded → points are automatically adjusted" },
          ].map((step, i) => (
            <div key={i} style={styles.stepItem}>
              <span style={styles.stepIcon}>{step.icon}</span>
              <span style={styles.stepText}>{step.text}</span>
            </div>
          ))}
        </div>
      </div>
    </s-page>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = {
  notConnectedWrap: { display: "flex", justifyContent: "center", padding: "60px 20px" },
  notConnectedCard: {
    background: "#fff",
    border: "1px solid #e0e0e0",
    borderRadius: "16px",
    padding: "48px 40px",
    textAlign: "center",
    maxWidth: "480px",
  },
  notConnectedIcon: { fontSize: "56px", marginBottom: "16px" },
  notConnectedTitle: { fontSize: "22px", fontWeight: "700", color: "#1a1a1a", marginBottom: "12px" },
  notConnectedText: { color: "#666", fontSize: "15px", marginBottom: "28px", lineHeight: "1.5" },
  connectBtn: {
    display: "inline-block",
    background: "#008060",
    color: "#fff",
    padding: "14px 28px",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "600",
    textDecoration: "none",
  },

  errorBanner: {
    background: "#fff3cd",
    border: "1px solid #ffc107",
    color: "#856404",
    padding: "16px 20px",
    borderRadius: "10px",
    margin: "20px 0",
    fontSize: "14px",
  },

  statusBar: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "#d4edda",
    border: "1px solid #b8dac7",
    borderRadius: "10px",
    padding: "12px 18px",
    marginBottom: "24px",
    fontSize: "14px",
    color: "#155724",
  },
  statusDot: { color: "#28a745", fontSize: "12px" },
  statusText: { flex: 1 },
  settingsLink: {
    color: "#008060",
    fontWeight: "600",
    textDecoration: "none",
    fontSize: "13px",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },
  statCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "24px 20px",
    textAlign: "center",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  statValue: { fontSize: "36px", fontWeight: "800", color: "#1a1a1a", marginBottom: "4px" },
  statLabel: { fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "4px" },
  statSub: { fontSize: "12px", color: "#9ca3af" },

  actionsCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "24px",
    marginBottom: "20px",
  },
  actionsTitle: { fontSize: "17px", fontWeight: "700", color: "#1a1a1a", marginBottom: "16px" },
  actionsGrid: { display: "flex", gap: "12px", flexWrap: "wrap" },
  actionBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#f3f4f6",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "12px 20px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
    textDecoration: "none",
    cursor: "pointer",
  },
  actionBtnIcon: { fontSize: "18px" },

  customersCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "24px",
    marginBottom: "20px",
  },
  customerList: { display: "flex", flexDirection: "column", gap: "12px" },
  customerItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 16px",
    background: "#f9fafb",
    borderRadius: "10px",
    border: "1px solid #f1f5f9",
  },
  customerName: { fontSize: "14px", fontWeight: "700", color: "#111827" },
  customerMeta: { fontSize: "13px", color: "#6b7280" },
  emptyText: { fontSize: "14px", color: "#6b7280" },

  howCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "24px",
    marginBottom: "20px",
  },
  stepsList: { display: "flex", flexDirection: "column", gap: "12px" },
  stepItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "12px",
    background: "#f9fafb",
    borderRadius: "8px",
  },
  stepIcon: { fontSize: "20px", flexShrink: 0 },
  stepText: { fontSize: "14px", color: "#374151", lineHeight: "1.5" },
};