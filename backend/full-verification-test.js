const http = require('http');

async function runFullVerification() {
  const fetch = global.fetch;

  console.log('====================================================');
  console.log('   AURELIA ATELIER - COMPLETE END-TO-END VERIFICATION');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health
    const healthRes = await fetch('http://localhost:5000/api/health');
    const health = await healthRes.json();
    assert(health.status === 'online', '1. Backend health endpoint is online');

    // 2. Categories with itemCount
    const catRes = await fetch('http://localhost:5000/api/categories');
    const cats = await catRes.json();
    assert(cats.success && cats.count >= 6, `2. Categories retrieved (${cats.count} categories)`);
    assert(cats.data[0].itemCount !== undefined, `2.1. Category includes itemCount (${cats.data[0].itemCount} items)`);

    // 3. Public Items (Ensure quantity is EXCLUDED)
    const itemsRes = await fetch('http://localhost:5000/api/items');
    const items = await itemsRes.json();
    assert(items.success && items.count >= 15, `3. Public items retrieved (${items.count} items)`);
    const hasQuantityInPublic = items.data.some(i => i.quantity !== undefined);
    assert(!hasQuantityInPublic, '3.1. Public items strictly OMIT stock quantity');

    // 4. Cart Stock Validation
    const testItem = items.data[0];
    const validateRes = await fetch('http://localhost:5000/api/items/validate-cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ itemId: testItem._id, quantity: 1 }]
      })
    });
    const validateData = await validateRes.json();
    assert(validateData.success && validateData.allAvailable === true, '4. Cart validation succeeds for normal quantity');

    const excessValidateRes = await fetch('http://localhost:5000/api/items/validate-cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ itemId: testItem._id, quantity: 99999 }]
      })
    });
    const excessValidate = await excessValidateRes.json();
    assert(excessValidate.allAvailable === false, '4.1. Cart validation flags excess quantity without leaking stock count');

    // 5. Manager Login
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'manager@aurelia.com',
        password: 'Manager@123456'
      })
    });
    const login = await loginRes.json();
    assert(login.success === true && !!login.data?.token, '5. Manager authentication succeeded with JWT');
    const token = login.data.token;
    const authHeaders = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

    // 6. Manager Items (Ensure quantity IS present)
    const mgrItemsRes = await fetch('http://localhost:5000/api/items/manager/all', {
      headers: authHeaders
    });
    const mgrItems = await mgrItemsRes.json();
    const allHaveQuantity = mgrItems.data.every(i => i.quantity !== undefined);
    assert(allHaveQuantity, '6. Manager items endpoint INCLUDES stock quantity');

    const initialStock = mgrItems.data.find(i => i._id === testItem._id).quantity;
    console.log(`[Info] Initial stock for "${testItem.name}": ${initialStock}`);

    // 7. Order Placement (Public)
    const orderRes = await fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer: {
          fullName: 'Sienna Montgomery',
          phone: '+1 (555) 723-9011',
          address: '888 Madison Avenue, Penthouse 14, New York, NY 10021',
          notes: 'Deliver in signature embossed gift box.'
        },
        items: [
          { item: testItem._id, quantity: 2 }
        ]
      })
    });
    const orderData = await orderRes.json();
    assert(orderData.success === true, '7. Order created successfully');
    assert(orderData.data?.status === 'opened', '7.1. Order initial status is "opened"');
    assert(orderData.data?.totalPrice === testItem.price * 2, `7.2. Total price calculated by server ($${orderData.data?.totalPrice})`);

    const newOrderId = orderData.data._id;

    // 8. Verify Stock Decrement
    const mgrItemsAfterOrder = await (await fetch('http://localhost:5000/api/items/manager/all', { headers: authHeaders })).json();
    const updatedStock = mgrItemsAfterOrder.data.find(i => i._id === testItem._id).quantity;
    assert(updatedStock === initialStock - 2, `8. Stock was atomically decremented from ${initialStock} to ${updatedStock}`);

    // 9. Dashboard Stats
    const statsRes = await fetch('http://localhost:5000/api/dashboard/stats', { headers: authHeaders });
    const stats = await statsRes.json();
    assert(stats.success === true && stats.data.openedOrders > 0, `9. Dashboard stats show ${stats.data.openedOrders} opened orders`);

    // 10. Manager Orders List & Details
    const ordersRes = await fetch('http://localhost:5000/api/orders?status=opened', { headers: authHeaders });
    const ordersList = await ordersRes.json();
    assert(ordersList.data.some(o => o._id === newOrderId), '10. New order listed in manager orders');

    // 11. Manager Updates Order Status to Closed
    const statusPatchRes = await fetch(`http://localhost:5000/api/orders/${newOrderId}/status`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ status: 'closed' })
    });
    const updatedOrder = await statusPatchRes.json();
    assert(updatedOrder.data?.status === 'closed', '11. Manager updated order status to "closed"');

    // 12. Manager Updates Internal Notes
    const notesPatchRes = await fetch(`http://localhost:5000/api/orders/${newOrderId}/notes`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ internalNotes: 'Client confirmed via phone. Express courier scheduled.' })
    });
    const notedOrder = await notesPatchRes.json();
    assert(notedOrder.data?.internalNotes.includes('Express courier scheduled'), '12. Manager internal order notes saved');

    // 13. Category Safeguard (Cannot delete category with products)
    const catWithProducts = cats.data.find(c => c.itemCount > 0);
    const deleteCatRes = await fetch(`http://localhost:5000/api/categories/${catWithProducts._id}`, {
      method: 'DELETE',
      headers: authHeaders
    });
    const deleteCatData = await deleteCatRes.json();
    assert(deleteCatRes.status === 400 && deleteCatData.success === false, '13. Safeguard successfully blocked deletion of category with active products');

    console.log('\n====================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');

  } catch (err) {
    console.error('Unexpected test error:', err);
  }
}

runFullVerification();
