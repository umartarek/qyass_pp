# Copyright (c) 2023, IT Systematic and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class Elements(Document):
	pass


@frappe.whitelist()
@frappe.validate_and_sanitize_search_inputs
def get_standard_group_list(doctype, txt, searchfield, start, page_len, filters):
	return frappe.get_all("Standard Group", fields=["name", "group"], filters={"standard": filters.get("standard")}, as_list=1)
