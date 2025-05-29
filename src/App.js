import logo from "./logo.svg";
import React, { useState } from "react";
import "./App.css";
import Scan from "./components/Scan";
import Landing from "./pages/Landing";
import UserDetailsForm from "./components/UserDetailsForm";
import MobileNumber from "./components/MobileNumber";
import Otp from "./components/Otp";
import PaymentSuccess from "./components/PaymentSuccess";
import BarcodeScanner from "./components/BarcodeScanner";
function App() {
  const [productInfo, setProductInfo] = useState(null);

  const handleDetected = (barcode) => {
    console.log("Detected barcode:", barcode);
    // For now, just show the raw barcode
    setProductInfo({ barcode });

    // Optional: fetch data from an API here
    // fetchProductInfo(barcode);
  };
  return (
    <div className="md:w-[80%] mx-auto min-h-screen bg-gray-50 flex items-center flex-col justify-start">
      <Scan />

      {/* <UserDetailsForm/> */}
      {/* <MobileNumber/> */}
      {/* <Otp/> */}
      {/* <PaymentSuccess /> */}
    </div>
  );
}

export default App;
