-keepclassmembers class com.foad.ghazaldeutsch.AndroidBridge {
    @android.webkit.JavascriptInterface <methods>;
}

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
