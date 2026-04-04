import { useState } from "react";

const AlertaBajoStock = ({ alertas }) => {
  const [visible, setVisible] = useState(true);

  if (!alertas || alertas.length === 0 || !visible) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{
        backgroundColor: "#fff",
        borderRadius: "8px",
        padding: "32px",
        maxWidth: "500px",
        width: "90%",
        maxHeight: "80vh",
        overflowY: "auto",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        border: "2px solid #ffc107",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 style={{ margin: 0, fontSize: "1.1rem", color: "#856404", fontFamily: "Jost, sans-serif" }}>
            ⚠️ Productos con bajo stock ({alertas.length})
          </h2>
          <button
            onClick={() => setVisible(false)}
            style={{
              background: "none", border: "none",
              fontSize: "22px", cursor: "pointer",
              color: "#856404", lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>
        <ul style={{ margin: 0, paddingLeft: "20px" }}>
          {alertas.map((alerta, index) => (
           <li key={index} style={{
  fontSize: "14px",
  marginBottom: "6px",
  fontFamily: "Jost, sans-serif",
  color: alerta.startsWith('[SIN STOCK]') ? '#8B2E2E' : '#9A6735',
  fontWeight: alerta.startsWith('[SIN STOCK]') ? '600' : '400',
}}>
  {alerta}
</li>
          ))}
        </ul>
       
      </div>
    </div>
  );
};

export default AlertaBajoStock;