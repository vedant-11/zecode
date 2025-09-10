import { load } from "@cashfreepayments/cashfree-js";
import axios from "axios";

export default function PayWithCashfreeButton({
  orderId, // You might pass amount/customer details directly
  amount,
  name,
  email,
  phone,
  customerId,
  setPayment,
}) {
  let cashfree;
  var initializeSDK = async function () {
    cashfree = await load({
      mode: "sandbox",
    });
  };
  initializeSDK();
  const handlePay = async () => {
    try {
      // 1. Get payment session id from back      console.log("Requesting session ID from backend...");
      await axios
        .post("http://localhost:4000/api/cashfree-order", {
          // Pass the necessary data; orderId might be generated backend now
          amount: amount,
          name: name,
          email: email,
          phone: phone,
          customerId: customerId,
        })
        .then((response) => {
          console.log("Received response from backend:", response.data);
          const paymentSessionId = response.data.payment_session_id;
          console.log("Received paymentSessionId:", paymentSessionId);

          let checkoutOptions = {
            paymentSessionId: paymentSessionId,
            redirectTarget: "_modal",
          };
          cashfree.checkout(checkoutOptions).then((result) => {
            if (result.error) {
              // This will be true whenever user clicks on close icon inside the modal or any error happens during the payment
              console.log(
                "User has closed the popup or there is some payment error, Check for Payment Status"
              );
              console.log(result.error);
            }
            if (result.redirect) {
              // This will be true when the payment redirection page couldnt be opened in the same window
              // This is an exceptional case only when the page is opened inside an inAppBrowser
              // In this case the customer will be redirected to return url once payment is completed
              console.log("Payment will be redirected");
            }
            if (result.paymentDetails) {
              // This will be called whenever the payment is completed irrespective of transaction status
              console.log(
                "Payment has been completed, Check for Payment Status"
              );
              setPayment(true);
              console.log(result.paymentDetails);
            }
          });
        });
    } catch (err) {
      console.error("Cashfree integration error:", err);
      alert(
        "Cashfree error: " + (err.response?.data?.error || err.message),
        "hello"
      );
    }
  };

  return (
    <button
      onClick={handlePay}
      className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
    >
      Proceed to Checkout
    </button>
  );
}
