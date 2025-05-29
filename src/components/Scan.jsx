import { useState, useEffect } from "react";
// import BarcodeScannerComponent from "react-qr-barcode-scanner";
import CartItem from "./CartItem";
import PaymentSuccess from "./PaymentSuccess";
import { div } from "framer-motion/client";
import UserDetailsForm from "./UserDetailsForm";
import BarcodeScanner from "./BarcodeScanner";
import { color, number } from "framer-motion";
import CashfreePayButton from "./Cashfree";
import PayWithCashfreeButton from "./Cashfree";
export default function Scan() {
  const [activeStep, setActiveStep] = useState("scan"); // 'scan', 'review', 'pay', 'user'
  const [cartItems, setCartItems] = useState([]);
  const [payment, setPayment] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [lastAdded, setLastAdded] = useState(null);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (cartItems.length > 0) {
      setLastAdded(cartItems[cartItems.length - 1]);
      setShowNotification(true);
      const timer = setTimeout(() => setShowNotification(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [cartItems]);

  // Mock database of products (in a real app, this would be an API call)
  const productDatabase = {
    8536450030820: {
      name: "Girls Joggers",
      price: 449,
      size: "50cm (5-6Y)",
      color: "Black",
    },
    8536450005149: {
      name: "Mens Sweatshirt",
      price: 599,
      size: "107cm (M)",
      color: "Beige",
    },
    8536450061954: {
      name: "Men's Shirts",
      price: 799,
      size: "106cm (M)",
      color: "Black",
    },
    8536450037416: {
      name: "Men's Denims",
      price: 899,
      size: "84cm (32)",
      color: "Black",
    },
    8536450056035: {
      name: "Women's Camsoles",
      price: 399,
      size: "63cm (s)",
      color: "Purple",
    },
    8536450095812: {
      name: "Women's Dresses",
      price: 799,
      size: "81cm (M)",
      color: "Black",
    },
    8536450000922: {
      name: "Cap Sleeve Top",
      price: 699,
      size: "89cm (S)",
      color: "Pink",
    },
    8536450020548: {
      name: "Boys T-Shirt",
      price: 199,
      size: "82cm (9-10Y)",
      color: "White Melange",
    },
  };

  const productId = "";
  const product = productDatabase[productId];
  const handleRemoveItem = (productId) => {
    setCartItems(cartItems.filter((item) => item.id !== productId));
  };
  const handleAddItem = (barcode) => {
    console.log("Scanned barcode:", Number(barcode));
    const product = productDatabase[Number(barcode)];
    console.log("Product found:", product);

    if (!product) {
      throw new Error("Product not found in database");
    }

    // Add to cart
    setCartItems((prevItems) => [
      ...prevItems,
      {
        id: Date.now(), // Unique ID for the cart item
        barcode,
        ...product,
      },
    ]);

    // Play success sound
    new Audio("/beep-02.mp3").play().catch(() => {});
  };

  // Mock function to simulate scanning an item
  // const handleScan = () => {
  //     new Audio('/beep-02.mp3').play().catch(() => { });
  //     const newItem = {
  //         id: Date.now(),
  //         name: `Product ${cartItems.length + 1}`,
  //         price: Math.floor(Math.random() * 100) + 10
  //     };
  //     setCartItems([...cartItems, newItem]);
  // };

  // Calculate total price
  const total = cartItems.reduce((sum, item) => sum + item.price, 0);
  const handleDetected = (barcode) => {
    handleAddItem(barcode);

    console.log("Detected barcode:", barcode);
  };

  return (
    <div className="container">
      {activeStep === "user" && (
        <UserDetailsForm setActiveStep={setActiveStep} />
      )}
      {!payment ? (
        <div className="min-h-screen bg-gray-50 p-4">
          {/* Navigation Tabs */}
          <div className="flex justify-between mb-8 bg-white rounded-lg shadow">
            <button
              onClick={() => setActiveStep("scan")}
              className={`flex-1 py-3 px-4 text-center font-medium ${
                activeStep === "scan"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500"
              }`}
            >
              Scan
            </button>
            <button
              onClick={() => setActiveStep("review")}
              className={`flex-1 py-3 px-4 text-center font-medium ${
                activeStep === "review"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500"
              }`}
              disabled={cartItems.length === 0}
            >
              Review Cart
            </button>
            <button
              onClick={() => setActiveStep("pay")}
              className={`flex-1 py-3 px-4 text-center font-medium ${
                activeStep === "pay"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500"
              }`}
              disabled={cartItems.length === 0}
            >
              Pay
            </button>
          </div>
          <div></div>

          {/* Step Content */}

          <div className="bg-white rounded-lg shadow-md p-6">
            {activeStep === "scan" && (
              <div className="text-center">
                <BarcodeScanner onDetected={handleDetected} />
                {/* <h2 className="text-xl font-small mt-3 mb-4">Scan Item to add to your cart</h2> */}

                {/* <button
                            onClick={handleScan}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg mb-4"
                        >
                            Simulate Scan
                        </button> */}
                {/* <p className="text-gray-600 mt-1">Items in cart: {cartItems.length}</p> */}

                {cartItems.length > 0 ? (
                  // <p className="text-gray-600 mt-1">
                  //     Last added: {cartItems[cartItems.length - 1].name} (${cartItems[cartItems.length - 1].barcode})
                  // </p>
                  <CartItem
                    product={
                      productDatabase[cartItems[cartItems.length - 1].barcode]
                    }
                    setCartItems={setCartItems}
                    productId={cartItems[cartItems.length - 1].id}
                  />
                ) : (
                  <p className="text-gray-600 mt-1">Your cart is empty</p>
                )}

                {/* <CartItem product={product} /> */}

                {cartItems.length > 0 && (
                  <button
                    onClick={() => setActiveStep("user")}
                    className="mt-4 bg-black hover:bg-green-700 text-white font-small rounded-3xl py-2 px-4 rounded"
                  >
                    Proceed to Review →
                  </button>
                )}
              </div>
            )}

            {activeStep === "review" && (
              <div>
                <h2 className="text-xl font-bold mb-4">Review Your Cart</h2>
                <div className="mb-6">
                  {cartItems.length === 0 ? (
                    <p className="text-gray-500">Your cart is empty</p>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {cartItems.map((item) => (
                        <CartItem
                          key={item.id}
                          productId={item.id}
                          product={productDatabase[item.barcode]}
                          setCartItems={setCartItems}
                        />
                      ))}
                    </ul>
                  )}
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>₹{total}</span>
                  </div>
                </div>
                <div className="mt-6 flex justify-between">
                  <button
                    onClick={() => setActiveStep("scan")}
                    className="mt-2 bg-black hover:bg-green-700 text-white font-small rounded-3xl py-2 px-4 rounded"
                  >
                    Back to Scan
                  </button>
                  <PayWithCashfreeButton
                    setPayment={setPayment}
                    amount={90}
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
              </div>
            )}

            {activeStep === "pay" && (
              <div>
                <h2 className="text-xl font-bold mb-4">Payment</h2>
                <div className="mb-6">
                  <p className="font-bold text-lg mb-2">Total: ₹{total}</p>

                  {/* Payment Method Selection */}
                  <div className="mb-6">
                    <label className="block text-gray-700 mb-2">
                      Payment Method
                    </label>
                    <div className="flex space-x-4 mb-4">
                      <button className="flex items-center justify-center p-3 border rounded-lg flex-1 bg-white hover:bg-gray-50">
                        <span className="mr-2">💳</span> Card
                      </button>
                      <button className="flex items-center justify-center p-3 border rounded-lg flex-1 bg-white hover:bg-gray-50">
                        <span className="mr-2">📱</span> UPI
                      </button>
                    </div>
                  </div>

                  {/* Card Payment Form */}
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-gray-700 mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex space-x-4">
                      <div className="flex-1">
                        <label className="block text-gray-700 mb-1">
                          Expiry
                        </label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          className="w-full p-2 border border-gray-300 rounded"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-gray-700 mb-1">CVV</label>
                        <input
                          type="text"
                          placeholder="123"
                          className="w-full p-2 border border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  </div>

                  {/* UPI Payment Form */}
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-gray-700 mb-1">UPI ID</label>
                      <input
                        type="text"
                        placeholder="yourname@upi"
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button className="flex items-center justify-center p-2 border rounded-lg bg-white hover:bg-gray-50">
                        <img
                          src="https://img.icons8.com/?size=100&id=am4ltuIYDpQ5&format=png&color=000000"
                          alt="Google Pay"
                          className="h-6 w-6"
                        />
                      </button>
                      <button className="flex items-center justify-center p-2 border rounded-lg bg-white hover:bg-gray-50">
                        <img
                          src="https://img.icons8.com/?size=100&id=OYtBxIlJwMGA&format=png&color=000000"
                          alt="PhonePe"
                          className="h-6 w-6"
                        />
                      </button>
                      <button className="flex items-center justify-center p-2 border rounded-lg bg-white hover:bg-gray-50">
                        <img
                          src="https://img.icons8.com/?size=100&id=68067&format=png&color=000000"
                          alt="Paytm"
                          className="h-6 w-6"
                        />
                      </button>
                      <button className="flex items-center justify-center p-2 border rounded-lg bg-white hover:bg-gray-50">
                        <img
                          src="https://img.icons8.com/?size=100&id=5RcHTSNy4fbL&format=png&color=000000"
                          alt="BHIM"
                          className="h-6 w-6"
                        />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-between">
                  <button
                    onClick={() => setActiveStep("review")}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                  >
                    Back to Cart
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <PaymentSuccess
          totalAmount={total}
          setPayment={setPayment}
          cartItems={cartItems}
          setCartItems={setCartItems}
          setActiveStep={setActiveStep}
        />
      )}
    </div>
  );
}
