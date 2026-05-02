
from qyass.api.auth.login import signin
import frappe


@frappe.whitelist(allow_guest=True)
def login(usr: str, pwd: str) -> None:
    signin(usr, pwd)

@frappe.whitelist(allow_guest=False)
def sayWelcome():
    return "welcome"