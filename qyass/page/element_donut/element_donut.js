frappe.pages['element-donut'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'ha',
		single_column: true
	});
$(frappe.render_template("element_donut", {})).appendTo(page.body)

}
