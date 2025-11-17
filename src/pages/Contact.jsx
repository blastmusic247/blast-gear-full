import React from "react";
import ContactForm from "../components/ContactForm";

function Contact() {
  return (
    <div className="contact-page" style={{ maxWidth: "700px", margin: "0 auto", padding: "2rem" }}>
      <h1 style={{ textAlign: "center" }}>Contact Us</h1>
      <p style={{ textAlign: "center", marginBottom: "2rem" }}>
        Have a question? Send us a message below.
      </p>

      <div className="contact-form-container">
        <ContactForm />
      </div>
    </div>
  );
}

export default Contact;
