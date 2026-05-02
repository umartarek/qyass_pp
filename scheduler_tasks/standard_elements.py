import frappe
from frappe.utils import datetime
def check_late_elements():
    elements = frappe.db.get_all('Standard Group Elements', fields=['*'], filters={'is_late': '0'})
    for element in elements:
        if element.expected_end_date:
            if datetime.date.today() > element.expected_end_date and element.custom_status == 'Approved':
                element = frappe.get_doc('Standard Group Elements', element.name)
                element.is_late = 1
                element.save()