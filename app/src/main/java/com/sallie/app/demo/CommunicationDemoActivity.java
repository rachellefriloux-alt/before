package com.sallie.app.demo;

import android.os.Bundle;
import android.text.TextUtils;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.SeekBar;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.sallie.app.R;
import com.sallie.core.communication.CommunicationBridge;
import com.sallie.core.communication.CommunicationResponse;
import com.sallie.core.communication.ConversationState;
import com.sallie.core.communication.ConversationType;
import com.sallie.core.communication.Message;
import com.sallie.core.communication.MessageSender;
import com.sallie.core.communication.ToneAttribute;
import com.sallie.core.communication.ToneAttributes;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import kotlinx.coroutines.CoroutineScope;
import kotlinx.coroutines.Dispatchers;
import kotlinx.coroutines.Job;
import kotlinx.coroutines.launch;

/**
 * Demo activity to showcase the Communication System capabilities.
 */
public class CommunicationDemoActivity extends AppCompatActivity {
    private static final String TAG = "CommunicationDemoActivity";
    
    // UI components
    private Spinner conversationTypeSpinner;
    private SeekBar formalitySeekBar, warmthSeekBar, directnessSeekBar, humorSeekBar;
    private TextView formalityValue, warmthValue, directnessValue, humorValue;
    private RecyclerView conversationRecyclerView;
    private EditText messageInput;
    private Button sendButton, newConversationButton;
    
    // Adapter
    private MessageAdapter messageAdapter;
    
    // Data
    private List<MessageItem> messages = new ArrayList<>();
    private String currentConversationId;
    private ConversationType currentConversationType = ConversationType.GENERAL;
    private String userId = "demo_user";
    
    // Communication components
    private CommunicationBridge communicationBridge;
    private final CoroutineScope coroutineScope = new CoroutineScope(Dispatchers.getMain().plus(new Job()));
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_communication_demo);
        
        initializeViews();
        setupConversationTypeSpinner();
        setupSeekBars();
        setupRecyclerView();
        setupButtons();
        
        initializeCommunicationBridge();
    }
    
    private void initializeViews() {
        conversationTypeSpinner = findViewById(R.id.conversation_type_spinner);
        
        formalitySeekBar = findViewById(R.id.formality_seekbar);
        warmthSeekBar = findViewById(R.id.warmth_seekbar);
        directnessSeekBar = findViewById(R.id.directness_seekbar);
        humorSeekBar = findViewById(R.id.humor_seekbar);
        
        formalityValue = findViewById(R.id.formality_value);
        warmthValue = findViewById(R.id.warmth_value);
        directnessValue = findViewById(R.id.directness_value);
        humorValue = findViewById(R.id.humor_value);
        
        conversationRecyclerView = findViewById(R.id.conversation_recycler_view);
        messageInput = findViewById(R.id.message_input);
        sendButton = findViewById(R.id.send_button);
        newConversationButton = findViewById(R.id.start_new_conversation_button);
    }
    
    private void setupConversationTypeSpinner() {
        String[] conversationTypes = {
                "General", "Casual", "Professional", "Educational", 
                "Therapeutic", "Creative", "Technical"
        };
        
        ArrayAdapter<String> adapter = new ArrayAdapter<>(
                this, android.R.layout.simple_spinner_item, conversationTypes);
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        conversationTypeSpinner.setAdapter(adapter);
        
        conversationTypeSpinner.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                String selected = (String) parent.getItemAtPosition(position);
                updateConversationType(selected);
            }
            
            @Override
            public void onNothingSelected(AdapterView<?> parent) {
                // Do nothing
            }
        });
    }
    
    private void updateConversationType(String typeName) {
        switch (typeName) {
            case "Casual":
                currentConversationType = ConversationType.CASUAL;
                break;
            case "Professional":
                currentConversationType = ConversationType.PROFESSIONAL;
                break;
            case "Educational":
                currentConversationType = ConversationType.EDUCATIONAL;
                break;
            case "Therapeutic":
                currentConversationType = ConversationType.THERAPEUTIC;
                break;
            case "Creative":
                currentConversationType = ConversationType.CREATIVE;
                break;
            case "Technical":
                currentConversationType = ConversationType.TECHNICAL;
                break;
            default:
                currentConversationType = ConversationType.GENERAL;
                break;
        }
        
        Log.d(TAG, "Conversation type updated to: " + currentConversationType.name());
    }
    
    private void setupSeekBars() {
        setupSeekBar(formalitySeekBar, formalityValue, 50);
        setupSeekBar(warmthSeekBar, warmthValue, 70);
        setupSeekBar(directnessSeekBar, directnessValue, 60);
        setupSeekBar(humorSeekBar, humorValue, 30);
    }
    
    private void setupSeekBar(SeekBar seekBar, final TextView valueText, int defaultProgress) {
        seekBar.setProgress(defaultProgress);
        updateTextValue(valueText, defaultProgress);
        
        seekBar.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            @Override
            public void onProgressChanged(SeekBar seekBar, int progress, boolean fromUser) {
                updateTextValue(valueText, progress);
                updateTonePreference();
            }
            
            @Override
            public void onStartTrackingTouch(SeekBar seekBar) {
                // Do nothing
            }
            
            @Override
            public void onStopTrackingTouch(SeekBar seekBar) {
                // Do nothing
            }
        });
    }
    
    private void updateTextValue(TextView textView, int progress) {
        textView.setText(progress + "%");
    }
    
    private void updateTonePreference() {
        // In a real app, we would update the tone preferences based on the seekbar values
        if (communicationBridge != null) {
            double formality = formalitySeekBar.getProgress() / 100.0;
            double warmth = warmthSeekBar.getProgress() / 100.0;
            double directness = directnessSeekBar.getProgress() / 100.0;
            double humor = humorSeekBar.getProgress() / 100.0;
            
            coroutineScope.launch(Dispatchers.IO, () -> {
                try {
                    communicationBridge.updateTonePreference(ToneAttribute.FORMALITY, formality, 0.5);
                    communicationBridge.updateTonePreference(ToneAttribute.WARMTH, warmth, 0.5);
                    communicationBridge.updateTonePreference(ToneAttribute.DIRECTNESS, directness, 0.5);
                    communicationBridge.updateTonePreference(ToneAttribute.HUMOR, humor, 0.5);
                } catch (Exception e) {
                    Log.e(TAG, "Error updating tone preferences", e);
                }
                return null;
            });
        }
    }
    
    private void setupRecyclerView() {
        messageAdapter = new MessageAdapter(messages);
        conversationRecyclerView.setLayoutManager(new LinearLayoutManager(this));
        conversationRecyclerView.setAdapter(messageAdapter);
    }
    
    private void setupButtons() {
        sendButton.setOnClickListener(v -> sendMessage());
        newConversationButton.setOnClickListener(v -> startNewConversation());
    }
    
    private void initializeCommunicationBridge() {
        coroutineScope.launch(Dispatchers.Main, () -> {
            try {
                // Initialize the communication bridge
                communicationBridge = CommunicationBridge.getInstance(
                        this, coroutineScope);
                
                communicationBridge.initialize();
                
                // Start a new conversation
                startNewConversation();
            } catch (Exception e) {
                Log.e(TAG, "Error initializing communication bridge", e);
                Toast.makeText(
                        CommunicationDemoActivity.this,
                        "Error initializing: " + e.getMessage(),
                        Toast.LENGTH_LONG
                ).show();
            }
            return null;
        });
    }
    
    private void startNewConversation() {
        messages.clear();
        messageAdapter.notifyDataSetChanged();
        
        coroutineScope.launch(Dispatchers.Main, () -> {
            try {
                ConversationState conversation = communicationBridge.startConversation(
                        null, // Let the system generate an ID
                        currentConversationType,
                        userId,
                        new HashMap<String, Object>() {{
                            put("source", "CommunicationDemoActivity");
                            put("demo", true);
                        }}
                );
                
                currentConversationId = conversation.getId();
                
                // Add welcome message
                String welcomeMessage = getWelcomeMessage();
                addSystemMessage(welcomeMessage);
                
                Log.d(TAG, "Started new conversation: " + currentConversationId);
                Toast.makeText(
                        CommunicationDemoActivity.this,
                        "Started new conversation",
                        Toast.LENGTH_SHORT
                ).show();
            } catch (Exception e) {
                Log.e(TAG, "Error starting conversation", e);
                Toast.makeText(
                        CommunicationDemoActivity.this,
                        "Error starting conversation: " + e.getMessage(),
                        Toast.LENGTH_SHORT
                ).show();
            }
            return null;
        });
    }
    
    private String getWelcomeMessage() {
        String[] welcomeMessages = {
                "Hello! How can I help you today?",
                "Welcome to our conversation. What's on your mind?",
                "Hi there! I'm here to assist you.",
                "Greetings! How are you feeling today?",
                "Hello! I'm here to support you. What would you like to talk about?"
        };
        
        int randomIndex = (int) (Math.random() * welcomeMessages.length);
        return welcomeMessages[randomIndex];
    }
    
    private void sendMessage() {
        String messageText = messageInput.getText().toString().trim();
        if (TextUtils.isEmpty(messageText)) {
            return;
        }
        
        // Add user message to UI
        addUserMessage(messageText);
        
        // Clear input
        messageInput.setText("");
        
        // Process the message
        processUserMessage(messageText);
    }
    
    private void processUserMessage(String message) {
        coroutineScope.launch(Dispatchers.Main, () -> {
            try {
                // Additional context for the message
                Map<String, Object> additionalContext = new HashMap<>();
                additionalContext.put("conversationType", currentConversationType.name());
                additionalContext.put("timestamp", System.currentTimeMillis());
                
                // Process the message
                CommunicationResponse response = communicationBridge.processMessage(
                        message,
                        currentConversationId,
                        additionalContext
                );
                
                // Handle response
                if (response instanceof CommunicationResponse.Success) {
                    CommunicationResponse.Success successResponse = 
                            (CommunicationResponse.Success) response;
                    
                    addSystemMessage(successResponse.getText());
                } else if (response instanceof CommunicationResponse.Error) {
                    CommunicationResponse.Error errorResponse =
                            (CommunicationResponse.Error) response;
                    
                    addSystemErrorMessage(errorResponse.getMessage());
                }
            } catch (Exception e) {
                Log.e(TAG, "Error processing message", e);
                addSystemErrorMessage("Sorry, I couldn't process your message: " + e.getMessage());
            }
            return null;
        });
    }
    
    private void addUserMessage(String text) {
        MessageItem message = new MessageItem(
                MessageSender.USER,
                text,
                System.currentTimeMillis(),
                null, // No intent for user messages
                null  // No response mode for user messages
        );
        
        messages.add(message);
        messageAdapter.notifyItemInserted(messages.size() - 1);
        scrollToBottom();
    }
    
    private void addSystemMessage(String text) {
        MessageItem message = new MessageItem(
                MessageSender.SYSTEM,
                text,
                System.currentTimeMillis(),
                "INFORMATION", // Simplified intent
                "INFORMATIONAL" // Simplified response mode
        );
        
        messages.add(message);
        messageAdapter.notifyItemInserted(messages.size() - 1);
        scrollToBottom();
    }
    
    private void addSystemErrorMessage(String text) {
        MessageItem message = new MessageItem(
                MessageSender.SYSTEM,
                text,
                System.currentTimeMillis(),
                "ERROR",
                "ERROR"
        );
        message.setError(true);
        
        messages.add(message);
        messageAdapter.notifyItemInserted(messages.size() - 1);
        scrollToBottom();
    }
    
    private void scrollToBottom() {
        if (messages.size() > 0) {
            conversationRecyclerView.scrollToPosition(messages.size() - 1);
        }
    }
    
    @Override
    protected void onDestroy() {
        super.onDestroy();
        
        // End conversation if needed
        if (communicationBridge != null && currentConversationId != null) {
            coroutineScope.launch(Dispatchers.IO, () -> {
                try {
                    communicationBridge.endConversation(currentConversationId);
                } catch (Exception e) {
                    Log.e(TAG, "Error ending conversation", e);
                }
                return null;
            });
        }
    }
    
    /**
     * Message item for the UI
     */
    static class MessageItem {
        private final MessageSender sender;
        private final String text;
        private final long timestamp;
        private final String intent;
        private final String responseMode;
        private boolean isError = false;
        
        MessageItem(MessageSender sender, String text, long timestamp, String intent, String responseMode) {
            this.sender = sender;
            this.text = text;
            this.timestamp = timestamp;
            this.intent = intent;
            this.responseMode = responseMode;
        }
        
        public MessageSender getSender() {
            return sender;
        }
        
        public String getText() {
            return text;
        }
        
        public long getTimestamp() {
            return timestamp;
        }
        
        public String getIntent() {
            return intent;
        }
        
        public String getResponseMode() {
            return responseMode;
        }
        
        public boolean isError() {
            return isError;
        }
        
        public void setError(boolean error) {
            isError = error;
        }
    }
    
    /**
     * Adapter for the conversation messages
     */
    class MessageAdapter extends RecyclerView.Adapter<MessageAdapter.MessageViewHolder> {
        private final List<MessageItem> messageList;
        private final SimpleDateFormat timeFormat;
        
        MessageAdapter(List<MessageItem> messageList) {
            this.messageList = messageList;
            this.timeFormat = new SimpleDateFormat("HH:mm", Locale.getDefault());
        }
        
        @NonNull
        @Override
        public MessageViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            View view = LayoutInflater.from(parent.getContext())
                    .inflate(R.layout.item_message, parent, false);
            return new MessageViewHolder(view);
        }
        
        @Override
        public void onBindViewHolder(@NonNull MessageViewHolder holder, int position) {
            MessageItem message = messageList.get(position);
            holder.bind(message);
        }
        
        @Override
        public int getItemCount() {
            return messageList.size();
        }
        
        class MessageViewHolder extends RecyclerView.ViewHolder {
            private final TextView messageTextView;
            private final TextView timeTextView;
            private final TextView metadataTextView;
            private final View messageContainer;
            private final View rootView;
            
            MessageViewHolder(@NonNull View itemView) {
                super(itemView);
                rootView = itemView;
                messageTextView = itemView.findViewById(R.id.message_text);
                timeTextView = itemView.findViewById(R.id.message_time);
                metadataTextView = itemView.findViewById(R.id.message_metadata);
                messageContainer = itemView.findViewById(R.id.message_container);
            }
            
            void bind(MessageItem message) {
                messageTextView.setText(message.getText());
                timeTextView.setText(timeFormat.format(new Date(message.getTimestamp())));
                
                if (message.getSender() == MessageSender.USER) {
                    // User message
                    rootView.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
                    messageContainer.setBackgroundResource(R.drawable.bg_message_user);
                    metadataTextView.setVisibility(View.GONE);
                } else {
                    // System message
                    rootView.setLayoutDirection(View.LAYOUT_DIRECTION_LTR);
                    
                    if (message.isError()) {
                        messageContainer.setBackgroundResource(R.drawable.bg_message_error);
                    } else {
                        messageContainer.setBackgroundResource(R.drawable.bg_message_system);
                    }
                    
                    if (message.getIntent() != null && message.getResponseMode() != null) {
                        metadataTextView.setVisibility(View.VISIBLE);
                        metadataTextView.setText(String.format("%s · %s", 
                                formatIntent(message.getIntent()), 
                                formatResponseMode(message.getResponseMode())));
                    } else {
                        metadataTextView.setVisibility(View.GONE);
                    }
                }
            }
            
            private String formatIntent(String intent) {
                if (intent == null) return "";
                // Remove prefix and format
                return intent
                        .replace("QUERY_", "")
                        .replace("COMMAND_", "")
                        .replace("SOCIAL_", "")
                        .replace("EMOTIONAL_", "")
                        .replace("_", " ");
            }
            
            private String formatResponseMode(String mode) {
                if (mode == null) return "";
                return mode.replace("_", " ");
            }
        }
    }
}
