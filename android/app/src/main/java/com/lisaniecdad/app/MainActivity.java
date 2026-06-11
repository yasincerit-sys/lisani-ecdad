package com.lisaniecdad.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(LisaniMicPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
