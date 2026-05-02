import frappe
import base64
from frappe.core.doctype.user.user import User

def generate_keys(user: str) -> str:
    """
    Generate or retrieve API keys for the given user.

    Args:
        user (str): Username

    Returns:
        str: Base64 encoded access token
    """
    user_doc: User = frappe.get_doc("User", user)
    
    if user_doc.api_key:
        api_key = user_doc.api_key
        api_secret = user_doc.get_password('api_secret', raise_exception=False)
    else:
        api_key = frappe.generate_hash(length=15)
        api_secret = frappe.generate_hash(length=15)
        
        user_doc.api_key = api_key
        user_doc.api_secret = api_secret
        user_doc.save(ignore_permissions=True)

    return base64.b64encode(f'{api_key}:{api_secret}'.encode()).decode()