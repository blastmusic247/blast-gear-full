# BLAST Gear Admin Credentials

## Admin Panel Access

**URL:** `http://localhost:3000/admin` (or your deployed URL + `/admin`)

**Credentials:**
- **Username:** `admin`
- **Password:** `admin123`

## Important Notes

1. **Login Page Changes:**
   - ✅ Username and password are no longer displayed on the login page (removed for security)
   - ✅ Error messages now show when you enter incorrect credentials
   - ✅ reCAPTCHA is bypassed in development mode

2. **Error Messages:**
   - If you enter incorrect username or password, you'll see: "Incorrect username or password. Please check your credentials."
   - Other login errors will show appropriate messages

3. **Security Recommendations:**
   - Change the admin password in production
   - To change password, generate a new hash and update `ADMIN_PASSWORD_HASH` in `/app/backend/.env`
   - You can generate a hash using Python:
     ```python
     from passlib.context import CryptContext
     pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
     print(pwd_context.hash("your_new_password"))
     ```

4. **Current Configuration:**
   - Username is stored in: `/app/backend/.env` as `ADMIN_USERNAME`
   - Password hash is stored in: `/app/backend/.env` as `ADMIN_PASSWORD_HASH`
   - Current hash corresponds to password: `admin123`

## Admin Panel Features

Once logged in, you can access:
- **Orders Management** - View, update status, refund, and delete orders
- **Products Management** - Add, edit, delete products with image upload
- **Promo Codes** - Create and manage discount codes

---

**Keep these credentials secure and change them for production deployment!**
