import React, { useState, useRef } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";

function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [hcaptchaToken, setHcaptchaToken] = useState("");
  const hcaptchaRef = useRef(null);

  const [responseMessage, setResponseMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!hcaptchaToken) {
      setResponseMessage("Please complete the security check.");
      setLoading(false);
      return;
    }

    try {
      const backendURL =
        process.env.REACT_APP_API_URL ||
        process.env.REACT_APP_BACKEND_URL ||
        "https://blast-gear-backend.onrender.com";

      const res = await fetch(`${backendURL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          hcaptchaToken,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setResponseMessage("Thank you! Your message was sent successfully.");
        setForm({ name: "", email: "", message: "" });
        setHcaptchaToken("");
        hcaptchaRef.current.resetCaptcha();
      } else {
        setResponseMessage(data.error || "Something went wrong.");
      }
    } catch (error) {
      setResponseMessage("Server error. Please try again later.");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="name"
        placeholder="Your Name"
        value={form.name}
        onChange={handleChange}
        required
      />

      <input
        name="email"
        type="email"
        placeholder="Your Email"
        value={form.email}
        onChange={handleChange}
        required
      />

      <textarea
        name="message"
        placeholder="Your Message"
        value={form.message}
        onChange={handleChange}
        required
      />

      <HCaptcha
        sitekey="b220bebc-2484-4066-8238-ac40f7be4e32"
        onVerify={(token) => setHcaptchaToken(token)}
        ref={hcaptchaRef}
      />

      <button type="submit" disabled={loading}>
        {loading ? "Sending..." : "Send Message"}
      </button>

      {responseMessage && <p>{responseMessage}</p>}
    </form>
  );
}

export default ContactForm;
