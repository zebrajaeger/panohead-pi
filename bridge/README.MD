# I2C to TMC429 Bridge

# Flash fuses with arduino isp

apt install avrdude

read
avrdude -p m328p -P /dev/ttyUSB0 -b 19200 -c avrisp -U efuse:r:a

write
avrdude -p m328p -P /dev/ttyUSB0 -b 19200 -c avrisp -U lfuse:w:0xBF:m