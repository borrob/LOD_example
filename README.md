# LOD_example
Example on how to use Linked Open Data (LOD). Have a look at: http://borrob.github.io/LOD_example/ or at http://ordinageoict.cloudapp.net/apps/rob.van.loon/lod_voorbeeld/index.html

## Demo
This is a simple demo application that shows some basic Linked Open Data (LOD) principles. It uses the ['Basisregistratie Adressen en Gebouwen'] (http://www.kadaster.nl/bag) to search for a building using the zipcode and housenumber. The contour of the building is shown on the map. As a second step, the neighbourhood of the building is located and some basic statistics of this neighbourhood are shown. These statistics are derived from [Statistics Netherlands] (http://www.cbs.nl/en-GB/menu/home/default.htm).

### Bars
One of the statistics is the average number of bars with a 1 km radius of the neighbourhood. Off course people will wonder: 'so where are these bars?' To answer that question, I also added a layer with 'pubs'. Theze location are extracted from the [OSM] (http://openstreetmap.org)} API and the pubs around the area are plotted as vector data on the map.

## Software
This website uses html, javascript and css. Three javascript libraries are used:

1. [jQuery] (https://github.com/jquery/jquery): for general functionality
2. [OpenLayers] (https://github.com/openlayers/ol3): to create the map and all its functionality
3. [proj4js] (https://github.com/proj4js/proj4js): to deal with coordinate transformations

[Purce.css] (https://github.com/yahoo/pure/) makes the page look nice.

### Techniques
It's all html, css and javascript. To obtain the data from the Linked Data Stores, there ise SPARQL and TURBO involved.

## Data
This website makes use of open data from the [PILOD project] (http://www.pilod.nl/), from [PDOK] (http://www.pdok.nl), and from [Openstreetmap] (http://openstreetmap.org].)
