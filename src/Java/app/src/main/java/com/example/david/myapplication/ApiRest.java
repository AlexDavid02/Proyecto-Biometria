package com.example.david.myapplication;

import android.util.Log;

import com.example.david.myapplication.TramaIBeacon;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Date;
import java.util.Locale;
import java.util.TimeZone;

public class ApiRest {
    // Usar la URL que funcionó con curl
    static final String DIRECCIONAPI = "https://addavid.upv.edu.es/datos/nuevo";

    public static class DatosProcesados {
        int contador;
        int C02;

        public int getContador() { return contador; }
        public int getC02() { return C02; }

        public DatosProcesados(int contador, int C02) {
            this.contador = contador;
            this.C02 = C02;
        }
    }

    private static int ProcesarCO2(int CO2_original){
        return CO2_original;
    }

    // Devuelve null si no es CO2
    public static DatosProcesados ProcesarTrama(TramaIBeacon trama) {
        byte[] majorBytes = trama.getMajor();
        byte[] minorBytes = trama.getMinor();

        int major = ((majorBytes[0] & 0xFF) << 8) | (majorBytes[1] & 0xFF);
        int idMedicion = (major >> 8) & 0xFF;
        int contador = major & 0xFF;

        Log.d("ApiRest", "Raw major: " + Arrays.toString(majorBytes));
        Log.d("ApiRest", "Major int: " + major + " (ID=" + idMedicion + ", contador=" + contador + ")");
        Log.d("ApiRest", "Raw minor: " + Arrays.toString(minorBytes));

        if (idMedicion == 11) { // solo CO2
            int valorCO2 = ((minorBytes[0] & 0xFF) << 8) | (minorBytes[1] & 0xFF);
            valorCO2 = ProcesarCO2(valorCO2);
            Log.d("ApiRest", "CO2: " + valorCO2);
            return new DatosProcesados(contador, valorCO2);
        } else {
            Log.d("ApiRest", "Trama ignorada, ID no es de CO2: " + idMedicion);
            return null;
        }
    }

    // Igual interfaz pública, pero envío alineado con tu patrón y el backend
    public static void EnviarDatos(DatosProcesados datos){
        if (datos == null) return;

        HttpURLConnection conn = null;
        try {
            // Timestamp ISO 8601 UTC
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US);
            sdf.setTimeZone(TimeZone.getTimeZone("UTC"));
            String timestamp = sdf.format(new Date());

            // Construir JSON que espera el servidor
            JSONObject json = new JSONObject();
            json.put("categoria", "co2");                 // equivalente a tu "Tipo"
            json.put("medida", datos.getC02());           // equivalente a tu "Valor"
            json.put("cuenta", datos.getContador());      // equivalente a tu "Contador"
            json.put("timestamp", timestamp);             // clave aceptada por la API

            Log.d(">>>>", "EnviamosREST de: " + json.toString());

            URL url = new URL(DIRECCIONAPI);
            conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json; charset=utf-8");
            conn.setConnectTimeout(10000);
            conn.setReadTimeout(10000);
            conn.setDoOutput(true);

            // Enviar body
            byte[] input = json.toString().getBytes("utf-8");
            try (OutputStream os = conn.getOutputStream()) {
                os.write(input, 0, input.length);
            }

            // Leer respuesta o error
            int code = conn.getResponseCode();
            InputStream is = (code >= 200 && code < 300) ? conn.getInputStream() : conn.getErrorStream();
            String resp = leerStream(is);

            Log.d("POST Medida", "Código: " + code + ", Respuesta: " + resp);
        } catch (Exception e) {
            Log.e("ApiRest", "Error enviando datos", e);
        } finally {
            if (conn != null) conn.disconnect();
        }
    }

    private static String leerStream(InputStream is) {
        if (is == null) return "";
        try (BufferedReader br = new BufferedReader(new InputStreamReader(is, "utf-8"))) {
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = br.readLine()) != null) sb.append(line);
            return sb.toString();
        } catch (Exception e) {
            return "";
        }
    }
}
