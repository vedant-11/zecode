import React, { useRef, useEffect, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

const BarcodeScanner = ({ onDetected }) => {
  const videoRef = useRef(null);
  const [barcode, setBarcode] = useState("");
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const codeReader = useRef(null);
  const controlsRef = useRef(null); // <-- STORE CONTROLS OBJECT

  useEffect(() => {
    codeReader.current = new BrowserMultiFormatReader();
    // Clean up on unmount
    return () => {
      if (controlsRef.current) {
        controlsRef.current.stop();
      }
    };
  }, []);

  const getRearCameraId = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(
      (device) => device.kind === "videoinput"
    );
    // Prefer rear cam
    const rearCamera = videoDevices.find(
      (device) =>
        device.label.toLowerCase().includes("back") ||
        device.label.toLowerCase().includes("rear") ||
        device.label.toLowerCase().includes("environment")
    );
    return rearCamera ? rearCamera.deviceId : videoDevices[0]?.deviceId || null;
  };

  const startScan = async () => {
    setError("");
    setBarcode("");
    setScanning(true);

    try {
      const deviceId = await getRearCameraId();
      // if (!deviceId) throw new Error("No camera found");

      controlsRef.current = await codeReader.current.decodeFromVideoDevice(
        null,
        videoRef.current,
        (result, err) => {
          if (result) {
            setBarcode(result.getText());
            if (onDetected) onDetected(result.getText());
            stopScan();
          }
          if (err && err.name !== "NotFoundException") {
            setError(err.message || String(err));
          }
        }
      );
    } catch (e) {
      setError(e.message || String(e));
      setScanning(false);
    }
  };

  const stopScan = () => {
    if (controlsRef.current) {
      controlsRef.current.stop(); // <-- STOP using controls object!
      controlsRef.current = null;
    }
    setScanning(false);
  };

  return (
    <div
      style={{
        maxWidth: 420,
        margin: "40px auto",
        padding: 24,
        border: "1px solid #eee",
        borderRadius: 12,
      }}
    >
      <h2>Barcode Scanner</h2>
      <div className="text-center">
        <div className="relative">
          {/* Scanner with border and subtle shadow */}
          <div className="border-4 border-blue-100 rounded-xl shadow-lg overflow-hidden">
            <video
              ref={videoRef}
              className="border-4 w-[100%] border-blue-100 rounded-xl shadow-lg overflow-hidden"
              muted
              autoPlay
              playsInline
            />{" "}
          </div>

          {/* Optional corner accents */}
          <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-blue-500 rounded-tl-xl"></div>
          <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-blue-500 rounded-tr-xl"></div>
          <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-blue-500 rounded-bl-xl"></div>
          <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-blue-500 rounded-br-xl"></div>

          {/* Optional scanning guide text */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-white bg-black bg-opacity-50 px-4 py-2 rounded-lg">
              Align barcode within frame
            </div>
          </div>
        </div>
        {/* <h2 className="text-xl font-small mt-3 mb-4">Scan Item to add to your cart</h2> */}

        {/* <button
                            onClick={handleScan}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg mb-4"
                        >
                            Simulate Scan
                        </button> */}
        {/* <p className="text-gray-600 mt-1">Items in cart: {cartItems.length}</p> */}
      </div>

      <div>
        {!scanning ? (
          <button
            onClick={startScan}
            className="mt-4 bg-black text-white font-small rounded-3xl py-2 px-4 rounded"
          >
            Scan Item to add to your cart
          </button>
        ) : (
          <button
            onClick={stopScan}
            style={{ padding: "8px 16px", borderRadius: 4, cursor: "pointer" }}
          >
            Stop Scanning
          </button>
        )}
      </div>
      {barcode && (
        <div
          style={{
            marginTop: 24,
            fontWeight: "bold",
            fontSize: 18,
            color: "#2a9d8f",
          }}
        >
          Successfully scanned barcode
        </div>
      )}
      {/* {error && (
        <div style={{ marginTop: 16, color: "red" }}>Error: {error}</div>
      )} */}
      <div style={{ marginTop: 16, color: "#888", fontSize: 13 }}>
        <strong>Tip:</strong> Point your camera at a barcode. Works best in good
        lighting.
      </div>
    </div>
  );
};

export default BarcodeScanner;
