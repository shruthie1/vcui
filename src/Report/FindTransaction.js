// src/FindTransaction.js
import React, { useState } from "react";

const FindTransaction = () => {
  const [transactionId, setTransactionId] = useState("");
  const [transactionData, setTransactionData] = useState(null);
  const [error, setError] = useState("");

  const handleFindTransaction = async (e) => {
    e.preventDefault();
    setError("");
    setTransactionData(null);

    try {
      const response = await fetch(`https://mytghelper.glitch.me/transaction/${transactionId}`); // Replace with your API endpoint

      if (!response.ok) {
        throw new Error(`Transaction with ID ${transactionId} not found`);
      }

      const data = await response.json();
      setTransactionData(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="FindTransaction">
      <h2>Find Transaction Report</h2>
      <form onSubmit={handleFindTransaction}>
        <div className="form-group">
          <label>Reference Id:</label>
          <input
            type="text"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            required
          />
        </div>
        <button type="submit">Find Transaction</button>
      </form>

      {error && <p className="error-message">{error}</p>}

      {transactionData && (
        <div className="transaction-details">
          <h3>Transaction Details:</h3>
          <p><strong>Transaction ID:</strong> {transactionData.transactionId}</p>
          <p><strong>Amount:</strong> ₹{transactionData.amount}</p>
          <p><strong>Issue:</strong> {transactionData.issue}</p>
          <p><strong>Reason for Refund:</strong> {transactionData.refundReason}</p>
          <p><strong>Refund Method:</strong> {transactionData.refundMethod}</p>
          {transactionData.bankAccount && (
            <p><strong>Bank Account:</strong> {transactionData.bankAccount}</p>
          )}
          {transactionData.ifsc && (
            <p><strong>IFSC Code:</strong> {transactionData.ifsc}</p>
          )}
          {transactionData.cardNumber && (
            <p><strong>Card Number:</strong> {transactionData.cardNumber}</p>
          )}
          {transactionData.expiryDate && (
            <p><strong>Expiry Date:</strong> {transactionData.expiryDate}</p>
          )}
          {transactionData.upiId && (
            <p><strong>UPI ID:</strong> {transactionData.upiId}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default FindTransaction;
