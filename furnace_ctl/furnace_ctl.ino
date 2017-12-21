#define DISABLE 2

void setup() {
  pinMode(DISABLE, OUTPUT);
  Serial.begin(9600);
}

float getTemp(int pin) {
  int tempReading = analogRead(pin);
  double tempK = log(10000.0 * ((1024.0 / tempReading - 1)));
  tempK = 1 / (0.001129148 + (0.000234125 + (0.0000000876741 * tempK * tempK )) * tempK );       //  Temp Kelvin
  float tempC = tempK - 273.15;            // Convert Kelvin to Celcius
  float tempF = (tempC * 9.0)/ 5.0 + 32.0; // Convert Celcius to Fahrenheit
  return tempF;
}

int state = 0; // 0 -> Warming up, 1 -> Cooling down.
int timeInState1 = 0;

void loop() {
  float tempIn = getTemp(0);
  float tempOut = getTemp(1);
  float tempDelta = tempOut - tempIn;
  
  Serial.println(tempDelta);

  if (tempDelta > 69.5 && state == 0) {
    state = 1;
    timeInState1 = 0;
  } else if ((tempDelta < 40 || timeInState1 > 300) && state == 1) {
    state = 0;
  }
  
  digitalWrite(DISABLE, state == 0 ? HIGH : LOW); 
  delay(1000);
  if (state == 1) timeInState1 += 1;
}
   
