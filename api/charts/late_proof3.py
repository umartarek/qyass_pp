import frappe

@frappe.whitelist(allow_guest=True)
# def get_completed_sum():
#     result = frappe.db.sql("""
#         SELECT sum(`proof_count`) as total, `digital_transformation_officer`, `dimension`, `department` 
#         FROM `tabElements-2024`
#         WHERE `is_late` = 1
#         GROUP BY `digital_transformation_officer`
#     """, as_dict=True)
#     return result
def get_completed_sum():
    result = frappe.db.sql("""
        SELECT sum(`proof_count`) as total,department " الادارة ",`digital_transformation_officer`,element " المعيار " , expected_end_date " التاريخ المتوقع ",DATEDIFF(CURDATE(),expected_end_date) " الايام المتاخرة" 
        FROM `tabElements-2024` 
        WHERE CURDATE() > expected_end_date 
        GROUP BY `digital_transformation_officer`
    """, as_dict=True)
    return result