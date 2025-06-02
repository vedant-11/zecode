import React, { useRef, useEffect, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

const BarcodeScanner = ({ onDetected }) => {
  const scannerRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [barcode, setBarcode] = useState("");
  const [error, setError] = useState("");

  // This will hold the html5-qrcode instance
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    // Cleanup scanner on unmount
    return () => {
      stopScan();
    };
    // eslint-disable-next-line
  }, []);

  const startScan = async () => {
    setError("");
    setBarcode("");
    setScanning(true);

    // If already running, stop and reset
    stopScan();

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.7777778, // 16:9
      formatsToSupport: [
        "CODE_128",
        "EAN_13",
        "EAN_8",
        "UPC_A",
        "UPC_E",
        "CODE_39",
        "ITF",
        "CODABAR",
        "QR_CODE",
      ], // include all types if needed
    };

    const html5QrCode = new Html5Qrcode("reader");
    html5QrCodeRef.current = html5QrCode;

    html5QrCode
      .start(
        { facingMode: "environment" }, // Rear camera
        config,
        (decodedText, decodedResult) => {
          setBarcode(decodedText);
          if (onDetected) onDetected(decodedText);
          stopScan();
        },
        (err) => {
          // On decode failure (can ignore)
        }
      )
      .catch((err) => {
        setError("Camera start error: " + err);
        setScanning(false);
      });
  };

  const stopScan = () => {
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current
        .stop()
        .then(() => {
          html5QrCodeRef.current.clear();
        })
        .catch(() => {})
        .finally(() => {
          html5QrCodeRef.current = null;
        });
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
      <div
        style={{ marginTop: 16, marginBottom: 16, color: "#888", fontSize: 13 }}
      >
        <strong>Tip:</strong> Point your camera at a barcode. Works best in good
        lighting.
      </div>
      <div className="text-center">
        <div className="relative">
          {/* Scanner with border and subtle shadow */}
          <div
            className="border-blue-100 rounded-xl shadow-lg overflow-hidden"
            style={{ position: "relative" }}
          >
            {/* This div is where html5-qrcode will render the video feed */}
            <div
              id="reader"
              ref={scannerRef}
              style={{
                width: "100%",
                minHeight: "260px",
                borderRadius: "12px",
                overflow: "hidden",
                border: "4px solid #c7d2fe",
              }}
            />
          </div>
          {/* Optional scanning guide text */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-white bg-black bg-opacity-50 px-4 py-2 rounded-lg">
              Align barcode within frame
            </div>
          </div>
        </div>
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
          Successfully scanned barcode: {barcode}
        </div>
      )}
      {error && (
        <div style={{ marginTop: 16, color: "red" }}>Error: {error}</div>
      )}
    </div>
  );
};

export default BarcodeScanner;
