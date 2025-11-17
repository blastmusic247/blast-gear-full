import HCaptcha from "@hcaptcha/react-hcaptcha";
import { useState } from "react";

function ContactForm() {
  const [token, setToken] = useState("");

  const handleVerify = (token) => {
    setToken(token);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!token) {
      alert("Please complete the CAPTCHA.");
      return;
    }

    // Continue normal form submit…
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Your form fields */}

      <HCaptcha
        sitekey={process.env.REACT_APP_HCAPTCHA_SITE_KEY}
        onVerify={handleVerify}
      />

      <button type="submit">Send</button>
    </form>
  );
}

export default ContactForm;
