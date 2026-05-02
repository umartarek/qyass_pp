import frappe

@frappe.whitelist(allow_guest=True)
def get_completed_sum():
    result = frappe.db.sql("""
        SELECT sum(total) as `totall`, sum(completed) as `complete`, sum(reviewed) as `reviewed` , sum(not_completed) as `not_com` 
        FROM `qyass_numberss` 
    """, as_dict=True)
    return result
