import logo from "./logo.svg";
import React, { useEffect, useState } from "react";
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
  const [showApp, setShowApp] = useState(false);
  useEffect(() => {
    // Initialize any necessary state or effects here
    setTimeout(() => {
      setShowApp(true);
    }, 3000); // Show app after 1 second
  }, []);
  const handleDetected = (barcode) => {
    console.log("Detected barcode:", barcode);
    // For now, just show the raw barcode
    setProductInfo({ barcode });

    // Optional: fetch data from an API here
    // fetchProductInfo(barcode);
  };
  return (
    <>
      {showApp ? (
        <div className="md:w-[80%] mx-auto min-h-screen bg-gray-50 flex items-center flex-col justify-start">
          <Scan />

          {/* <UserDetailsForm/> */}
          {/* <MobileNumber/> */}
          {/* <Otp/> */}
          {/* <PaymentSuccess /> */}
        </div>
      ) : (
        <div className="bg-[#B11F2A] mx-auto min-h-screen w-[100vw] flex items-center flex-col justify-center">
          <img src="zecode.png" alt="Description" />
        </div>
      )}
    </>
  );
}

export default App;
