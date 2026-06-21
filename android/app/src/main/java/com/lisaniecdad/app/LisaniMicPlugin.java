package com.lisaniecdad.app;

import android.Manifest;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import java.util.ArrayList;

@CapacitorPlugin(
    name = "LisaniMic",
    permissions = {
        @Permission(strings = { Manifest.permission.RECORD_AUDIO }, alias = LisaniMicPlugin.MICROPHONE),
    }
)
public class LisaniMicPlugin extends Plugin {

    static final String MICROPHONE = "microphone";

    private SpeechRecognizer speechRecognizer;
    private final Handler mainHandler = new Handler(Looper.getMainLooper());

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

    @PluginMethod
    public void startListening(PluginCall call) {
        if (getPermissionState(MICROPHONE) != PermissionState.GRANTED) {
            call.reject("Mikrofon izni yok");
            return;
        }
        if (!SpeechRecognizer.isRecognitionAvailable(getContext())) {
            call.reject("Bu cihazda ses tanıma yok");
            return;
        }

        String language = call.getString("language", "tr-TR");

        mainHandler.post(() -> {
            destroyRecognizer();
            speechRecognizer = SpeechRecognizer.createSpeechRecognizer(getContext());
            speechRecognizer.setRecognitionListener(
                new RecognitionListener() {
                    @Override
                    public void onReadyForSpeech(Bundle params) {}

                    @Override
                    public void onBeginningOfSpeech() {}

                    @Override
                    public void onRmsChanged(float rmsdB) {}

                    @Override
                    public void onBufferReceived(byte[] buffer) {}

                    @Override
                    public void onEndOfSpeech() {}

                    @Override
                    public void onError(int error) {
                        if (
                            error == SpeechRecognizer.ERROR_NO_MATCH ||
                            error == SpeechRecognizer.ERROR_SPEECH_TIMEOUT
                        ) {
                            return;
                        }
                        JSObject data = new JSObject();
                        data.put("error", String.valueOf(error));
                        notifyListeners("speechRecognition", data);
                    }

                    @Override
                    public void onResults(Bundle results) {
                        emitResults(results, true);
                    }

                    @Override
                    public void onPartialResults(Bundle partialResults) {
                        emitResults(partialResults, false);
                    }

                    @Override
                    public void onEvent(int eventType, Bundle params) {}

                    private void emitResults(Bundle results, boolean isFinal) {
                        ArrayList<String> list = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                        if (list == null || list.isEmpty()) {
                            return;
                        }
                        JSObject data = new JSObject();
                        data.put("text", list.get(0));
                        data.put("final", isFinal);
                        notifyListeners("speechRecognition", data);
                    }
                }
            );

            Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
            intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
            intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, language);
            intent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true);
            intent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 5);
            intent.putExtra(RecognizerIntent.EXTRA_CALLING_PACKAGE, getContext().getPackageName());

            try {
                speechRecognizer.startListening(intent);
                call.resolve();
            } catch (Exception e) {
                destroyRecognizer();
                call.reject("Ses tanıma başlatılamadı: " + e.getMessage());
            }
        });
    }

    @PluginMethod
    public void stopListening(PluginCall call) {
        mainHandler.post(() -> {
            if (speechRecognizer != null) {
                try {
                    speechRecognizer.stopListening();
                } catch (Exception ignored) {}
            }
            call.resolve();
        });
    }

    @Override
    protected void handleOnDestroy() {
        destroyRecognizer();
        super.handleOnDestroy();
    }

    private void destroyRecognizer() {
        if (speechRecognizer != null) {
            try {
                speechRecognizer.cancel();
                speechRecognizer.destroy();
            } catch (Exception ignored) {}
            speechRecognizer = null;
        }
    }

    @PluginMethod
    public void openAppSettings(PluginCall call) {
        Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
        intent.setData(Uri.fromParts("package", getContext().getPackageName(), null));
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getActivity().startActivity(intent);
        call.resolve();
    }

    @PluginMethod
    public void openNotificationSettings(PluginCall call) {
        Intent intent;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            intent = new Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS);
            intent.putExtra(Settings.EXTRA_APP_PACKAGE, getContext().getPackageName());
        } else {
            intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
            intent.setData(Uri.fromParts("package", getContext().getPackageName(), null));
        }
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getActivity().startActivity(intent);
        call.resolve();
    }
}
