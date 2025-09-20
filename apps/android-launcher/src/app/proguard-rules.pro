# ProGuard rules for Sallie Android app
# Add project specific ProGuard rules here.

# Keep all classes in the main package
-keep class com.sallie.app.** { *; }

# Keep Compose classes
-keep class androidx.compose.** { *; }
-keep class androidx.lifecycle.** { *; }
-keep class androidx.activity.** { *; }

# Keep data classes
-keep class kotlin.Metadata { *; }
-keep class kotlin.reflect.** { *; }

# Keep annotation classes
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes Exceptions
-keepattributes InnerClasses
-keepattributes SourceFile
-keepattributes LineNumberTable

# Keep enums
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# Keep parcelable classes
-keep class * implements android.os.Parcelable {
  public static final android.os.Parcelable$Creator *;
}

# Keep ViewModels
-keep class * extends androidx.lifecycle.ViewModel {
    *;
}

# Optimize for size
-optimizationpasses 5
-allowaccessmodification
-dontpreverify
-dontwarn android.support.**
-dontwarn kotlin.**

# Remove debug logging
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
}
