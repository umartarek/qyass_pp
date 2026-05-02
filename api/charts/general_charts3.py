import frappe

@frappe.whitelist(allow_guest=True)
def get_completed_sum():
    result = frappe.db.sql("""
        SELECT vision, totall,complete,reviewed , not_com 
        FROM `vision_table` 
        Group By `vision`
    """, as_dict=True)
    return result
