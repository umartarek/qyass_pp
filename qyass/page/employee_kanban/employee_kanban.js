frappe.pages['employee-kanban'].on_page_load = function (wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Employee Report',
		single_column: true
	});
	// no idea what does it do
	frappe.breadcrumbs.add("Setup");

	// adding main 3 cols (employee - elements - dashboard)
	$("<div class='row parent-section'><div class='col employee-section' style='overflow-y: auto;height: 750px;'></div><div class='col element-section' style='overflow-y: auto;height: 750px;'></div><div class='col  dashboard-section' style='overflow-y: auto;height: 750px;'></div></div>").appendTo(
		page.main
	);

	// create an object from kanban class // no idea whtat does elements_page_filter mean
	wrapper.elements_page_filter = new EmployeeKanban(wrapper);

	// remove border from body
	page.body.addClass("no-border")
}

// employee kanban class definition
class EmployeeKanban {
	constructor(wrapper) {
		// define the wrapper
		this.wrapper = wrapper;
		// define the page
		this.page = wrapper.page;
		// define the body as the parent section that contains all 3 sections
		this.body = $(this.wrapper).find(".parent-section");

		this.employee = '';
		this.employees =[];
		this.dashboard_evaluation = [];
		this.dashboard_completeness_status = [];
		this.dashboard_document_status = [];
		// make the page
		this.make();
	}

	make() {
		// show all employees cards
		this.render_employees();

		// render elements cards
		this.render_elements();

		this.activate_func();
		// add styles to page
		this.add_style();
	}

	activate_func() {
		const self = this; // Store reference to the parent object
	  
		$(".employee-card").click(function () {
		  $(".employee-card").removeClass("selected");
		  $(this).toggleClass("selected");
	  
		  // Set the value of the clicked object to the parent class
		  self.employee = $(this).text();
	  
		  // Call a function in the parent
		  self.render_elements();
		//   self.render_dashboard();
		});
	  }

	async render_employees() {
		const response = await frappe.call({
		  module: "qyass.qyass",
		  page: "employee_kanban",
		  method: "get_employees",
		});
	  
		// get employees
		this.employees = response.message.employees;
		if (this.employees.length > 0) {
		  // empty employees cards // no known effect
		  this.cards = [];
	  
		  // add new employees cards
		  for (let i = 0; i < this.employees.length; i++) {
			await new Promise((resolve) => {
			  $(`
				<div target="_blank" rel="noopener noreferrer" class="frappe-card employee-card">
				  <span>${this.employees[i].name}</span>
				</div>
			  `).appendTo(this.body.find(".employee-section"));
	  
			  // Resolve the promise after performing necessary tasks
			  resolve();
			});
		  }
	  
		  // The loop has finished, execute code here
		  this.activate_func();
		}
	  
	  }

	async render_elements(){
		await frappe.call({
			module: "qyass.qyass",
			page: "employee_kanban",
			method: "get_elements",
			args: {
				'employee':this.employee,
			},
		}).then(
			(r) => {
				// get employees
				this.elements = r.message.elements;
				this.dashboard_evaluation = r.message.count_elements_by_evaluation;
				this.dashboard_document_status = r.message.count_elements_by_document_status;
				this.dashboard_completeness_status = r.message.count_elements_by_completeness_status;
				if (this.elements.length > 0 ){
					// empty employees cards // no known effect
					this.cards = [];
					// add new employees cards
				this.show_elements_cards(this.elements);
				}else {
					// empty elements secton
					$('.element-section').empty();
				}
			}
		);

		this.render_dashboard();

	}

	// show elements Cards
	show_elements_cards(elements) {
		this.color = {'التزام كلي': '#00E676', 'التزام جزئي': '#FFA500', 'عدم التزام': '#FF0000', 'لا ينطبق': '#808080', 'متوفر': '#00E676', 'غير متوفر': '#FF0000','تحت الاجراء':'#FFA500','لا يتطلب':'#808080','To Do': '#00E676', 'Quality': '#FF0000','Progress':'#FFA500','Review':'#808080','Approved':'#707070'};
		this.cards = [];
		
		// empty elements secton
		$('.element-section').empty();
		// add new elements
		for (let i=0; i<elements.length; i++) {
			$(`
					<div class="col-lg-12 col-md-4 col-12">
						<div target="_blank" rel="noopener noreferrer" class="frappe-card organization-entry-k-card">
							${this.get_element_link(elements[i])}
							${this.get_element_name(elements[i])}
							<hr/>
							${this.get_evaluation_tag(elements[i])}
							${this.get_custom_status(elements[i])}
							${this.get_recommendations(elements[i])}
							${this.get_handicaps(elements[i])}
							${this.get_end_date(elements[i])}
						</div>
					</div>
				`).appendTo(this.body.find(".element-section"))
		}
	}

	get_element_link(element) {
		return frappe.render(`<!-- jinja -->
				<div class="mt-2">
					<a href="/app/standard-group-elements/{{ element }}">{{ element }}</a>
				</div>`,
				{"element": element["name"]}
		);
	}

	get_element_name(element) {
		return frappe.render(`<!-- jinja -->
				<div class="mt-2" style="overflow-wrap: break-word;">
					<div>{{ element_name }}</div>
				</div>`,
				{"element_name": element["element"]}
		);
	}

	get_evaluation_tag(element) {
		return frappe.render(`<!-- jinja -->
				<div class="mt-2">
					<svg width="17" height="17">
						<circle cx="8" cy="8" r="7" fill="{{ color }}" />
					</svg>
					{{ evaluation }}
                </div>`,
				{"evaluation": element["evaluation"], "color": this.color[element["evaluation"]]}
		);
	}
	get_custom_status(element) {
		return frappe.render(`<!-- jinja -->
				<div class="mt-2">
					<svg width="17" height="17">
						<circle cx="8" cy="8" r="7" fill="{{ color }}" />
					</svg>
					{{ custom_status }}
                </div>`,
				{"custom_status": element["custom_status"], "color": this.color[element["custom_status"]]}
		);
	}

	get_recommendations(element) {
		if (!element["recommendations"]) {
			return "<div></div>"
		}
		return frappe.render(`<!-- jinja -->
				<hr/>
                <div class="mt-2" style="overflow-wrap: break-word;">
					Recommendations: {{ recommendations }}
            </div>`,
			{"recommendations": element["recommendations"]}
			);
	}

	get_handicaps(element) {
		if (!element["handicaps"]) {
			return "<div></div>"
		}
		return frappe.render(`<!-- jinja -->
				<hr/>
                <div class="mt-2" style="overflow-wrap: break-word;">
				Handicaps: {{ handicaps }}
            </div>`,
			{"handicaps": element["handicaps"]}
			);
	}

	get_end_date(element) {
		if (!element["expected_end_date"]) {
			return "<div></div>"
		}
		return frappe.render(`<!-- jinja -->
				<hr/>
                <div class="mt-2" style="overflow-wrap: break-word;">
					{{ expected_end_date }}
            </div>`,
			{"expected_end_date": element["expected_end_date"]}
			);
	}
	render_dashboard() {
		this.color = {'التزام كلي': '#00E676', 'التزام جزئي': '#FFA500', 'عدم التزام': '#FF0000', 'لا ينطبق': '#808080', 'متوفر': '#00E676', 'غير متوفر': '#FF0000','تحت الاجراء':'#FFA500','لا يتطلب':'#808080','To Do': '#00E676', 'Quality': '#FF0000','Progress':'#FFA500','Review':'#808080','Approved':'#707070'};
		this.cards = [];
		
		// empty elements secton
		$('.dashboard-section').empty();
		$(`
					<div class="col-lg-12 col-md-4 col-12">
						<div target="_blank" rel="noopener noreferrer" class="frappe-card dashboard-card">
							Total Elements : ${this.elements.length}
							<hr/>
							
						</div>
					</div>
				`).appendTo(this.body.find(".dashboard-section"));
		if (this.dashboard_evaluation.length > 0) {
			this.render_evaluation()
		}
		if (this.dashboard_document_status.length > 0) {
			this.render_document_status()
		}
		if (this.dashboard_completeness_status.length > 0) {
			this.render_completeness_status()
		}
	}

	render_evaluation() {
		$(`
		<div class="col-lg-12 col-md-4 col-12">
			<div target="_blank" rel="noopener noreferrer" class="frappe-card dashboard-card-eval">
				
			</div>
		</div>
	`).appendTo(this.body.find(".dashboard-section"));
	for (let i=0; i<this.dashboard_evaluation.length; i++) {
		$(`
		<div class="mt-2">
		<svg width="17" height="17">
			<circle cx="8" cy="8" r="7" fill="${this.color[this.dashboard_evaluation[i]['evaluation']]}" />
		</svg>
		${this.dashboard_evaluation[i]['evaluation']} : ${this.dashboard_evaluation[i]['count']} 
	</div>`).appendTo(this.body.find(".dashboard-section").find(".dashboard-card-eval"))
	}
	}

	render_document_status() {
		$(`
		<div class="col-lg-12 col-md-4 col-12">
			<div target="_blank" rel="noopener noreferrer" class="frappe-card dashboard-card-doc">
				
			</div>
		</div>
	`).appendTo(this.body.find(".dashboard-section"));
	for (let i=0; i<this.dashboard_document_status.length; i++) {
		$(`
		<div class="mt-2">
		<svg width="17" height="17">
			<circle cx="8" cy="8" r="7" fill="${this.color[this.dashboard_document_status[i]['document_status']]}" />
		</svg>
		${this.dashboard_document_status[i]['document_status']} : ${this.dashboard_document_status[i]['count']} 
	</div>`).appendTo(this.body.find(".dashboard-section").find(".dashboard-card-doc"))
	}
	}

	render_completeness_status() {
		$(`
		<div class="col-lg-12 col-md-4 col-12">
			<div target="_blank" rel="noopener noreferrer" class="frappe-card dashboard-card-comp">
				
			</div>
		</div>
	`).appendTo(this.body.find(".dashboard-section"));
	for (let i=0; i<this.dashboard_completeness_status.length; i++) {
		$(`
		<div class="mt-2">
		<svg width="17" height="17">
			<circle cx="8" cy="8" r="7" fill="${this.color[this.dashboard_completeness_status[i]['custom_status']]}" />
		</svg>
		${this.dashboard_completeness_status[i]['custom_status']} : ${this.dashboard_completeness_status[i]['count']} 
	</div>`).appendTo(this.body.find(".dashboard-section").find(".dashboard-card-comp"))
	}
	}

	add_style() {
		this.style = `
			.parent-section {
				// width:500px !important;
				border:1px solid grey !important;
			}
			.employee-section,.element-section,.dashboard-section {
				// width:30% !important;
				// height:100px !important;
				border:1px solid black !important;
				margin:5px;
			}
			.employee-card {
				text-align:center;
				margin:5px;
				padding;5px;
				background-color:#4cb1bb !important;
			}
			.employee-card:hover {
				box-shadow: var(--shadow-lg);
				border:1px solid red !important;
				cursor:pointer;
			}
			.selected{
				border:1px solid red;
				-moz-border-radius:3px;
				border-radius:3px;
			}
			.organization-entry-k-card {
				display: block;
				text-decoration: none;
				margin-bottom: var(--margin-lg);
			}
			
			.organization-entry-k-card:hover {
				box-shadow: var(--shadow-md);
				text-decoration: none;
			}
		`;
		// append the style tag into the wrapper
		$(`<style>${this.style}</style>`).appendTo(this.wrapper);
	}
}