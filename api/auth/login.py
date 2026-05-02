import frappe
from frappe.auth import LoginManager
from ..helper_method import generate_keys
from frappe import _


def signin(usr: str, pwd: str) -> None:
    """
    Handle the login endpoint, allowing login with either username or email.

    Args:
        usr (str): Username or Email
        pwd (str): Password

    Returns:
        None: Response is set in frappe.local.response
    """
    try:
        # Authenticate user by username or email
        user_id = get_user_id(usr)
        if not user_id:
            raise frappe.AuthenticationError
        
        authenticate_user(user_id, pwd)
        set_login_response(user_id)
    
    except frappe.AuthenticationError:
        set_error_response(_("AuthenticationError"), _("Invalid username, email, or password"))
    except Exception as e:
        set_error_response(_("Error"), f"An unexpected error occurred: {str(e)}")


def get_user_id(usr: str) -> str:
    """
    Get the user ID based on the username or email.

    Args:
        usr (str): Username or Email

    Returns:
        str: User ID if found, else None
    """
    user = frappe.db.get_value("User", {"username": usr}) or frappe.db.get_value("User", {"email": usr})
    return user


def authenticate_user(user_id: str, pwd: str) -> None:
    """
    Authenticate the user with the given user ID and password.

    Args:
        user_id (str): User ID
        pwd (str): Password

    Returns:
        None: Raises AuthenticationError if authentication fails
    """
    login_manager = LoginManager()
    login_manager.authenticate(user=user_id, pwd=pwd)
    login_manager.post_login()


def set_login_response(user_id: str) -> None:
    """
    Set the login response with user data and token.

    Args:
        user_id (str): User ID

    Returns:
        None: Response is set in frappe.local.response
    """
    try:
        user = frappe.get_doc("User", user_id)
        access_token = generate_keys(user.name)
        
        frappe.db.commit()
        
        frappe.local.response["message"] = {
            "status": _("Success"),
            'token': access_token,
            "username": user.username or "",
            "user_id": user.name,
            "email": user.email or "",
            "full_name": user.full_name or "",
            "gender": user.gender or "",
            "birth_date": user.birth_date or "",
            "phone": user.phone or "",
            "mobile_no": user.mobile_no or "",
        }
    except Exception as e:
        frappe.db.rollback()
        set_error_response(_("Error"), f"An error occurred while processing user data: {str(e)}")


def set_error_response(status: str, message: str) -> None:
    """
    Set an error response.

    Args:
        status (str): Status of the error
        message (str): Error message

    Returns:
        None: Response is set in frappe.local.response
    """
    frappe.local.response["message"] = {
        "status": status,
        "message": message,
    }