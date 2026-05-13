import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";

const GUPER_API = process.env.GUPER_BACKEND_URL;

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const settings = await db.guperSettings.findUnique({ where: { shop } });

  if (!settings?.isActive) {
    return { shop, connected: false, customers: [], totalCustomers: 0 };
  }

  try {
    const res = await fetch(`${GUPER_API}/merchant/customers/${shop}`);
    const json = await res.json();

    const customers = json.success ? (json.data?.customers || []) : [];
    const totalCustomers = json.success ? (json.data?.totalCustomers || 0) : 0;

    return {
      shop,
      connected: true,
      customers,
      totalCustomers,
      fetchError: !json.success,
    };
  } catch (error) {
    console.error("Customers fetch error:", error);
    return {
      shop,
      connected: true,
      customers: [],
      totalCustomers: 0,
      fetchError: true,
    };
  }
};

export default function Customers() {
  const { connected, customers, totalCustomers, fetchError } = useLoaderData();

  // ─── Not connected ───────────────────────────────────────────────
  if (!connected) {
    return (
      <s-page heading="👥 Loyalty Customers">
        <div style={styles.emptyCard}>
          <div style={styles.emptyIcon}>🔌</div>
          <h2 style={styles.emptyTitle}>GUPER Account Not Connected</h2>
          <p style={styles.emptyText}>
            Please connect your GUPER account first.
          </p>
          <a href="/app/settings" style={styles.connectBtn}>
            ⚙️ Settings — Connect GUPER
          </a>
        </div>
      </s-page>
    );
  }

  // ─── Fetch error ─────────────────────────────────────────────────
  if (fetchError) {
    return (
      <s-page heading="👥 Loyalty Customers">
        <div style={styles.errorBanner}>
          ⚠️ Failed to load customers from GUPER server. Please try again later.
        </div>
      </s-page>
    );
  }

  // ─── No customers ─────────────────────────────────────────────────
  if (!customers || customers.length === 0) {
    return (
      <s-page heading="👥 Loyalty Customers">
        <div style={styles.emptyCard}>
          <div style={styles.emptyIcon}>🧑‍🤝‍🧑</div>
          <h2 style={styles.emptyTitle}>No Customers Yet</h2>
          <p style={styles.emptyText}>
            When customers sign up on your store,
            they will automatically appear here.
          </p>
        </div>
      </s-page>
    );
  }

  // ─── Customers Table ──────────────────────────────────────────────
  return (
    <s-page heading="👥 Loyalty Customers">

      {/* ── Summary Bar ── */}
      <div style={styles.summaryBar}>
        <span>
          📊 Total Enrolled Customers: <strong>{totalCustomers}</strong>
        </span>
      </div>

      {/* ── Table ── */}
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>#</th>
              <th style={styles.th}>Customer Name</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Phone</th>
              <th style={styles.th}>Guper ID</th>
              <th style={styles.th}>Identifier</th>
              <th style={styles.th}>Joined</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c, i) => (
              <tr
                key={c.id || i}
                style={i % 2 === 0 ? styles.trEven : styles.trOdd}
              >
                {/* # */}
                <td style={styles.td}>{i + 1}</td>

                {/* Name */}
                <td style={styles.td}>
                  <div style={styles.nameCell}>
                    <div style={styles.avatar}>
                      {(c.customerName || "?")[0].toUpperCase()}
                    </div>
                    <span>{c.customerName || "—"}</span>
                  </div>
                </td>

                {/* Email */}
                <td style={styles.td}>
                  {c.customerEmail || c.identifierValue || "—"}
                </td>

                {/* Phone */}
                <td style={styles.td}>
                  {c.customerPhone || "—"}
                </td>

                {/* Guper ID */}
                <td style={styles.td}>
                  <span style={styles.guperIdBadge}>
                    #{c.guperCustomerId || "—"}
                  </span>
                </td>

                {/* Identifier Type */}
                <td style={styles.td}>
                  <span style={styles.identifierBadge}>
                    {c.identifierType || "—"}
                  </span>
                </td>

                {/* Joined Date */}
                <td style={styles.td}>
                  {c.createdAt
                    ? new Date(c.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </s-page>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = {
  // Empty / Error states
  emptyCard: {
    background: "#fff",
    border: "1px solid #e0e0e0",
    borderRadius: "16px",
    padding: "60px 40px",
    textAlign: "center",
    maxWidth: "480px",
    margin: "40px auto",
  },
  emptyIcon: { fontSize: "52px", marginBottom: "16px" },
  emptyTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: "10px",
  },
  emptyText: {
    color: "#666",
    fontSize: "14px",
    marginBottom: "24px",
    lineHeight: "1.6",
  },
  connectBtn: {
    display: "inline-block",
    background: "#008060",
    color: "#fff",
    padding: "12px 24px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    textDecoration: "none",
  },
  errorBanner: {
    background: "#fff3cd",
    border: "1px solid #ffc107",
    color: "#856404",
    padding: "14px 18px",
    borderRadius: "8px",
    fontSize: "14px",
  },

  // Summary bar
  summaryBar: {
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: "10px",
    padding: "12px 18px",
    marginBottom: "18px",
    fontSize: "14px",
    color: "#15803d",
  },

  // Table
  tableWrap: {
    overflowX: "auto",
    borderRadius: "14px",
    border: "1px solid #e5e7eb",
    background: "#fff",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  },
  thead: { background: "#f9fafb" },
  th: {
    padding: "14px 16px",
    textAlign: "left",
    fontWeight: "600",
    color: "#374151",
    borderBottom: "1px solid #e5e7eb",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "12px 16px",
    color: "#374151",
    borderBottom: "1px solid #f3f4f6",
    verticalAlign: "middle",
  },
  trEven: { background: "#fff" },
  trOdd: { background: "#fafafa" },

  // Cells
  nameCell: { display: "flex", alignItems: "center", gap: "10px" },
  avatar: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    background: "#dbeafe",
    color: "#1d4ed8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "14px",
    flexShrink: 0,
  },
  guperIdBadge: {
    background: "#ede9fe",
    color: "#6d28d9",
    padding: "4px 10px",
    borderRadius: "20px",
    fontWeight: "600",
    fontSize: "13px",
  },
  identifierBadge: {
    background: "#dbeafe",
    color: "#1d4ed8",
    padding: "4px 10px",
    borderRadius: "20px",
    fontWeight: "600",
    fontSize: "13px",
  },
};