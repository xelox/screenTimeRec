# Simple Application Usage Time Tracker
This application records time spent on programs and saves it in the folder %APPDATA%/Simple Application Usage Time Tracker/data folder. Data is only collected and saved locally.

## Requirements
In order to run this program in the background you may need to install with `npm install -g forever` the forever module, otherwise you can choose your own way to run build/tracker.js in the background, or even run it manually as you may need.

## Instructions to run this tracker on startup (Windows)

1. Right click the file "startService.bat" from the dist folder.
2. Click on "Copy as Path".
3. Press Win+R to open the Run dialog.
4. Type shell:startup and press Enter. This will open the Startup folder.
5. Inside the folder that just opened, right click, hover "new", select "Shortcut".
6. In the dialog that opens, paste the Path to "startTracker.bat" and press next, then press finish.


## Future updates
In the future I will add a config.json file to edit some options such as, how often the tracker should check which is the active window, where to save the data, how to format it, how to name the data file.