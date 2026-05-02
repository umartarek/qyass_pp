# Copyright (c) 2024, IT Systematic and contributors
# For license information, please see license.txt

import frappe
from frappe import _

def execute(filters=None):
	# columns, data = [], []
	columns = get_columns(filters)
	data = get_data(filters)
	chart = get_chart(filters,columns,data)
	return columns, data, None,chart

def get_columns(filters: dict) -> list[dict]:
	"Get Report Columns"
	columns = []
	columns.append(
		{
			"label": _("Employee"),
			"fieldname": "employee",
			"fieldtype": "Link",
			"options": "Employee",
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

def get_data(filters: dict) -> list[frappe._dict]:
	"Get Report Data"
	conditions = get_conditions(filters)
	query = get_query(conditions)
	data = frappe.db.sql(query, as_dict=1)
	return data

def get_conditions(filters: dict) -> str:
	"Get Report Conditions"
	conditions_list = []
	if filters:
		if filters.get("digital_transformation_officer"):
			conditions_list.append(
				" dto.employee = '{employee}' ".format(employee=filters.get("digital_transformation_officer"))
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
			dto.employee, count(*) as count
		FROM
			`tabDigital Transformation Officer` AS dto
		{conditions}
		GROUP BY
			dto.employee
	""".format(
		conditions=conditions
	)
	return query

def get_chart(filters: dict, columns: list[dict], data: list[dict]) -> dict:
	"Get Report Chart"
	chart = {
		"data": {
			"labels": [],
			"datasets": [
				{
					"values": [
					],
				}
			],
		},
		"type": "bar",
		"colors": ["#449CF0"],
		"height": 500,
		"axisOptions": {
			"xAxisMode": "tick",
			"tickRotation": -90 
		}
			}
	for d in data:
		chart["data"]["labels"].append(d.get("employee"))
		chart["data"]["datasets"][0]["values"].append(d.get("count"))
	return chart
