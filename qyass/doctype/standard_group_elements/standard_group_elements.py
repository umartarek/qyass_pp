# Copyright (c) 2024, IT Systematic and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class StandardGroupElements(Document):
    pass


@frappe.whitelist()
@frappe.validate_and_sanitize_search_inputs
def get_standard_group_list(doctype, txt, searchfield, start, page_len, filters):
    if filters.get("standard") != "":
        return frappe.get_all("Standard Group", fields=["name", "group"], filters={"standard": filters.get("standard")}, as_list=1)
    return frappe.get_all("Standard Group", fields=["name", "group"], as_list=1)


def get_permission_query_conditions(user):
	if not user:
		user = frappe.session.user
	# return """( `tabStandard Group Elements`.`standard` != '' order by `tabStandard Group Elements`.`group` asc)"""


@frappe.whitelist()
def get_element_number():
    num = frappe.db.sql("""
                  select count(*) as num from `tabStandard Group Elements`;
                  """,as_dict=True)
    return num[0]