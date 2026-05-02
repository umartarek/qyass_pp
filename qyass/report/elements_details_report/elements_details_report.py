# Copyright (c) 2024, IT Systematic and contributors
# For license information, please see license.txt

import frappe
from frappe import _


def execute(filters=None):
    if not filters:
        filters = {}
    columns, data = [], []
    columns = get_columns(filters)
    data = get_data(filters)
    return columns, data


def get_columns(filters: dict) -> list[dict]:
    "Get Report Columns"
    columns = []
    if not filters.get("standard"):
        columns.append(
            {
                "label": _("Standard"),
                "fieldname": "standard",
                "fieldtype": "Link",
                "options": "Standards",
                "width": 200,
            },
        )
    if not filters.get("group"):
        columns.append(
            {
                "label": _("Group"),
                "fieldname": "group",
                "fieldtype": "Link",
                "options": "Standard Group",
                "width": 200,
            },
        )
    columns.append(
        {
            "label": _("Element"),
            "fieldname": "element",
            "fieldtype": "Link",
            "options": "Standard Group Elements",
            "width": 200,
        },
    )

    return columns


def get_data(filters: dict) -> list[frappe._dict]:
    "Get Report Data"
    data = _get_data(filters)
    return data


def _get_data(filters: dict) -> list[frappe._dict]:
    "Get Report Data"
    conditions = get_conditions(filters)
    query = get_query(conditions)
    data = frappe.db.sql(query, as_dict=1)
    return data


def get_conditions(filters: dict) -> str:
    "Get Report Conditions"
    conditions_list = []
    if filters:
        if filters.get("standard"):
            conditions_list.append(
                " sge.standard = '{standard}' ".format(standard=filters.get("standard"))
            )
        if filters.get("group"):
            conditions_list.append(
                " sge.group = '{group}' ".format(group=filters.get("group"))
            )

    conditions = (
        " AND ".join(conditions_list)
        if len(conditions_list) > 1
        else conditions_list[0]
        if len(conditions_list) == 1
        else ""
    )
    return "WHERE " + conditions if conditions else conditions


def get_query(conditions: str) -> str:
    "Get Report Query"
    query = """
        SELECT 
            sge.standard, sge.group, sge.name AS element
        FROM
            `tabStandard Group Elements` AS sge
        {conditions}
    """.format(
        conditions=conditions
    )
    return query
