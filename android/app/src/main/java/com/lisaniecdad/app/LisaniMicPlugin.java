package com.lisaniecdad.app;

import android.Manifest;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

@CapacitorPlugin(
    name = "LisaniMic",
    permissions = {
        @Permission(strings = { Manifest.permission.RECORD_AUDIO }, alias = LisaniMicPlugin.MICROPHONE),
    }
)
public class LisaniMicPlugin extends Plugin {

    static final String MICROPHONE = "microphone";

    @PluginMethod
    public void checkPermission(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("granted", getPermissionState(MICROPHONE) == PermissionState.GRANTED);
        call.resolve(ret);
    }

    @PluginMethod
    public void requestPermission(PluginCall call) {
        if (getPermissionState(MICROPHONE) == PermissionState.GRANTED) {
            JSObject ret = new JSObject();
            ret.put("granted", true);
            call.resolve(ret);
            return;
        }
        requestPermissionForAlias(MICROPHONE, call, "permissionCallback");
    }

    @PermissionCallback
    private void permissionCallback(PluginCall call) {
        JSObject ret = new JSObject();
        boolean granted = getPermissionState(MICROPHONE) == PermissionState.GRANTED;
        ret.put("granted", granted);
        if (granted) {
            call.resolve(ret);
        } else {
            call.reject("Mikrofon izni reddedildi", ret);
        }
    }
}
