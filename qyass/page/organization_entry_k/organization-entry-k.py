"""
Contains frappe whitelist method to call from Page js
"""

import frappe

@frappe.whitelist()
def get_data(*args, **kwargs) -> list[dict]:
    data = frappe.db.sql(
        """SELECT * FROM `tabStandard Group Elements`""",
        as_dict=1
    )
    
    return {"data": data}
