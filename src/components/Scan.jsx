import { useState, useEffect } from "react";
import CartItem from "./CartItem";
import PaymentSuccess from "./PaymentSuccess";
import UserDetailsForm from "./UserDetailsForm";
import BarcodeScanner from "./BarcodeScanner";
import PayWithCashfreeButton from "./Cashfree";
import { productService } from "../services/productService";

/* ─────────────────────────────────────────────────────────── */
/* Helper: locate a product in the local cache                */
/* ─────────────────────────────────────────────────────────── */
const findProductByBarcode = (barcode, products) =>
  products.find((p) => String(p.barcode) === String(barcode));

export default function Scan() {
  /* ─────────── State ─────────── */
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState("scan"); // 'scan' | 'review' | 'pay' | 'user'
  const [cartItems, setCartItems] = useState([]);
  const [payment, setPayment] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  /* ─────────── Get first page of products on mount ─────────── */
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async (page = 1, search = "") => {
    try {
      setLoading(true);
      const res = await productService.getProducts(page, 10, search);
      setProducts(res.products);
      setTotalPages(res.totalPages);
      setCurrentPage(res.currentPage);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch products. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  /* ─────────── Toast for “last added” item ─────────── */
  useEffect(() => {
    if (!cartItems.length) return;
    setShowNotification(true);
    const t = setTimeout(() => setShowNotification(false), 3000);
    return () => clearTimeout(t);
  }, [cartItems]);

  /* ─────────── Cart helpers ─────────── */
  const total = cartItems.reduce(
    (sum, { price, qty = 1 }) => sum + price * qty,
    0
  );
  const totalWeight = cartItems.reduce(
    (sum, { weight, qty = 1 }) => sum + weight * qty,
    0
  );

  const handleRemoveItem = (barcode) =>
    setCartItems((prev) => prev.filter((i) => i.barcode !== barcode));

  /* ─────────── Add item by barcode ─────────── */
  const handleAddItem = async (barcode) => {
    const code = String(barcode);

    /* 1. Look in local cache first */
    let product = findProductByBarcode(code, products);

    /* 2. Fetch from backend if not in cache */
    if (!product) {
      try {
        product = await productService.getProductByBarcode(code);
        setProducts((prev) => [...prev, product]); // cache it
      } catch {
        alert("Product not found in database");
        return;
      }
    }

    /* 3. Add (or increment) in cart */
    setCartItems((prev) => {
      const existing = prev.find((i) => i.barcode === code);
      if (existing) {
        return prev.map((i) =>
          i.barcode === code ? { ...i, qty: (i.qty || 1) + 1 } : i
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });

    /* 4. Success beep */
    new Audio("/beep-02.mp3").play().catch(() => {});
  };

  const handleDetected = (barcode) => handleAddItem(barcode);

  /* ─────────── Render ─────────── */
  if (activeStep === "user") {
    return (
      <div className="container">
        <UserDetailsForm setActiveStep={setActiveStep} />
      </div>
    );
  }

  if (payment) {
    return (
      <PaymentSuccess
        totalAmount={total}
        setPayment={setPayment}
        cartItems={cartItems}
        setCartItems={setCartItems}
        setActiveStep={setActiveStep}
      />
    );
  }

  return (
    <div className="container min-h-screen bg-gray-50 p-4">
      {/* ───── Tabs ───── */}
      <div className="flex justify-between mb-8 bg-white rounded-lg shadow">
        {["scan", "review", "pay"].map((step) => (
          <button
            key={step}
            onClick={() => setActiveStep(step)}
            disabled={
              step !== "scan" && step !== activeStep && cartItems.length === 0
            }
            className={`flex-1 py-3 px-4 text-center font-medium ${
              activeStep === step
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500"
            }`}
          >
            {step === "scan" ? "Scan" : step === "review" ? "Cart" : "Pay"}
          </button>
        ))}
      </div>

      {/* ───── Greeting / Logout ───── */}
      <div className="flex py-2 px-4 justify-between mb-8 bg-white rounded-md shadow">
        <div>
          <span className="text-blue-600">Hello, </span>
          {localStorage.getItem("userDetails")?.includes("firstName")
            ? JSON.parse(localStorage.getItem("userDetails")).firstName
            : "Guest"}
        </div>
        <button
          onClick={() => {
            localStorage.removeItem("userDetails");
            setActiveStep("user");
          }}
          className="ml-2 text-red-600 hover:underline"
        >
          Logout
        </button>
      </div>

      {/* ───── Main Card ───── */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* ────────── SCAN ────────── */}
        {activeStep === "scan" && (
          <div className="text-center">
            <BarcodeScanner onDetected={handleDetected} />
            {cartItems.length > 0 && (
              <>
                <CartItem
                  product={cartItems[cartItems.length - 1]}
                  setCartItems={setCartItems}
                  productId={cartItems[cartItems.length - 1].barcode}
                />

                <button
                  onClick={() =>
                    JSON.parse(localStorage.getItem("userDetails"))?.firstName
                      ? setActiveStep("review")
                      : setActiveStep("user")
                  }
                  className="mt-4 bg-black hover:bg-green-700 text-white font-small rounded-3xl py-2 px-4"
                >
                  Proceed to Review →
                </button>
              </>
            )}
          </div>
        )}

        {/* ────────── REVIEW ────────── */}
        {activeStep === "review" && (
          <div>
            <h2 className="text-xl font-bold mb-4">Your Cart</h2>
            {cartItems.length === 0 ? (
              <p className="text-gray-500">Your cart is empty</p>
            ) : (
              <>
                <ul className="divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    <CartItem
                      key={item.barcode}
                      productId={item.barcode}
                      product={item}
                      setCartItems={setCartItems}
                      onRemove={() => handleRemoveItem(item.barcode)}
                    />
                  ))}
                </ul>

                <div className="border-t border-gray-200 pt-4 flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>₹{total}</span>
                </div>
                <div className="border-t border-gray-200 pt-4 flex justify-between font-bold text-lg">
                  <span>Total Weight:</span>
                  <span>{totalWeight}</span>
                </div>

                <div className="mt-6 flex md:flex-row flex-col gap-4">
                  <button
                    onClick={() => setActiveStep("scan")}
                    className="bg-black hover:bg-green-700 text-white font-small rounded-3xl py-2 px-4"
                  >
                    Back to scan
                  </button>

                  <PayWithCashfreeButton
                    setPayment={setPayment}
                    amount={total}
                    name="Test User"
                    email="test@example.com"
                    phone="9999999999"
                    orderId={`order_${
                      Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000
                    }`}
                    customerId={`customer_${
                      Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000
                    }`}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* ────────── PAY ────────── */}
        {activeStep === "pay" && (
          <div className="text-center">
            <h2 className="text-xl font-bold mb-4">Choose Payment Method</h2>
            <PayWithCashfreeButton
              setPayment={setPayment}
              amount={total}
              name="Test User"
              email="test@example.com"
              phone="9999999999"
              orderId={`order_${
                Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000
              }`}
              customerId={`customer_${
                Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000
              }`}
            />
          </div>
        )}
      </div>
    </div>
  );
}
