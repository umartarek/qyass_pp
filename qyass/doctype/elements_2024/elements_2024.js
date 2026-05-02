// Copyright (c) 2024, IT Systematic and contributors
// For license information, please see license.txt

frappe.ui.form.on("Elements-2024", {
	refresh(frm) {
        frm.events.add_whatsapp(frm)
        frm.set_query("consultant", () => {
            return {
                filters: {
                    specialization: frm.doc.consultant_specialization,
                }
            }
        })
	},
    
    consultant_specialization(frm){
        // frappe.msgprint(frm.doc.consultant_specialization)
        frm.set_query("consultant", () => {
            return {
                filters: {
                    specialization: frm.doc.consultant_specialization,
                }
            }
        })
    },
    consultant_number(frm){
        if (frm.doc.consultant_number){
            frm.events.add_whatsapp(frm)
        }else{
            frm.remove_custom_button("Contact Consultant")
        }
    },
    add_whatsapp(frm){
        if (frm.doc.consultant_number){
            frm.add_custom_button(
                'Contact Consultant',() => {
                        window.open(`https://wa.me/${frm.doc.consultant_number}`);
                }
            )
        }
    },

});

frappe.ui.form.on("Proof Document",{
    proof_document_child_add(frm,cdt,cdn){
        calculate_complete_percent(frm)
    },
    proof_document_child_remove(frm,cdt,cdn){
        calculate_complete_percent(frm)
    },
    completed(frm,cdt,cdn){
        calculate_complete_percent(frm)
    },
    reviewed(frm,cdt,cdn){
        calculate_complete_percent(frm)
    }
})

function calculate_complete_percent(frm){
    let row_count = frm.doc.proof_document_child.length
    frm.set_value("proof_count", row_count)
    frm.refresh_field('proof_count')
    let completed_count = 0
    let reviewed_count = 0
    frm.doc.proof_document_child.forEach(
        (row)=>{
            if (row.completed == 1){
                completed_count += 1 
            }
            if (row.reviewed == 1){
                reviewed_count += 1
            }
        }
    )
    frm.set_value("completed_count", completed_count)
    frm.refresh_field('completed_count')
    frm.set_value("reviewed_count", reviewed_count)
    frm.refresh_field('reviewed_count')
    frm.set_value('complete_percent',String(completed_count).concat("/",String(row_count)))
    frm.refresh_field('complete_percent')
    frm.set_value('reviewed_percent',String(reviewed_count).concat("/",String(row_count)))
    frm.refresh_field('reviewed_percent')
}
