(async () => {
  try {
    const customerId = window.__st?.cid;
    const shop = window.Shopify?.shop;

    if (!customerId || !shop) return;

    const cart = await fetch('/cart.js').then(r => r.json());
    if (!cart.items || cart.items.length === 0) return;

    const currentItemsHash = JSON.stringify(
      cart.items.map(i => ({ id: i.id, q: i.quantity }))
    );

    if (cart.attributes?.guper_cart_hash === currentItemsHash) {
      console.log("✅ Cart unchanged, skipping redeem");
      return;
    }

    const balanceRes = await fetch(
      `/apps/guper/api/customer-balance?shop=${shop}&shopifyCustomerId=${customerId}`
    );
    const balanceData = await balanceRes.json();
    if (!balanceData.success) return;

    const available = balanceData.data?.available || 0;
    if (available <= 0) return;

    const cartTotal = cart.items.reduce((sum, i) => {
      return sum + (i.price / 100) * i.quantity;
    }, 0);

    const items = cart.items.map(i => ({
      id: i.product_id.toString(),
      name: i.product_title,
      quantity: i.quantity,
      price: i.price / 100
    }));

    const redeemRes = await fetch('/apps/guper/api/redeem-points', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shop,
        shopifyCustomerId: String(customerId),
        orderId: "TEMP-" + Date.now(),
        items
      })
    });

    const redeemData = await redeemRes.json();
    if (!redeemData.success) return;

    let discount = redeemData.data?.discountAmount || 0;
    if (discount > cartTotal) discount = cartTotal;

    await fetch('/cart/update.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        attributes: {
          guper_discount: discount.toFixed(2),
          guper_cart_hash: currentItemsHash
        }
      })
    });

    console.log("✅ Guper Cashback saved:", discount.toFixed(2));

  } catch (err) {
    console.error("❌ Guper cashback error:", err);
  }
})();