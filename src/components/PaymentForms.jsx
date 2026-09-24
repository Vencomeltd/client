// Stripe Elements forms for payments v2: the booking payment form (checkout)
// and the "update your card" form (failed deposit hold). Only used when the
// server reports payments v2 is enabled.
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";

export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const appearance = { theme: "stripe", variables: { colorPrimary: "#305CDE", borderRadius: "8px" } };

const buttonStyle = (disabled) => ({
  width: "100%",
  marginTop: 16,
  padding: "14px 20px",
  borderRadius: 10,
  border: "none",
  background: "#305CDE",
  color: "#fff",
  fontSize: 15,
  fontWeight: 700,
  cursor: disabled ? "not-allowed" : "pointer",
  opacity: disabled ? 0.6 : 1,
});

const errorStyle = { color: "#DC2626", fontSize: 13, marginTop: 12 };

function PaymentInner({ onSuccess, payLabel, consentText }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError("");

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: "if_required",
    });

    if (confirmError) {
      setError(confirmError.message || "Your payment could not be completed.");
      setSubmitting(false);
      return;
    }
    // "requires_capture" = Request to Book: the card is authorised and only
    // charged once the host approves.
    if (["succeeded", "requires_capture", "processing"].includes(paymentIntent?.status)) {
      onSuccess();
      return;
    }
    setError("Your payment could not be completed. Please try again.");
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: 16 }}>
      <PaymentElement />
      {consentText && <p style={{ fontSize: 12, color: "#6B7280", marginTop: 14, lineHeight: 1.5 }}>{consentText}</p>}
      {error && <p style={errorStyle}>{error}</p>}
      <button type="submit" disabled={!stripe || submitting} style={buttonStyle(!stripe || submitting)}>
        {submitting ? "Processing…" : payLabel}
      </button>
    </form>
  );
}

export function PaymentElementForm({ clientSecret, onSuccess, payLabel = "Pay now", consentText }) {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
      <PaymentInner onSuccess={onSuccess} payLabel={payLabel} consentText={consentText} />
    </Elements>
  );
}

function SetupInner({ onConfirmed }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError("");

    const { error: setupError, setupIntent } = await stripe.confirmSetup({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: "if_required",
    });

    if (setupError || setupIntent?.status !== "succeeded") {
      setError(setupError?.message || "We couldn't save that card. Please try another.");
      setSubmitting(false);
      return;
    }
    try {
      await onConfirmed(setupIntent.id);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {error && <p style={errorStyle}>{error}</p>}
      <button type="submit" disabled={!stripe || submitting} style={buttonStyle(!stripe || submitting)}>
        {submitting ? "Saving card…" : "Save card and place deposit hold"}
      </button>
    </form>
  );
}

export function UpdateCardForm({ clientSecret, onConfirmed }) {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
      <SetupInner onConfirmed={onConfirmed} />
    </Elements>
  );
}
