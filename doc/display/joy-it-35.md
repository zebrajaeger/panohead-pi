# joy it 3,5" SPI display

## Prepare

Write raspbian image to SD-Card

on boot partition create a empty file with name

    ssh

## startup stuff

### boot.config

/boot/config.txt at the head of file

    dtparam=spi=on
    dtoverlay=joy-IT-Display_Driver35a-overlay:rotate=270,swapxy=1,speed=35000000
    dtparam=audio=on
    max_usb_current=1
    hdmi_force_hotplug=1
    config_hdmi_boost=7
    hdmi_drive=1
    hdmi_ignore_edid=0xa5000080

and comment out:

    dtoverlay=vc4-fkms-v3d

so it looks like:

    [pi4]
    # Enable DRM VC4 V3D driver on top of the dispmanx display stack
    # dtoverlay=vc4-fkms-v3d
    max_framebuffers=2  

### cmdline.txt

/boot/cmdline.txt

add at the end of the first line:

    fbcon=map:10

## Calibration file

create file /usr/share/X11/xorg.conf.d/99-calibration.conf with content:

Section "InputClass"
    Identifier "calibration"
     MatchProduct "ADS7846 Touchscreen"
     Option "Calibration" "160 3723 3896 181"
     Option "SwapAxes" "0"
    EndSection

## fbturbo config

create/modify file  /usr/share/X11/xorg.conf.d/99-fbturbo.conf with content:

Section "Device"
  Identifier "Allwinner A10/A13 FBDEV"
  Driver     "fbturbo"
  Option     "fbdev" "/dev/fb1"
  Option     "SwapbuffersWait" "true"
EndSection

## install display driver

    cd /tmp
    wget anleitung.joy-it.net/upload/joy-IT-Display_Driver-35a-overlay.dtb
    sudo cp joy-IT-Display_Driver-35a-overlay.dtb /boot/overlays/joy-IT-Display_Driver35a-overlay.dtbo

## install touch driver

    sudo apt-get install xserver-xorg-input-evdev
    sudo cp -rf /usr/share/X11/xorg.conf.d/10-evdev.conf /usr/share/X11/xorg.conf.d/45-evdev.conf 

vnc

## activate via raspi-config

Use [realVNC](https://www.realvnc.com/de/connect/download/viewer/) viewer.

## start/stop x11

    sudo service lightdm [start|stop|restart]

## kiosk starter file

    sudo apt install unclutter

Create starter file

    touch /home/pi/kiosk.sh
    chmod +x /home/pi/kiosk.sh
    nano /home/pi/kiosk.sh

and put content in it:

    #!/bin/sh
    xset -dpms &
    xset s off &
    unclutter -idle 1 &
    matchbox-window-manager -use_titlebar no &

    chromium-browser  --noerrdialogs --disable-infobars --kiosk http://192.168.178.44:4200

## kiosk autostart

Create/edit file

    nano /home/pi/.xsession

and put folowing content in:

    ./kiosk.sh

## restart

    sudo reboot
