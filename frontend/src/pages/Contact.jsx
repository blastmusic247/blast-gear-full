import React from "react";
import ContactForm from "../components/ContactForm";

function Contact() {
  return (
    <div className="contact-page">
      <h1>Contact Us</h1>
      <p>Have a question? Send us a message below.</p>

      <div className="contact-form-container">
        <ContactForm />
      </div>
    </div>
  );
}

export default Contact;
