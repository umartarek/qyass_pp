# Copyright (c) 2024, IT Systematic and contributors
# For license information, please see license.txt

import frappe
from frappe import _


def execute(filters=None):
	# columns, data = [], []
	columns = get_columns(filters)
	data = get_data(filters)
	return columns, data

def get_columns(filters: dict) -> list[dict]:
	"Get Report Columns"
	columns = []
	columns.append(
		{
			"label": _("Department"),
			"fieldname": "department",
			"fieldtype": "Link",
			"options": "Departments",
			"width": 200,
		},
	)
	columns.append(
		{
			"label": _("Count"),
			"fieldname": "count",
			"fieldtype": "Int",
			"width": 200,
		},
	)
	return columns

def get_data(filters: dict) -> list[dict]:
	"Get Report Data"
	conditions = get_conditions(filters)
	query = get_query(conditions)
	data = frappe.db.sql(query, as_dict=1)
	return data

def get_conditions(filters: dict) -> str:
	"Get Report Conditions"
	conditions_list = []
	if filters:
		if filters.get("department"):
			conditions_list.append(
				" sge.department = '{department}' ".format(department=filters.get("department"))
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
			sge.department, count(*) as count
		FROM
			`tabStandard Group Elements` AS sge
		{conditions}
		GROUP BY
			sge.department
	""".format(
		conditions=conditions
	)
	return query