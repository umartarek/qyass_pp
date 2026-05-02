// Copyright (c) 2024, IT Systematic and contributors
// For license information, please see license.txt

frappe.query_reports["Expected Vision Result"] = {
	"filters": [
		{
			"label": __("Vision"),
			"fieldname": "vision",
			"fieldtype": "Link",
			"options": "Vision"
		}
	]
};
