from passlib.hash import pbkdf2_sha256 as pbkdf2
from passlib.hash import bcrypt


def generate_hash(password):
    return pbkdf2.hash(password)
    

def verify_password(password, hash):
    """Verify password against multiple hash algorithms.

    Supports:
    - pbkdf2_sha256 (passlib)
    - bcrypt (passlib)
    - plain-text fallback (if stored hash doesn't match known formats)
    """
    # Try pbkdf2_sha256
    try:
        if pbkdf2.identify(hash):
            return pbkdf2.verify(password, hash)
    except Exception:
        pass

    # Try bcrypt
    try:
        if bcrypt.identify(hash):
            return bcrypt.verify(password, hash)
    except Exception:
        pass

    # Fallback: direct comparison (old plain-text or other formats)
    try:
        return password == hash
    except Exception:
        return False