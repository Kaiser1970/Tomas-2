package com.costossecurity.medicontrol;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(SystemSettingsPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
