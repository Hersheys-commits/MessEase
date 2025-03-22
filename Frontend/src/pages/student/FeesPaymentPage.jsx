import React, { useState, useEffect } from "react";
import api from "../../utils/axiosRequest";
import { toast } from "react-hot-toast";
import {
  FaMoneyBillWave,
  FaCheckCircle,
  FaInfoCircle,
  FaDownload,
} from "react-icons/fa";
import Header from "../../components/Header";
import { jsPDF } from "jspdf";
import hostelService from "../../utils/hostelCheck";

const FeesPaymentPage = () => {
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  useEffect(() => {
    const verifyHostel = async () => {
      try {
        const data = await hostelService.checkHostelAssignment();
        if (data.data.user.role === "student" && !data.data.user.hostel) {
          toast.error("Hostel must be assigned.");
          navigate("/student/update-profile");
        }
        setLoading(false);
      } catch (err) {
        setLoading(false);
        navigate("/student/login");
      }
    };
    verifyHostel();
  }, []);

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        setLoading(true);
        const response = await api.post("/api/payment/student/details");
        setPaymentData(response.data.data);
        console.log(response.data.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load payment details");
        toast.error("Failed to load payment details");
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, []);

  const handlePayment = async () => {
    try {
      setPaymentProcessing(true);

      // Create Razorpay order
      const orderResponse = await api.post("/api/payment/create-order", {
        paymentId: paymentData.payment.id,
      });

      if (!orderResponse.data.success) {
        throw new Error("Failed to create payment order");
      }

      const orderData = orderResponse.data.data;

      // Initialize Razorpay
      const options = {
        key: orderData.keyId,
        amount: orderData.amount * 100, // in paise
        currency: orderData.currency,
        name: "Hostel Management",
        description: paymentData.payment.title,
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await api.post("/api/payment/verify", {
              paymentId: paymentData.payment.id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (verifyResponse.data.success) {
              toast.success("Payment successful!");
              setPaymentData((prev) => ({
                ...prev,
                hasPaid: true,
              }));
            } else {
              toast.error("Payment verification failed");
            }
          } catch (err) {
            console.error(err);
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          name: "Student Name", // Ideally get this from user context\n          email: 'student@example.com',
          contact: "",
        },
        notes: {
          paymentFor: "Hostel Fee",
          paymentId: paymentData.payment.id,
        },
        theme: {
          color: "#3399cc",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error(err);
      toast.error("Failed to initiate payment");
    } finally {
      setPaymentProcessing(false);
    }
  };

  const downloadReceipt = async () => {
    try {
      // Fetch user info from /api/student/verify-token
      const res = await api.post("/api/student/verify-token");
      const userInfo = res.data.userInfo; // Expected to have: name, email, branch, year

      // Get current date for receipt generation timestamp
      const today = new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const time = new Date().toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });

      // Generate receipt number
      const receiptNumber = `RCT-${Date.now().toString().slice(-8)}`;

      // Create a new PDF document using jsPDF
      const doc = new jsPDF();

      // Add a simple header with logo placeholder
      doc.setFillColor(25, 47, 96); // Navy blue header
      doc.rect(0, 0, 210, 30, "F");
      doc.setTextColor(255, 255, 255); // White text
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("PAYMENT RECEIPT", 105, 20, { align: "center" });

      // Reset text color for body
      doc.setTextColor(0, 0, 0);

      // Add receipt information
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`Receipt No: ${receiptNumber}`, 14, 40);
      doc.text(`Date: ${today}`, 14, 46);
      doc.text(`Time: ${time}`, 14, 52);

      // Add payment status with color indicator
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(39, 174, 96); // Green for success
      doc.text("PAYMENT SUCCESSFUL", 105, 46, { align: "center" });
      doc.setTextColor(0, 0, 0); // Reset to black

      // Horizontal line
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.5);
      doc.line(14, 58, 196, 58);

      // User Information Section
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Student Information", 14, 68);

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");

      // Create two-column layout for student info
      const leftColumn = 14;
      const rightColumn = 105;

      doc.text(`Name: ${userInfo.name}`, leftColumn, 78);
      doc.text(`Email: ${userInfo.email}`, leftColumn, 86);
      doc.text(`Branch: ${userInfo.branch || "N/A"}`, rightColumn, 78);
      doc.text(`Year: ${userInfo.year || "N/A"}`, rightColumn, 86);

      // Horizontal line
      doc.line(14, 94, 196, 94);

      // Payment Information Section
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Payment Details", 14, 104);

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`Payment Title: ${paymentData.payment.title}`, 14, 114);

      // Format payment date using the paidAt field from paymentDetails
      let paymentDate = "N/A";
      if (paymentData.paymentDetails && paymentData.paymentDetails.paidAt) {
        paymentDate = new Date(
          paymentData.paymentDetails.paidAt
        ).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      } else if (paymentData.payment.paidOn) {
        paymentDate = new Date(paymentData.payment.paidOn).toLocaleDateString(
          "en-GB",
          {
            day: "numeric",
            month: "long",
            year: "numeric",
          }
        );
      }
      doc.text(`Payment Date: ${paymentDate}`, 14, 122);

      // Format due date if available
      let dueDate = "N/A";
      if (paymentData.payment.dueDate) {
        dueDate = new Date(paymentData.payment.dueDate).toLocaleDateString(
          "en-GB",
          {
            day: "numeric",
            month: "long",
            year: "numeric",
          }
        );
      }
      doc.text(`Due Date: ${dueDate}`, 14, 130);

      // Add transaction ID from paymentDetails if available
      const transactionId =
        (paymentData.paymentDetails &&
          paymentData.paymentDetails.transactionId) ||
        paymentData.payment.transactionId ||
        "N/A";
      doc.text(`Transaction ID: ${transactionId}`, 14, 138);

      // Add payment method from paymentDetails
      const paymentMethod =
        (paymentData.paymentDetails &&
          paymentData.paymentDetails.paymentMethod) ||
        paymentData.payment.method ||
        "Online Payment";
      doc.text(`Payment Method: ${paymentMethod}`, 14, 146);

      // Add Razorpay Payment ID if available
      if (
        paymentData.paymentDetails &&
        paymentData.paymentDetails.razorpayPaymentId
      ) {
        doc.text(
          `Razorpay Payment ID: ${paymentData.paymentDetails.razorpayPaymentId}`,
          14,
          154
        );
      }

      // Horizontal line
      doc.line(14, 162, 196, 162);

      // Amount Section
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Amount Details", 14, 172);

      // Create a summary table for amount
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");

      // Base amount
      doc.text("Base Amount:", 14, 182);
      doc.text(
        `₹${(paymentData.payment.amount - (paymentData.payment.tax || 0)).toFixed(2)}`,
        170,
        182,
        { align: "right" }
      );

      // Tax (if applicable)
      if (paymentData.payment.tax) {
        doc.text("Tax:", 14, 190);
        doc.text(`₹${paymentData.payment.tax.toFixed(2)}`, 170, 190, {
          align: "right",
        });
      }

      // Total
      doc.setFont("helvetica", "bold");
      doc.text("Total Amount:", 14, 198);
      doc.text(`₹${paymentData.payment.amount.toFixed(2)}`, 170, 198, {
        align: "right",
      });

      // Add footer with terms and contact
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(
        "This is an electronically generated receipt and does not require a signature.",
        105,
        240,
        { align: "center" }
      );
      doc.text(
        "For any queries regarding this payment, please contact the accounts department.",
        105,
        246,
        { align: "center" }
      );
      doc.text("Thank you for your payment.", 105, 252, { align: "center" });

      // Add a border to the entire page
      doc.setDrawColor(25, 47, 96);
      doc.setLineWidth(1);
      doc.rect(5, 5, 200, 287);

      // Save/download the PDF with a more descriptive filename
      const filename = `Receipt_${paymentData.payment.title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
      doc.save(filename);

      // Show success message to user
      toast.success("Receipt downloaded successfully");
    } catch (err) {
      console.error("Error generating receipt:", err);
      toast.error("Failed to generate receipt");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <Header />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  if (error) return <div className="text-center p-5 text-red-500">{error}</div>;

  // No payment enabled for hostel
  if (!paymentData?.paymentExists) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <Header />
        <div className="container mx-auto p-6 max-w-2xl">
          <div className="bg-gray-800 shadow-md rounded-lg p-8 text-center border border-gray-700">
            <FaInfoCircle className="mx-auto text-blue-500 text-5xl mb-4" />
            <h1 className="text-2xl font-bold mb-3">No Payment Required</h1>
            <p className="text-gray-400 mb-6">
              No payment is currently enabled for your hostel/mess.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Already paid
  if (paymentData.hasPaid) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <Header />
        <div className="container mx-auto p-6 max-w-2xl">
          <div className="bg-gray-800 shadow-md rounded-lg p-8 text-center border border-gray-700">
            <FaCheckCircle className="mx-auto text-green-500 text-5xl mb-4" />
            <h1 className="text-2xl font-bold mb-3">Payment Successful</h1>
            <p className="text-gray-400 mb-6">
              You have successfully paid your{" "}
              {paymentData.payment.title.toLowerCase()}.
            </p>
            <div className="bg-gray-700 p-4 rounded-lg mb-4 text-left">
              <p className="font-medium text-gray-200">
                Amount Paid:{" "}
                <span className="font-normal">
                  ₹{paymentData.payment.amount}
                </span>
              </p>
              {paymentData.payment.dueDate && (
                <p className="font-medium text-gray-200">
                  Due Date:{" "}
                  <span className="font-normal">
                    {new Date(paymentData.payment.dueDate).toLocaleDateString()}
                  </span>
                </p>
              )}
            </div>
            <button
              onClick={downloadReceipt}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center justify-center transition-colors duration-300"
            >
              <FaDownload className="mr-2" /> Download Receipt
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Payment required
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Header />
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="bg-gray-800 shadow-md rounded-lg p-8 border border-gray-700">
          <h1 className="text-2xl font-bold mb-6 text-center">
            {paymentData.payment.title}
          </h1>

          {paymentData.payment.description && (
            <div className="mb-6">
              <p className="text-gray-400">{paymentData.payment.description}</p>
            </div>
          )}

          <div className="bg-blue-900 p-6 rounded-lg mb-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-blue-300">Amount Due</p>
                <p className="text-3xl font-bold">
                  ₹{paymentData.payment.amount}
                </p>
              </div>
              {paymentData.payment.dueDate && (
                <div className="text-right">
                  <p className="text-sm text-blue-300">Due By</p>
                  <p className="text-lg font-medium">
                    {new Date(paymentData.payment.dueDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mb-6 text-sm text-gray-500">
            <p>• This is a secure payment processed by Razorpay</p>
            <p>• You will receive a payment confirmation once completed</p>
          </div>

          <button
            onClick={handlePayment}
            disabled={paymentProcessing}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg flex justify-center items-center transition-colors"
          >
            {paymentProcessing ? (
              "Processing..."
            ) : (
              <>
                <FaMoneyBillWave className="mr-2" /> Pay Now
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeesPaymentPage;
