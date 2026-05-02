import frappe

@frappe.whitelist(allow_guest=True)
def get_completed_sum():
    result = frappe.db.sql("""
        SELECT *
        FROM `employee_table`
    """, as_dict=True)
    return result
