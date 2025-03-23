import React from "react";
import styles from "./CustomModal.module.css";

const CustomModal = ({ open, title, message, type, onClose }) => {
    if (!open) return null;
  
    return (
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: "#fff",
          padding: 24,
          borderRadius: 8,
          maxWidth: 400,
          width: "100%",
          textAlign: "center"
        }}>
          <h3>{title}</h3>
          <p>{message}</p>
          <button onClick={onClose} style={{
            marginTop: 16,
            backgroundColor: type === "success" ? "#198754" : "#dc3545",
            color: "#fff",
            border: "none",
            padding: "8px 16px",
            borderRadius: 4,
            cursor: "pointer"
          }}>
            Fechar
          </button>
        </div>
      </div>
    );
  };
  
  export default CustomModal;
  
  
