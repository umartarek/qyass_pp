
import frappe

@frappe.whitelist()
def get_employees():
    employees = frappe.get_list('Employee', fields=['name'])
    if employees:
        for emp in employees:
            emp_name = emp.get("name")
            conditions = f" INNER JOIN `tabDigital Transformation Officer` dto ON dto.employee = '{emp_name}' AND dto.parent = ele.name"
            emp['count_elements_by_evaluation'] = frappe.db.sql(
                f"""SELECT evaluation, COUNT(*) as count FROM `tabElements-2024` ele {conditions} GROUP BY evaluation""",
                as_dict=1
            )
            emp['count_elements_by_completeness_status'] = frappe.db.sql(
                f"""SELECT custom_status, COUNT(*) as count FROM `tabElements-2024` ele {conditions} GROUP BY custom_status""",
                as_dict=1
            )
    frappe.errprint(employees)
    return {"employees": employees}

@frappe.whitelist()
def get_departments():
    departments = frappe.get_list('Departments', fields=['department'])
    if departments:
        for department in departments:
            dep = department.get("department")
            conditions = f" WHERE ele.department = '{dep}'"
            department['count_elements_by_evaluation'] = frappe.db.sql(
                f"""SELECT evaluation, COUNT(*) as count FROM `tabElements-2024` ele {conditions} GROUP BY evaluation""",
                as_dict=1
            )
            department['count_elements_by_completeness_status'] = frappe.db.sql(
                f"""SELECT custom_status, COUNT(*) as count FROM `tabElements-2024` ele {conditions} GROUP BY custom_status""",
                as_dict=1
            )
    frappe.errprint(departments)
    return {"departments": departments}

@frappe.whitelist()
def get_totals(*args, **kwargs) -> list[dict]:
    element_count = frappe.db.count('Elements-2024')
    
    # Get the count of elements grouped by evaluation of element
    count_elements_by_evaluation = frappe.db.get_list('Elements-2024',fields=['count(name) as count', 'evaluation'],group_by='evaluation')
    
    # Get the count of elements grouped by evaluation of element
    count_elements_by_completeness_status = frappe.db.get_list('Elements-2024',fields=['count(name) as count', 'custom_status'],group_by='custom_status')
    
    return {"element_count":element_count,"count_elements_by_evaluation":count_elements_by_evaluation,"count_elements_by_completeness_status":count_elements_by_completeness_status}