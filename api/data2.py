import frappe
from frappe import _

@frappe.whitelist(allow_guest=True)
def get_all_qyass_emp_dailywork():
    """
    Fetch all records from Qyass_emp_dailywork, including data from its child table, using SQL.
    """
    try:
        # SQL query to fetch all parent records
        parent_query = """
            SELECT * FROM `tabQyass_emp_dailywork`
        """
        parent_records = frappe.db.sql(parent_query, as_dict=True)

        # Add child table data for each parent record
        for record in parent_records:
            # SQL query to fetch related child table data
            child_query = """
                SELECT * FROM `tabQyass_emp_dailywork_child`
                WHERE parent = %s
            """
            # Attach the child records to the parent under the key "child_table"
            record['child_table'] = frappe.db.sql(child_query, (record['name'],), as_dict=True)

        # Return both parent and child data
        return {
            "status": "success",
            "data": parent_records
        }
    except Exception as e:
        # Log the error for debugging
        frappe.log_error(frappe.get_traceback(), _("Error fetching Qyass_emp_dailywork records"))
        return {
            "status": "error",
            "message": str(e)
        }
