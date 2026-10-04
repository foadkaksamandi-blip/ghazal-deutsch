-keepclassmembers class com.foad.ghazaldeutsch.AndroidBridge {
    @android.webkit.JavascriptInterface <methods>;
}

-keep class org.vosk.** { *; }
-keep class com.sun.jna.** { *; }
-dontwarn com.sun.jna.**

-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
    public static *** w(...);
}

-keepattributes *Annotation*
-repackageclasses 'com.foad.ghazaldeutsch.runtime'
-allowaccessmodification
-optimizationpasses 5
