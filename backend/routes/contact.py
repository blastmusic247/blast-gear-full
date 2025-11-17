from fastapi import APIRouter, HTTPException
from models import ContactForm
import os
import requests
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

HCAPTCHA_SECRET = os.getenv("HCAPTCHA_SECRET")


def verify_hcaptcha(token: str) -> bool:
    """Verify hCaptcha token with hcaptcha.com"""
    url = "https://hcaptcha.com/siteverify"
    data = {
        "secret": HCAPTCHA_SECRET,
        "response": token
    }

    try:
        response = requests.post(url, data=data)
        result = response.json()
        return result.get("success", False)
    except Exception as e:
        logger.error(f"hCaptcha verification error: {str(e)}")
        return False


@router.post("/contact")
async def submit_contact_form(form: ContactForm):
    """
    Submit contact form with hCaptcha verification
    """
    if not HCAPTCHA_SECRET:
        logger.error("HCAPTCHA_SECRET not set in environment")
        raise HTTPException(status_code=500, detail="Captcha configuration missing")

    # Verify hCaptcha token
    if not verify_hcaptcha(form.hcaptchaToken):
        logger.error("hCaptcha failed verification")
        raise HTTPException(status_code=400, detail="hCaptcha verification failed")

    # Log submitted message (or later: send email)
    logger.info(f"Contact form submitted by {form.name} ({form.email}): {form.message}")

    return {
        "success": True,
        "message": "Thank you for contacting us. We'll get back to you soon!"
    }
