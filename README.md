# Spotify_Genre_GUI
A web application GUI that communicates with the Spotify API

The figma mock-up can be found at https://www.figma.com/file/cPUeVzT3Fews4zMjybUbUNKz/Spotify-Table-GUI?node-id=1%3A2

The Following is a GUI that displays an array of circles on a screen, 
each representing a different music genre. The user or in the preferred use case users 
can increase/decrease the size of the circles to affect their chances of playing. The circle 
should be free moving and the users should be able to flick them and move them around the screen 
they will collide with eachother and the walls. The circles shouldn't move until outside input from the user 
they should act as a "fluid". 

The larger the circle the higher the chance, the smaller the circle the smaller the chance.
The probability of a gener playing should NEVER be zero. This is so one user can't have full control.

Current Version- Test code for the server No GUI implemented yet, Strictly back end testing 

Current Implemented- Spotify Authorization, All spotify server calls needed, simple algorithm to decide which song to play next, 
constant authorization( Refresh access token as per the spotify API), time left in current playing song, ability to put in percentages 

********************************************* To run ***********************************************

Requirements:

Node JS 

Navigate to web-api-auth-examples-master/authorization_code

Run "Node app.js"

******************************************* Development ******************************************

TO discuss thing about the development that isn't covered in issues or pull requests

Possible library to implement the circles 

https://www.react-spring.io/docs/hooks/examples?fbclid=IwAR3hygu5OfUPGXpjq9he2GZNPsCQep_bL6FF-8mN39XvAjCwIhTZUVvgxjI

