"""
Contains frappe whitelist method to call from Page js
"""

import frappe

@frappe.whitelist()
def get_elements(*args, **kwargs) -> list[dict]:
    count_elements_by_evaluation = {}
    count_elements_by_document_status = {}
    count_elements_by_completeness_status = {}
    if kwargs.get("employee"):
        employee = frappe.db.escape(kwargs.get("employee").strip())
        conditions = f" INNER JOIN `tabDigital Transformation Officer` dto ON dto.employee = {employee} AND dto.parent = ele.name"
        

    else:
        conditions = ""

    elements = frappe.db.sql(
        f"""SELECT ele.* FROM `tabElements-2024` ele {conditions}""",
        as_dict=1
    )
    # Get the count of elements grouped by evaluation of element
    count_elements_by_evaluation = frappe.db.sql(
        f"""SELECT evaluation, COUNT(*) as count FROM `tabElements-2024` ele {conditions} GROUP BY evaluation""",
        as_dict=1
    )
    # count_elements_by_document_status = frappe.db.sql(
    #     f"""SELECT document_status, COUNT(*) as count FROM `tabElements-2024` sge {conditions} GROUP BY document_status""",
    #     as_dict=1
    # )
    count_elements_by_completeness_status = frappe.db.sql(
        f"""SELECT custom_status, COUNT(*) as count FROM `tabElements-2024` ele {conditions} GROUP BY custom_status""",
        as_dict=1
    )

    return {"elements": elements, "count_elements_by_evaluation": count_elements_by_evaluation, "count_elements_by_completeness_status": count_elements_by_completeness_status}

@frappe.whitelist()
def get_employees(*args, **kwargs) -> list[dict]:
    employees = frappe.db.sql(
        """SELECT name FROM `tabEmployee`""",
        as_dict=1
    )
    
    return {"employees": employees}