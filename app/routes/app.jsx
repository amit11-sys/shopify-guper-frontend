import { Outlet, useLoaderData, useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider } from "@shopify/shopify-app-react-router/react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  const mutation = `#graphql
    mutation {
      discountAutomaticAppCreate(
        automaticAppDiscount: {
          title: "Guper Cashback"
          functionHandle: "guper-discount"
          startsAt: "2024-01-01T00:00:00Z"
        }
      ) {
        automaticAppDiscount {
          discountId
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const res = await admin.graphql(mutation);
  const data = await res.json();

  console.log("🔥 DISCOUNT:", data);

  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};

export default function App() {
  const { apiKey } = useLoaderData();

  return (
    <AppProvider embedded apiKey={apiKey}>
      <s-app-nav>
        <s-link href="/app">🏠 Dashboard</s-link>
        <s-link href="/app/customers">👥 Customers</s-link>
        <s-link href="/app/settings">⚙️ Settings</s-link>
      </s-app-nav>
      <Outlet />
    </AppProvider>
  );
}

export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};