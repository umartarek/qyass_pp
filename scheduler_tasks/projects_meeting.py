"""
This module contains a scheduler function that checks for "Projects Meeting" documents and indicates the meetings that have been completed.

The scheduler runs the function every minute to ensure that the updated status of meetings is reflected in the system.
"""

import frappe
from frappe.utils import now_datetime

def check_completed_meetings():
    PM_with_status_zero = frappe.db.get_list(doctype="Projects Meeting",
                                            filters={"meeting_done": 0}, fields=["name", "meeting_date"])
    for doc in PM_with_status_zero:
        if now_datetime() > doc["meeting_date"]:
            frappe.set_value("Projects Meeting", doc["name"],
                            {"meeting_done": 1, "status": "After"})
            frappe.db.commit()
