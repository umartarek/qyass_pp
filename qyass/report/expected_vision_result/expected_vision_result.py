# Copyright (c) 2024, IT Systematic and contributors
# For license information, please see license.txt

import frappe
from frappe import _


def execute(filters=None):
    columns = get_columns(filters)
    data = get_data(filters)
    # report_summary = get_report_summary(data)
    return columns, data, None,None

def get_columns(filters=None):
    columns = [
        {
            "label": _("Vision"),
            "fieldname": "vision",
            "fieldtype": "Link",
            "options": "Vision",
            "width": 200,
        },
        {
            "label": _("Vision Weight"),
            "fieldname": "vision_weight",
            "fieldtype": "Percent",
            "width": 200,
        },
        {
            "label": _("Completed Percent"),
            "fieldname": "completed_percent",
            "fieldtype": "Percent",
            "width": 200,
        },
        {
            "label": _("Proof Document Count"),
            "fieldname": "proof_count",
            "fieldtype": "Data",
            "width": 200,
        },
        {
            "label": _("Completed Proof Count"),
            "fieldname": "completed_count",
            "fieldtype": "Data",
            "width": 200,
        },
        {
            "label": _("Reviewed Proof Count"),
            "fieldname": "reviewed_count",
            "fieldtype": "Data",
            "width": 200,
        },
    ]
    return columns

def get_data(filters=None):
    conditions = get_conditions(filters)
    query = get_query(conditions)
    data = frappe.db.sql(query, as_dict=1)
    element_count = frappe.db.count('Elements-2024')
    dimension_data = frappe.db.sql(f"""SELECT
        dim.name as dimension,
        dim.vision as vision
    FROM
        `tabDimension` dim
    """,as_dict=1)
    
    element_data = frappe.db.sql(f"""SELECT
        ele.name as element,
        (1 / {element_count}) * 100 as element_weight,
        IF(SUM(child.completed),(SUM(child.completed) / count(child.name))*100,0) as completed_percent,
        ele.dimension as dimension,
        ele.proof_count as proof_count,
        ele.completed_count as completed_count,
        ele.reviewed_count as reviewed_count
    FROM
        `tabElements-2024` ele
    LEFT JOIN
        `tabProof Document` child ON child.parent = ele.name
    GROUP BY
        ele.name""", as_dict=1)
    
    for dim in dimension_data:
        dim['proof_count'] = sum(map(lambda x: int(x['proof_count']) if x['dimension'] == dim['dimension'] else 0, element_data))
        dim['completed_count'] = sum(map(lambda x: int(x['completed_count']) if x['dimension'] == dim['dimension'] else 0, element_data))
        dim['reviewed_count'] = sum(map(lambda x: int(x['reviewed_count']) if x['dimension'] == dim['dimension'] else 0, element_data))
        dim['dimension_weight'] = sum(map(lambda x: x['element_weight'] if x['dimension'] == dim['dimension'] else 0, element_data))
        dim['completed_percent'] = (sum(map(lambda x: x['element_weight'] if x['dimension'] == dim['dimension'] and x['completed_percent'] == 100 else 0, element_data)) / (len([e for e in element_data if e['dimension'] == dim['dimension']]) or 1))* 100

    for vision in data:
        vision['proof_count'] = sum(map(lambda x: int(x['proof_count']) if x['vision'] == vision['vision'] else 0, dimension_data))
        vision['completed_count'] = sum(map(lambda x: int(x['completed_count']) if x['vision'] == vision['vision'] else 0, dimension_data))
        vision['reviewed_count'] = sum(map(lambda x: int(x['reviewed_count']) if x['vision'] == vision['vision'] else 0, dimension_data))
        vision['vision_weight'] = sum(map(lambda x: x['dimension_weight'] if x['vision'] == vision['vision'] else 0, dimension_data))
        vision['completed_percent'] = (sum(map(lambda x: x['dimension_weight'] if x['vision'] == vision['vision'] and x['completed_percent'] == 100 else 0, dimension_data)) / (len([e for e in dimension_data if e['vision'] == vision['vision']]) or 1 ))* 100
    
    return data

def get_conditions(filters=None):
    conditions_list = []
    if filters:
        if filters.get("dimension"):
            conditions_list.append(
                " dim.name = '{dimension}' ".format(dimension=filters.get("dimension"))
            )
        if filters.get("vision"):
            conditions_list.append(
                " dim.vision = '{vision}' ".format(vision=filters.get("vision"))
            )

    conditions = (
        " AND ".join(conditions_list)
        if len(conditions_list) > 1
        else conditions_list[0]
        if len(conditions_list) == 1
        else ""
    )
    return "WHERE " + conditions if conditions else conditions

def get_query(conditions):
    vision_count = frappe.db.count('Vision')
    return """SELECT
        vis.name as vision
    FROM
        `tabVision` vis
    {conditions}
    """.format(conditions=conditions,vision_count=vision_count)

def get_report_summary(data):
    
    result = 0
    for i in data:
        if i['completed_percent'] == 100:
            result += round(i['vision_weight'],2)
    return [
        {
            "label": _("Project Completed Percent"),
            "value": result,
            "indicator": "green",
            "fieldtype": "Percent",
        }
    ]