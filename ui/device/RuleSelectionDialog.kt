package com.sallie.ui.device

import android.app.Dialog
import android.content.Context
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.sallie.core.device.AutomationRule

/**
 * Dialog for selecting a rule to execute
 */
class RuleSelectionDialog(
    context: Context,
    private val rules: List<AutomationRule>,
    private val onRuleSelected: (AutomationRule) -> Unit
) : Dialog(context) {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.dialog_selection_list)
        
        setTitle("Select a Rule")
        
        val recyclerView = findViewById<RecyclerView>(R.id.recycler_view)
        recyclerView.layoutManager = LinearLayoutManager(context)
        recyclerView.adapter = RuleAdapter(rules) { rule ->
            onRuleSelected(rule)
            dismiss()
        }
    }
    
    /**
     * Adapter for rules in RecyclerView
     */
    private class RuleAdapter(
        private val rules: List<AutomationRule>,
        private val onRuleClick: (AutomationRule) -> Unit
    ) : RecyclerView.Adapter<RuleAdapter.RuleViewHolder>() {
        
        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RuleViewHolder {
            val inflater = LayoutInflater.from(parent.context)
            val view = inflater.inflate(R.layout.item_dialog_option, parent, false)
            return RuleViewHolder(view)
        }
        
        override fun onBindViewHolder(holder: RuleViewHolder, position: Int) {
            val rule = rules[position]
            holder.bind(rule, onRuleClick)
        }
        
        override fun getItemCount(): Int = rules.size
        
        class RuleViewHolder(view: View) : RecyclerView.ViewHolder(view) {
            private val titleView: TextView = view.findViewById(R.id.option_title)
            private val subtitleView: TextView = view.findViewById(R.id.option_subtitle)
            
            fun bind(rule: AutomationRule, onClick: (AutomationRule) -> Unit) {
                titleView.text = rule.name
                val enabledText = if (rule.enabled) "Enabled" else "Disabled"
                subtitleView.text = "$enabledText - ${rule.triggerType}"
                
                itemView.setOnClickListener {
                    onClick(rule)
                }
            }
        }
    }
}
