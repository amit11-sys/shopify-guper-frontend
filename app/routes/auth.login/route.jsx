
import { useState } from "react";
import { Form, useActionData, useLoaderData } from "react-router";
import { login } from "../../shopify.server";
import { loginErrorMessage } from "./error.server";

export const loader = async ({ request }) => {
  const errors = loginErrorMessage(await login(request));

  return { errors };
};

export const action = async ({ request }) => {
  const errors = loginErrorMessage(await login(request));

  return {
    errors,
  };
};

export default function Auth() {
  const loaderData = useLoaderData();
  const actionData = useActionData();
  const [shop, setShop] = useState("");
  const { errors } = actionData || loaderData;

  return (
    <div style={{ padding: 40 }}>
      <h1>Login</h1>

      <Form method="post">
        <input
          name="shop"
          value={shop}
          onChange={(e) => setShop(e.target.value)}
          placeholder="example.myshopify.com"
        />

        {errors.shop && (
          <p>{errors.shop}</p>
        )}

        <button type="submit">
          Login
        </button>
      </Form>
    </div>
  );
}
