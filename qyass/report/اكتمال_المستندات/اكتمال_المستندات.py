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
			"label": _("On Time"),
			"fieldname": "on_time",
			"fieldtype": "int",
			"width": 200,
		},
	)
	columns.append(
		{
			"label": _("Late"),
			"fieldname": "late_count",
			"fieldtype": "Int",
			"width": 200,
		},
	)
	return columns

def get_chart(filters: dict, columns: list[dict], data: list[dict]) -> dict:
	"Get Report Chart"
	chart = {
		"data": {
			"labels": ["On Time", "Late"],
			"datasets": [
				{
					"name": [_("On Time"),_("Late")],
					"values": [
						data[0].get("on_time"),
						data[0].get("late_count")
					],
				}
			],
		},
		"type": "pie",
		# "colors": ["#449CF0", "#F0C849"],
		"labels": ["On Time", "Late"],
		# "height": 300,
		# "stacked": True,
		# "stackType": "100%",
	}
	return chart


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
		if filters.get("evaluation"):
			conditions_list.append(
				" sge.evaluation = '{evaluation}' ".format(evaluation=filters.get("evaluation"))
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
            SUM(CASE WHEN sge.status='Completed' and DATEDIFF(sge.actual_end_date, sge.expected_end_date) > 10 THEN 1 ELSE 0 END) as late_count,
            SUM(CASE WHEN sge.status='Completed' and DATEDIFF(sge.actual_end_date, sge.expected_end_date) <= 10 THEN 1 ELSE 0 END) as on_time,
            SUM(CASE WHEN sge.status='Completed' THEN 1 ELSE 0 END) as total_count
        FROM
            `tabStandard Group Elements` AS sge
        {conditions}
    """.format(
        conditions=conditions
    )
    return query