# Simple Application Usage Time Tracker
This application records time spent on programs and saved it in the folder "data" within the project direcotry itself. Data is only collected and saved locally.

## Instructions to run this tracker on startup (Windows)

Right click the file "startService.bat" from the dist folder.
Click on "Copy as Path".
Press Win+R to open the Run dialog.
Type shell:startup and press Enter. This will open the Startup folder.
Inside the folder that just opened, right click, hover "new", select "Shortcut".
In the dialog that opens, paste the Path to "startTracker.bat" and press next, then press finish.


## Future updates
In the future I will add a config.json file to edit some options such as, how often the tracker should check which is the active window, where to save the data, how to format it, how to name the data file.