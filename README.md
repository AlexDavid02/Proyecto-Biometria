# Proyecto de Biometría Ambiental

El objetivo de este proyecto es capturar información ambiental desde un dispositivo BLE y mostrarla tanto en una página web como en una aplicación Android.  
Los datos se obtienen mediante una placa Arduino que actúa como emisor, y se procesan a través de una API y una base de datos ligera.

---

## Estructura del Proyecto

Dentro de la carpeta `src` se incluyen los tres módulos principales:
- Android: Contiene la aplicación móvil desarrollada en Java.  
- Web: Archivos de la interfaz web y scripts de actualización de mediciones.  
- Arduino:** Código fuente para la lectura de sensores y emisión mediante iBeacon.  

Los recursos de diseño y documentación adicional están disponibles en la carpeta `doc`.

---

##  Puesta en Marcha

Aplicación Android  
1. Descargar e instalar el APK desde la carpeta `Android`.  
2. Conceder los permisos solicitados al abrir la app.  

Interfaz Web  
- Acceder al sitio web: [https://addavid.upv.edu.es/](https://addavid.upv.edu.es/)  
- Usar el botón *Recargar mediciones* para actualizar los datos.

Arduino  
1. Abrir el archivo `HolaMundoIBeacon.ino`.  
2. Conectar la placa y compilar el código.  
3. Iniciar el monitor serie para comenzar la transmisión de datos BLE.

---

## Tecnologías Empleadas
Arduino • Java • Node.js / SQLite • HTML / CSS / JavaScript  

