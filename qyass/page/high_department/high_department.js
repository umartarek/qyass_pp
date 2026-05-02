frappe.pages['high-department'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'High Department Report',
		single_column: true
	});
	// no idea what does it do
	frappe.breadcrumbs.add("Setup");

	// adding main 3 cols (employee - elements - dashboard)
	$("<div class='row parent-section'><div class='col section-one' style='overflow-y: auto;height: 750px;'></div><div class='col section-two' style='overflow-y: auto;height: 750px;'></div><div class='col  section-three' style='overflow-y: auto;height: 750px;'></div></div>").appendTo(
		page.main
	);

	// create an object from kanban class // no idea whtat does elements_page_filter mean
	wrapper.elements_page_filter = new HighDepartment(wrapper);

	// remove border from body
	page.body.addClass("no-border")
}

// employee kanban class definition
class HighDepartment {
	constructor(wrapper) {
		// define the wrapper
		this.wrapper = wrapper;
		// define the page
		this.page = wrapper.page;
		// define the body as the parent section that contains all 3 sections
		this.body = $(this.wrapper).find(".parent-section");

		this.element_count = ''
		this.element_eval_count = ''
		this.element_status_count = ''
		this.employees = []
		this.departments = []
		// make the page
		this.make();
	}

	make() {
		// show totals cards
		this.render_totals();

		// show employees cards
		this.render_employees();



		// render departments cards
		this.render_departments();

		// add styles to page
		this.add_style();
	}

	async render_totals(){
		const totals = await frappe.call({
		  module: "qyass.qyass",
		  page: "high_department",
		  method: "get_totals",
		})
		this.element_count = totals.message.element_count;
		this.element_eval_count = totals.message.count_elements_by_evaluation;
		this.element_status_count = totals.message.count_elements_by_completeness_status;
		if (this.element_count > 0){
			this.show_totals_cards();
		}
	}

	show_totals_cards(){
		$(`
					<div class="col-lg-12 col-md-4 col-12">
						<div target="_blank" rel="noopener noreferrer" class="frappe-card dashboard-card">
							Total Elements : ${this.element_count}
							<hr/>
						</div>
					</div>
				`).appendTo(this.body.find(".section-three"));

		$(`
				<div class="col-lg-12 col-md-12 col-12">
					<div target="_blank" rel="noopener noreferrer" class="frappe-card dashboard-card-eval">
						
					</div>
				</div>
			`).appendTo(this.body.find(".section-three"));
			for (let i=0; i<this.element_eval_count.length; i++) {
				$(`
				<div class="mt-2">
				
				${this.element_eval_count[i]['evaluation']} : ${this.element_eval_count[i]['count']} 
			</div>`).appendTo(this.body.find(".section-three").find(".dashboard-card-eval"))
			}

			$(`
			<div class="col-lg-12 col-md-12 col-12">
				<div target="_blank" rel="noopener noreferrer" class="frappe-card dashboard-card-comp">
					
				</div>
			</div>
		`).appendTo(this.body.find(".section-three"));
		for (let i=0; i<this.element_status_count.length; i++) {
			$(`
			<div class="mt-2">
			
			${this.element_status_count[i]['custom_status']} : ${this.element_status_count[i]['count']} 
		</div>`).appendTo(this.body.find(".section-three").find(".dashboard-card-comp"))
		}
	}

	async render_employees() {
		const response = await frappe.call({
		  module: "qyass.qyass",
		  page: "high_department",
		  method: "get_employees",
		});
	  
		// get employees
		this.employees = response.message.employees;
		if (this.employees.length > 0) {
		this.show_employees_cards();
		}
	  
	  }
	
	show_employees_cards() {
		// add new employee cards
		for (let i = 0; i < this.employees.length; i++) {
		  $(`
			<div target="_blank" rel="noopener noreferrer" class="frappe-card employee-card emp-${i}">
			  <span>${this.employees[i].name}</span>

			</div>
		  `).appendTo(this.body.find(".section-two"));
		  if (this.employees[i].count_elements_by_evaluation.length > 0 ){
			for (let j=0; j<this.employees[i].count_elements_by_evaluation.length; j++) {
			$(`
							<div class="mt-2">
							${this.employees[i].count_elements_by_evaluation[j]['evaluation']} : ${this.employees[i].count_elements_by_evaluation[j]['count']}
							</div>`,
							
					).appendTo(this.body.find(".section-two").find(`.emp-${i}`));
				
				
			}
		  }
		  if (this.employees[i].count_elements_by_completeness_status.length > 0 ){
			for (let j=0; j<this.employees[i].count_elements_by_completeness_status.length; j++) {
			$(`
							<div class="mt-2">
							${this.employees[i].count_elements_by_completeness_status[j]['custom_status']} : ${this.employees[i].count_elements_by_completeness_status[j]['count']}
							</div>`,
							
					).appendTo(this.body.find(".section-two").find(`.emp-${i}`));
				
				
			}
		  }
		}
	}

	async render_departments() {
		const response2 = await frappe.call({
			module: "qyass.qyass",
			page: "high_department",
			method: "get_departments",
		  });
		
		  // get departments
		  this.departments = response2.message.departments;
		  if (this.departments.length > 0) {
		  this.show_departments_cards();
		  }
	}

	show_departments_cards(){
		// add new department cards
		for (let i = 0; i < this.departments.length; i++) {
			$(`
			  <div target="_blank" rel="noopener noreferrer" class="frappe-card department-card dep-${i}">
				<span>${this.departments[i].department}</span>
  
			  </div>
			`).appendTo(this.body.find(".section-one"));
			if (this.departments[i].count_elements_by_evaluation.length > 0 ){
			  for (let j=0; j<this.departments[i].count_elements_by_evaluation.length; j++) {
			  $(`
							  <div class="mt-2">
							  ${this.departments[i].count_elements_by_evaluation[j]['evaluation']} : ${this.departments[i].count_elements_by_evaluation[j]['count']}
							  </div>`,
							  
					  ).appendTo(this.body.find(".section-one").find(`.dep-${i}`));
				  
				  
			  }
			}
			if (this.departments[i].count_elements_by_completeness_status.length > 0 ){
			  for (let j=0; j<this.departments[i].count_elements_by_completeness_status.length; j++) {
			  $(`
							  <div class="mt-2">
							  ${this.departments[i].count_elements_by_completeness_status[j]['custom_status']} : ${this.departments[i].count_elements_by_completeness_status[j]['count']}
							  </div>`,
							  
					  ).appendTo(this.body.find(".section-one").find(`.dep-${i}`));
				  
				  
			  }
			}
		  }
	}





	add_style() {
		this.style = `
			.parent-section {
				// width:500px !important;
				border:1px solid grey !important;
			}
			.section-one,.section-two,.section-three {
				// width:30% !important;
				// height:100px !important;
				border:1px solid black !important;
				margin:5px;
				padding:10px;
			}
			.frappe-card {
				text-align:center;
				margin:10px;
				padding;5px;
				// background-color:#4cb1bb !important;
			}
			.frappe-card:hover {
				box-shadow: var(--shadow-lg);
				// border:1px solid red !important;
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