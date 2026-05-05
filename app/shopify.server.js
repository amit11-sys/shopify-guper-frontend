import "@shopify/shopify-app-react-router/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
} from "@shopify/shopify-app-react-router/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.October25,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  hooks: {
    afterAuth: async ({ session, admin }) => {
      try {
        // ✅ Check if discount already exists
        const existingRes = await admin.graphql(`
          query {
            discountNodes(first: 10, query: "title:'Guper Cashback'") {
              nodes {
                id
                discount {
                  __typename
                  ... on DiscountAutomaticApp {
                    title
                    status
                    discountClasses
                  }
                }
              }
            }
          }
        `);

        const existingData = await existingRes.json();
        const existingNodes = existingData?.data?.discountNodes?.nodes;
        console.log("🔍 Existing discounts:", JSON.stringify(existingNodes, null, 2));

        if (existingNodes?.length > 0) {
          console.log("⏭️ Discount already exists, skipping creation");
        } else {
          // ✅ Create discount only if not exists
          const response = await admin.graphql(`
            mutation {
              discountAutomaticAppCreate(
                automaticAppDiscount: {
                  title: "Guper Cashback"
                  functionHandle: "guper-order-discount"
                  startsAt: "${new Date().toISOString()}"
                  combinesWith: {
                    orderDiscounts: true
                    productDiscounts: true
                    shippingDiscounts: true
                  }
                  discountClasses: [ORDER]
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
          `);

          const data = await response.json();
          console.log("====================================");
          console.log("🔥 FULL RESPONSE:", JSON.stringify(data, null, 2));

          const discount = data?.data?.discountAutomaticAppCreate?.automaticAppDiscount;
          const userErrors = data?.data?.discountAutomaticAppCreate?.userErrors;

          if (userErrors?.length > 0) {
            console.error("❌ userErrors:", JSON.stringify(userErrors, null, 2));
            return;
          }

          if (!discount?.discountId) {
            console.log("❌ No discountId returned");
            return;
          }

          console.log("✅ Created Discount ID:", discount.discountId);
          console.log("====================================");
        }

        // ✅ Always create ScriptTag (runs whether discount existed or not)
        const scriptResponse = await admin.graphql(`
          mutation {
            scriptTagCreate(input: {
              src: "${process.env.SHOPIFY_APP_URL}/cashback.js"
              displayScope: ONLINE_STORE
            }) {
              scriptTag {
                id
                src
              }
              userErrors {
                field
                message
              }
            }
          }
        `);

        const scriptData = await scriptResponse.json();
        console.log("🔥 ScriptTag Response:", JSON.stringify(scriptData, null, 2));

        const scriptErrors = scriptData?.data?.scriptTagCreate?.userErrors;
        if (scriptErrors?.length > 0) {
          console.error("❌ ScriptTag errors:", JSON.stringify(scriptErrors, null, 2));
        } else {
          console.log("✅ ScriptTag created:", scriptData?.data?.scriptTagCreate?.scriptTag?.id);
        }

      } catch (err) {
        console.error("❌ afterAuth error:", err);
      }
    },
  },
  future: {
    expiringOfflineAccessTokens: true,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;
export const apiVersion = ApiVersion.October25;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;