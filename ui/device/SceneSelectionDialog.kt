package com.sallie.ui.device

import android.app.Dialog
import android.content.Context
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.appcompat.app.AlertDialog
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.sallie.core.device.Scene

/**
 * Dialog for selecting a scene to execute
 */
class SceneSelectionDialog(
    context: Context,
    private val scenes: List<Scene>,
    private val onSceneSelected: (Scene) -> Unit
) : Dialog(context) {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.dialog_selection_list)
        
        setTitle("Select a Scene")
        
        val recyclerView = findViewById<RecyclerView>(R.id.recycler_view)
        recyclerView.layoutManager = LinearLayoutManager(context)
        recyclerView.adapter = SceneAdapter(scenes) { scene ->
            onSceneSelected(scene)
            dismiss()
        }
    }
    
    /**
     * Adapter for scenes in RecyclerView
     */
    private class SceneAdapter(
        private val scenes: List<Scene>,
        private val onSceneClick: (Scene) -> Unit
    ) : RecyclerView.Adapter<SceneAdapter.SceneViewHolder>() {
        
        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): SceneViewHolder {
            val inflater = LayoutInflater.from(parent.context)
            val view = inflater.inflate(R.layout.item_dialog_option, parent, false)
            return SceneViewHolder(view)
        }
        
        override fun onBindViewHolder(holder: SceneViewHolder, position: Int) {
            val scene = scenes[position]
            holder.bind(scene, onSceneClick)
        }
        
        override fun getItemCount(): Int = scenes.size
        
        class SceneViewHolder(view: View) : RecyclerView.ViewHolder(view) {
            private val titleView: TextView = view.findViewById(R.id.option_title)
            private val subtitleView: TextView = view.findViewById(R.id.option_subtitle)
            
            fun bind(scene: Scene, onClick: (Scene) -> Unit) {
                titleView.text = scene.name
                subtitleView.text = "${scene.deviceStates.size} devices"
                
                itemView.setOnClickListener {
                    onClick(scene)
                }
            }
        }
    }
}
