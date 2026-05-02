import frappe

@frappe.whitelist(allow_guest=True)
def get_completed_sum():
    result = frappe.db.sql("""
        SELECT `Digital_Transformation_Officer`,`dimension`,`department`,`vision`,sum(count)
        FROM `emp_dep_dimension_vision`

    """, as_dict=True)
    return result

# @frappe.whitelist(allow_guest=True)
# def get_completed_sum():
#     result = frappe.db.sql("""
#         SELECT *
#         FROM `emp_dep_dimension_vision`
#         group by `Digital_Transformation_Officer`
#     """, as_dict=True)
#     return result

# @frappe.whitelist(allow_guest=True)
# def get_completed_sum():
#     result = frappe.db.sql("""
#         SELECT *
#         FROM `emp_dep_dimension_vision`
#         group by `Digital_Transformation_Officer`
#     """, as_dict=True)
#     return result