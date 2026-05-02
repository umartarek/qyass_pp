"""
Contains frappe whitelist method to call from Page js
"""

import frappe

@frappe.whitelist()
def get_elements(*args, **kwargs) -> list[dict]:
    count_elements_by_evaluation = {}
    count_elements_by_document_status = {}
    count_elements_by_completeness_status = {}
    if kwargs.get("department"):
        department = frappe.db.escape(kwargs.get("department").strip())
        conditions = f" WHERE sge.department = {department}"

    else:
        conditions = ""

    elements = frappe.db.sql(
        f"""SELECT sge.* FROM `tabStandard Group Elements` sge {conditions}""",
        as_dict=1
    )
    # Get the count of elements grouped by evaluation of element
    count_elements_by_evaluation = frappe.db.sql(
        f"""SELECT evaluation, COUNT(*) as count FROM `tabStandard Group Elements` sge {conditions} GROUP BY evaluation""",
        as_dict=1
    )
    count_elements_by_document_status = frappe.db.sql(
        f"""SELECT document_status, COUNT(*) as count FROM `tabStandard Group Elements` sge {conditions} GROUP BY document_status""",
        as_dict=1
    )
    count_elements_by_completeness_status = frappe.db.sql(
        f"""SELECT custom_status, COUNT(*) as count FROM `tabStandard Group Elements` sge {conditions} GROUP BY custom_status""",
        as_dict=1
    )

    return {"elements": elements, "count_elements_by_evaluation": count_elements_by_evaluation, "count_elements_by_document_status": count_elements_by_document_status , "count_elements_by_completeness_status": count_elements_by_completeness_status}

@frappe.whitelist()
def get_departments(*args, **kwargs) -> list[dict]:
    departments = frappe.db.sql(
        """SELECT name FROM `tabDepartments`""",
        as_dict=1
    )
    
    return {"departments": departments}