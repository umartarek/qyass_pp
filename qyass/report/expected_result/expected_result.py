# Copyright (c) 2024, IT Systematic and contributors
# For license information, please see license.txt

import frappe
from frappe import _


def execute(filters=None):
    columns = get_columns(filters)
    data = get_data(filters)
    report_summary = get_report_summary(data)
    return columns, data, None,None, report_summary

def get_columns(filters=None):
    columns = [
        {
            "label": _("Elements-2024"),
            "fieldname": "element",
            "fieldtype": "Link",
            "options": "Elements-2024",
            "width": 200,
        },
        {
            "label": _("Element Weight"),
            "fieldname": "element_weight",
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
    return data

def get_conditions(filters=None):
    conditions_list = []
    if filters:
        if filters.get("element"):
            conditions_list.append(
                " ele.name = '{element}' ".format(element=filters.get("element"))
            )
        if filters.get("dimension"):
            conditions_list.append(
                " ele.dimension = '{dimension}' ".format(dimension=filters.get("dimension"))
            )
        if filters.get("vision"):
            conditions_list.append(
                " ele.vision = '{vision}' ".format(vision=filters.get("vision"))
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
    element_count = frappe.db.count('Elements-2024')
    return """SELECT
        ele.name as element,
        (1 / {element_count}) * 100 as element_weight,
        IF(SUM(child.completed),(SUM(child.completed) / count(child.name))*100,0) as completed_percent,
        ele.proof_count as proof_count,
        ele.completed_count as completed_count,
        ele.reviewed_count as reviewed_count
    FROM
        `tabElements-2024` ele
    LEFT JOIN
        `tabProof Document` child ON child.parent = ele.name
    {conditions}
    GROUP BY
        ele.name
    """.format(conditions=conditions,element_count=element_count)

def get_report_summary(data):
    
    result = 0
    for i in data:
        if i['completed_percent'] == 100:
            result += round(i['element_weight'],2)
    return [
        {
            "label": _("Project Completed Percent"),
            "value": result,
            "indicator": "green",
            "fieldtype": "Percent",
        }
    ]