#include <Wire.h>
#include "MAX30100_PulseOximeter.h"
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <WiFi.h>
#include <Firebase_ESP_Client.h>

#define WIFI_SSID "itel A50"
#define WIFI_PASSWORD "00000000"

#define DATABASE_URL "https://neurofocusdb-default-rtdb.europe-west1.firebasedatabase.app/" 
#define DATABASE_SECRET "6pi4DrBtcB0qeqOe2xpRykqE72l354sevPiwIHq8"

#define SDA_PIN 8
#define SCL_PIN 9
#define GSR_PIN 4

#define REPORTING_PERIOD_MS 1000

PulseOximeter pox;
Adafruit_MPU6050 mpu;

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

uint32_t tsLastReport = 0;
volatile uint32_t lastBeatTime = 0;
volatile uint32_t rrIntervalMs = 0;

void onBeatDetected() {
    uint32_t currentTime = millis();
    rrIntervalMs = currentTime - lastBeatTime;
    lastBeatTime = currentTime;
}

void setup() {
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
    }

    config.database_url = DATABASE_URL;
    config.signer.tokens.legacy_token = DATABASE_SECRET;
    Firebase.begin(&config, &auth);
    Firebase.reconnectWiFi(true);

    Wire.begin(SDA_PIN, SCL_PIN);
    mpu.begin();

    if (!pox.begin()) {
        while (true); 
    }
    
    pox.setOnBeatDetectedCallback(onBeatDetected);
}

void loop() {
    pox.update();

    if (millis() - tsLastReport > REPORTING_PERIOD_MS) {
        sensors_event_t a, g, temp;
        mpu.getEvent(&a, &g, &temp);
        
        int gsr = analogRead(GSR_PIN);
        float bpm = pox.getHeartRate();
        float spo2 = pox.getSpO2();

        FirebaseJson json;
        json.set("HR", bpm);
        json.set("SpO2", spo2);
        json.set("RR", rrIntervalMs);
        json.set("GSR", gsr);
        json.set("AX", a.acceleration.x);
        json.set("AY", a.acceleration.y);
        json.set("AZ", a.acceleration.z);

        Firebase.RTDB.setJSONAsync(&fbdo, "/Patient_Live_Data", &json);

        tsLastReport = millis();
    }
}