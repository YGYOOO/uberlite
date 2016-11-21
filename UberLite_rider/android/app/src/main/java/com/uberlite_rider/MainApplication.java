package com.uberlite_rider;

import android.app.Application;
import android.util.Log;

import com.facebook.react.ReactApplication;
import com.react.rnspinkit.RNSpinkitPackage;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.imagepicker.ImagePickerPackage;
import com.github.xinthink.rnmk.ReactMaterialKitPackage;
import com.yoloci.fileupload.FileUploadPackage;
import com.airbnb.android.react.maps.MapsPackage;
import com.dieam.reactnativepushnotification.ReactNativePushNotificationPackage;  // <--- Import Package

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    protected boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
          new RNSpinkitPackage(),
          new ImagePickerPackage(),
          new ReactMaterialKitPackage(),
          new FileUploadPackage(),
          new MapsPackage(),
          new ReactNativePushNotificationPackage() // <---- Add the Package
      );
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
      return mReactNativeHost;
  }
}
