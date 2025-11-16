import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import logging

logger = logging.getLogger(__name__)

SMTP_HOST = os.getenv('SMTP_HOST')
SMTP_PORT = int(os.getenv('SMTP_PORT', 587))
SMTP_USER = os.getenv('SMTP_USER')
SMTP_PASSWORD = os.getenv('SMTP_PASSWORD')
ADMIN_EMAIL = os.getenv('ADMIN_EMAIL')


def send_email(to_email, subject, html_content):
    """Send email using Gmail SMTP"""
    try:
        msg = MIMEMultipart('alternative')
        msg['From'] = SMTP_USER
        msg['To'] = to_email
        msg['Subject'] = subject
        
        html_part = MIMEText(html_content, 'html')
        msg.attach(html_part)
        
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
        
        logger.info(f"Email sent successfully to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Error sending email to {to_email}: {str(e)}")
        return False


def send_admin_order_notification(order):
    """Send order notification to admin"""
    customer = order.customer
    
    items_html = ""
    for item in order.items:
        items_html += f"""
        <tr>
            <td style="padding: 10px; border: 1px solid #ddd;">{item.name}</td>
            <td style="padding: 10px; border: 1px solid #ddd;">{item.size}</td>
            <td style="padding: 10px; border: 1px solid #ddd;">{item.quantity}</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${item.price:.2f}</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${(item.price * item.quantity):.2f}</td>
        </tr>
        """
    
    html_content = f"""
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; }}
            .container {{ max-width: 800px; margin: 0 auto; padding: 20px; }}
            .header {{ background-color: #C4B5A0; color: white; padding: 20px; text-align: center; }}
            .content {{ padding: 20px; background-color: #f9f9f9; }}
            table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
            th {{ background-color: #C4B5A0; color: white; padding: 10px; text-align: left; }}
            td {{ padding: 10px; border: 1px solid #ddd; }}
            .section {{ margin: 20px 0; }}
            .section-title {{ font-weight: bold; color: #6B4E37; margin-bottom: 10px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎯 New Order Received - BLAST Gear</h1>
            </div>
            <div class="content">
                <h2>Order #{order.orderId}</h2>
                
                <div class="section">
                    <div class="section-title">📦 Order Items:</div>
                    <table>
                        <tr>
                            <th>Product</th>
                            <th>Size</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Total</th>
                        </tr>
                        {items_html}
                    </table>
                </div>
                
                <div class="section">
                    <div class="section-title">💰 Order Summary:</div>
                    <table>
                        <tr>
                            <td><strong>Subtotal:</strong></td>
                            <td>${order.subtotal:.2f}</td>
                        </tr>
                        <tr>
                            <td><strong>Shipping:</strong></td>
                            <td>${order.shipping:.2f}</td>
                        </tr>
                        <tr>
                            <td><strong>Tax:</strong></td>
                            <td>${order.tax:.2f}</td>
                        </tr>
                        <tr style="background-color: #C4B5A0; color: white;">
                            <td><strong>TOTAL:</strong></td>
                            <td><strong>${order.total:.2f}</strong></td>
                        </tr>
                    </table>
                </div>
                
                <div class="section">
                    <div class="section-title">👤 Customer Information:</div>
                    <table>
                        <tr>
                            <td><strong>Name:</strong></td>
                            <td>{customer.firstName} {customer.lastName}</td>
                        </tr>
                        <tr>
                            <td><strong>Email:</strong></td>
                            <td>{customer.email}</td>
                        </tr>
                        <tr>
                            <td><strong>Phone:</strong></td>
                            <td>{customer.phone}</td>
                        </tr>
                    </table>
                </div>
                
                <div class="section">
                    <div class="section-title">📍 Shipping Address:</div>
                    <table>
                        <tr>
                            <td>
                                {customer.address}<br>
                                {customer.city}, {customer.state} {customer.zipCode}<br>
                                {customer.country}
                            </td>
                        </tr>
                    </table>
                </div>
                
                <div class="section" style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107;">
                    <strong>⚡ Action Required:</strong> Please prepare this order for custom creation and shipping.
                </div>
            </div>
        </div>
    </body>
    </html>
    """
    
    return send_email(
        ADMIN_EMAIL,
        f"🎯 New BLAST Gear Order #{order.orderId}",
        html_content
    )


def send_customer_order_confirmation(order):
    """Send order confirmation to customer"""
    customer = order.customer
    
    items_html = ""
    for item in order.items:
        items_html += f"""
        <tr>
            <td style="padding: 10px; border: 1px solid #ddd;">
                <img src="{item.image}" alt="{item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
            </td>
            <td style="padding: 10px; border: 1px solid #ddd;">{item.name}</td>
            <td style="padding: 10px; border: 1px solid #ddd;">{item.size}</td>
            <td style="padding: 10px; border: 1px solid #ddd;">{item.quantity}</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${(item.price * item.quantity):.2f}</td>
        </tr>
        """
    
    html_content = f"""
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; }}
            .container {{ max-width: 700px; margin: 0 auto; padding: 20px; }}
            .header {{ background-color: #C4B5A0; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }}
            .content {{ padding: 30px; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px; }}
            table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
            th {{ background-color: #f5f5f5; padding: 12px; text-align: left; border: 1px solid #ddd; }}
            td {{ padding: 10px; border: 1px solid #ddd; }}
            .total-row {{ background-color: #C4B5A0; color: white; font-weight: bold; }}
            .info-box {{ background-color: #f9f9f9; padding: 20px; border-radius: 6px; margin: 20px 0; }}
            .footer {{ text-align: center; color: #888; padding: 20px; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 style="margin: 0;">🎉 Thank You for Your Order!</h1>
                <p style="margin: 10px 0 0 0; font-size: 18px;">BLAST Gear</p>
            </div>
            <div class="content">
                <p>Hi {customer.firstName},</p>
                <p>Thank you for your order! We're excited to create your custom t-shirts.</p>
                
                <div class="info-box">
                    <h3 style="margin-top: 0; color: #6B4E37;">📋 Order Details</h3>
                    <p><strong>Order Number:</strong> {order.orderId}</p>
                    <p><strong>Order Date:</strong> {order.createdAt.strftime('%B %d, %Y')}</p>
                    <p><strong>Status:</strong> {order.status}</p>
                </div>
                
                <h3 style="color: #6B4E37;">Your Items:</h3>
                <table>
                    <tr>
                        <th>Image</th>
                        <th>Product</th>
                        <th>Size</th>
                        <th>Qty</th>
                        <th>Total</th>
                    </tr>
                    {items_html}
                </table>
                
                <table style="margin-top: 20px;">
                    <tr>
                        <td><strong>Subtotal:</strong></td>
                        <td style="text-align: right;">${order.subtotal:.2f}</td>
                    </tr>
                    <tr>
                        <td><strong>Shipping:</strong></td>
                        <td style="text-align: right;">${order.shipping:.2f}</td>
                    </tr>
                    <tr>
                        <td><strong>Tax:</strong></td>
                        <td style="text-align: right;">${order.tax:.2f}</td>
                    </tr>
                    <tr class="total-row">
                        <td><strong>TOTAL:</strong></td>
                        <td style="text-align: right;"><strong>${order.total:.2f}</strong></td>
                    </tr>
                </table>
                
                <div class="info-box">
                    <h3 style="margin-top: 0; color: #6B4E37;">📍 Shipping Address</h3>
                    <p style="margin: 5px 0;">
                        {customer.firstName} {customer.lastName}<br>
                        {customer.address}<br>
                        {customer.city}, {customer.state} {customer.zipCode}<br>
                        {customer.country}
                    </p>
                </div>
                
                <div style="background-color: #e8f5e9; padding: 20px; border-radius: 6px; border-left: 4px solid #4caf50;">
                    <h3 style="margin-top: 0; color: #2e7d32;">✨ What's Next?</h3>
                    <p style="margin: 5px 0;">• Your custom t-shirts are being prepared</p>
                    <p style="margin: 5px 0;">• We'll send you a tracking number once shipped</p>
                    <p style="margin: 5px 0;">• Track your order anytime at: <a href="https://blastgear.shop">blastgear.shop</a></p>
                </div>
                
                <p style="margin-top: 30px;">Questions? Contact us at <a href="mailto:blastgear.shop@blastmusic247.com">blastgear.shop@blastmusic247.com</a></p>
                
                <p style="margin-top: 30px;">Thank you for choosing BLAST Gear! 🚀</p>
            </div>
            <div class="footer">
                <p>© 2025 BLAST Gear - Bold Apparel<br>
                Orlando, FL</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return send_email(
        customer.email,
        f"Order Confirmation - BLAST Gear #{order.orderId}",
        html_content
    )
