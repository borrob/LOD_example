# LOD_example
Example on how to use Linked Open Data (LOD). Have a look at: http://borrob.github.io/LOD_example/

## Demo
This is a simple demo application that shows some basic Linked Open Data (LOD) principles. It uses the ['Basisregistratie Adressen en Gebouwen'] (http://www.kadaster.nl/bag) to search for a building using the zipcode and housenumber. The contour of the building is shown on the map. As a second step, the neighbourhood of the building is located and some basic statistics of this neighbourhood are shown. These statistics are derived from [Statistics Netherlands] (http://www.cbs.nl/en-GB/menu/home/default.htm).

## Software
This website uses html, javascript and css. Three javascript libraries are used:

1. [jQuery] (https://github.com/jquery/jquery): for general functionality
2. [OpenLayers] (https://github.com/openlayers/ol3): to create the map and all its functionality
3. [proj4js] (https://github.com/proj4js/proj4js): to deal with coordinate transformations

[Purce.css] (https://github.com/yahoo/pure/) makes the page look nice.

## Data
This website makes use of open data from the [PILOD project] (http://www.pilod.nl/) and from [PDOK] (http://www.pdok.nl).
