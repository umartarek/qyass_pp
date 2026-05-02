// Override Kanban view to customize it for `Organization Entry Records` doctype

frappe.views.KanbanView = class KanbanViewCustom extends frappe.views.KanbanView {
    constructor(opts) {
        super(opts);
        if (opts.doctype === "Organization Entry Records") {
            frappe.prompt(
                {
                    label: __('Organization'),
                    fieldname: 'organization',
                    fieldtype: 'Link',
                    options: 'Organization',
                },
                (values) => {
                    this.organization = values.organization;
                    this.refresh();
                    this.setup_page_filters();
                }, __("Enter Organization"), __("Submit _"));
        }
	}
    get_fields() {
        if (this.doctype === "Organization Entry Records") {
            this.fields.push(["element", this.board.reference_doctype]);
            this.fields.push(["element_name", this.board.reference_doctype]);
            this.fields.push(["evaluation", this.board.reference_doctype]);
            this.fields.push(["recommendations", this.board.reference_doctype]);
        } else if (this.doctype === "Elements-2024") {
            this.fields.push(["name", this.board.reference_doctype]);
            this.fields.push(["evaluation", this.board.reference_doctype]);
            this.fields.push(["custom_status", this.board.reference_doctype]);
            this.fields.push(["expected_end_date", this.board.reference_doctype]);
        }
        return super.get_fields();
    }
    render() {
        // Hide Elements for `Organization Entry Records` doctype
        if (this.doctype === "Organization Entry Records") {
            this.page.clear_actions();
            this.page.clear_custom_actions();
            this.page.clear_menu();
        }
        super.render();
        if (this.doctype === "Organization Entry Records" || this.doctype ==="Elements-2024") {
            // Hide `add-card` and `add-new-column` classes
            setTimeout(() => {
                $(".add-card").css("display", "None");
                $(".add-new-column").css("display", "None");
                $('div.kanban-card-meta').css("display", "None");
                $('div.kanban-card-doc > div:nth-child(3) span').css('color', '#FBA834');
                $('div.kanban-card-doc > div:nth-child(4) span').css('color', '#50C4ED');
                $('div.kanban-card-doc > div:nth-child(5) span').css('color', '#387ADF');
                $('div.kanban-card-doc > div:nth-child(6) span').css('color', '#EE4266');
            }, 1000 * 0.4);
        }
    }
    get_card_meta() {
        let card_meta = super.get_card_meta();
        if (this.doctype === "Organization Entry Records") {
            card_meta.title_field = frappe.meta.get_field(this.doctype, "element");
        } else if (this.doctype === "Elements-2024") {
            card_meta.title_field = frappe.meta.get_field(this.doctype, "name") ;
        }
        return card_meta;
    }

    get_filters_for_args() {
		// filters might have a fifth param called hidden,
		// we don't want to pass that server side
        var filters = [];
        if (this.doctype === "Organization Entry Records" && this.organization) {
            filters.push(["Organization Entry Records", "organization", "=", this.organization]);
        }
        filters = filters.concat(super.get_filters_for_args());
        return filters;
	}

    // Custom Methods
    // --------------
    setup_page_filters() {
		this.evaluation = this.page.add_field({
			fieldname: 'evaluation',
			label: __('Evaluation'),
			fieldtype: 'Select',
			options: '\nالتزام كلي\nالتزام جزئي\nعدم التزام\nلا ينطبق',
			change: () => {
				this.refresh();
			},
		});
		this.department = this.page.add_field({
			fieldname: 'department',
			label: __('Department'),
			fieldtype: 'Link',
			options: 'Departments',
			change: () => {
				this.refresh();
			},
		});
		this.digital_transformation_officer = this.page.add_field({
			fieldname: 'digital_transformation_officer',
			label: __('Digital Transformation Officer'),
			fieldtype: 'Link',
			options: 'Employee',
			change: () => {
				this.refresh();
			},
		});
		this.standard = this.page.add_field({
			fieldname: 'standard',
			label: __('Standard'),
			fieldtype: 'Link',
			options: 'Standards',
			change: () => {
				this.refresh();
			},
			get_query: () => {
				return {
					query: "qyass.qyass.doctype.standard_group.standard_group.get_standard_list",
					filters: {},
				};
			},
		});
        this.page_form_obj = $(".page-form");
        this.page_form_obj.css("display", "flex");
	}
};
