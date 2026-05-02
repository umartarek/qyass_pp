// Copyright (c) 2024, IT Systematic and contributors
// For license information, please see license.txt

frappe.query_reports["Digital Transformation Officer"] = {
	"filters": [
		{
            "fieldname":"digital_transformation_officer",
            "label": __("Employee"),
            "fieldtype": "Link",
            "options": "Employee",
        },
	]
};
