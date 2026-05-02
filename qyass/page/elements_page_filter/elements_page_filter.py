"""
Contains frappe whitelist method to call from Page js
"""

import frappe

@frappe.whitelist()
def get_elements(*args, **kwargs) -> list[frappe._dict]:
    conditions = f" WHERE oe.organization = '{kwargs.get('organization')}' "
    if kwargs.get("evaluation"):
        conditions += f" AND ect.evaluation = '{kwargs.get('evaluation')}' "
    if kwargs.get("department"):
        conditions += f" AND sge.department = '{kwargs.get('department')}' "
    if kwargs.get("digital_transformation_officer"):
        conditions += f" AND sge.digital_transformation_officer = '{kwargs.get('digital_transformation_officer')}' "
    if kwargs.get("standard"):
        conditions += f" AND sge.standard = '{kwargs.get('standard')}' "
    data = frappe.db.sql(
        """
        SELECT 
            oe.name, oe.year,
            ect.element, ect.element_name, ect.evaluation, ect.recommendations
        FROM `tabOrganization Entry` AS oe
        LEFT JOIN `tabElements Child Table` AS ect
            ON oe.name = ect.parent
        LEFT JOIN `tabStandard Group Elements` AS sge
            ON ect.element = sge.name
        {conditions}
        ORDER BY ect.element;
        """.format(conditions=conditions),
        as_dict=1
    )
    return {"elements": data}
