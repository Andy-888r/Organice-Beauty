import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_51TIFI3PSYJgdv7vvsxmjG75JNJomNxvU8TikterZhm8xf1qOhMihamCYxRqQoSB9mTnjtmM3ht7oR5JlsHv');

const inputStyle = {
  style: {
    base: {
      fontSize: '16px',
      color: '#32325d',
      '::placeholder': { color: '#aab7c4' },
    },
    invalid: { color: '#fa755a' },
  },
};

function CheckoutForm({ monto, descripcion, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setMensaje('');

    try {
      const res = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monto }),
      });

      if (!res.ok) throw new Error('Error al crear el intento de pago');
      const { clientSecret } = await res.json();

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardNumberElement),
        },
      });

      if (error) {
        setMensaje(error.message);
        onError?.(error);
      } else if (paymentIntent.status === 'succeeded') {
        setMensaje('¡Pago exitoso!');
        onSuccess?.(paymentIntent);
      }
    } catch (err) {
      setMensaje(err.message);
      onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <p style={styles.descripcion}>{descripcion}</p>
      <p style={styles.monto}>${(monto / 100).toFixed(2)} MXN</p>

      <div style={styles.cardLogos}>
        <img src="https://js.stripe.com/v3/fingerprinted/img/visa-729c05c240c4bdb47b03ac81d9945bfe.svg" alt="Visa" style={styles.logo}/>
        <img src="https://js.stripe.com/v3/fingerprinted/img/mastercard-4d8844094130711885b5e41b28c9848f.svg" alt="Mastercard" style={styles.logo}/>
        <img src="https://js.stripe.com/v3/fingerprinted/img/amex-a49b82f46c5cd6a96a6e418a6ca1717c.svg" alt="Amex" style={styles.logo}/>
      </div>

      <div style={styles.campo}>
        <label style={styles.label}>Número de tarjeta</label>
        <div style={styles.inputBox}>
          <CardNumberElement options={inputStyle} />
        </div>
      </div>

      <div style={styles.fila}>
        <div style={styles.campo}>
          <label style={styles.label}>Fecha de vencimiento</label>
          <div style={styles.inputBox}>
            <CardExpiryElement options={inputStyle} />
          </div>
        </div>

        <div style={styles.campo}>
          <label style={styles.label}>CVC</label>
          <div style={styles.inputBox}>
            <CardCvcElement options={inputStyle} />
          </div>
        </div>
      </div>

      {mensaje && (
        <p style={mensaje.includes('exitoso') ? styles.exito : styles.error}>
          {mensaje}
        </p>
      )}

      <button type="submit" disabled={!stripe || loading} style={styles.boton}>
        {loading ? 'Procesando...' : 'Pagar ahora'}
      </button>
    </form>
  );
}

const styles = {
  form: {
    maxWidth: '420px',
    margin: '0 auto',
    padding: '24px',
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    backgroundColor: '#fff',
    fontFamily: 'sans-serif',
  },
  descripcion: { fontSize: '15px', color: '#555', marginBottom: '4px' },
  monto: { fontSize: '22px', fontWeight: 'bold', color: '#333', marginBottom: '16px' },
  cardLogos: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
    alignItems: 'center',
  },
  logo: { height: '24px', width: 'auto', objectFit: 'contain' },
 campo: { display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 },
 fila: { display: 'flex', gap: '12px', marginTop: '12px', alignItems: 'flex-start' },
 label: { fontSize: '13px', color: '#555', marginBottom: '6px', whiteSpace: 'nowrap' },
  inputBox: {
    padding: '12px',
    border: '1px solid #d0d0d0',
    borderRadius: '8px',
  },
  boton: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#635bff',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '16px',
  },
  exito: { color: 'green', fontSize: '14px', marginTop: '8px' },
  error: { color: '#fa755a', fontSize: '14px', marginTop: '8px' },
};

export default function StripeCheckout({ monto, descripcion, onSuccess, onError }) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm
        monto={monto}
        descripcion={descripcion}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  );
}