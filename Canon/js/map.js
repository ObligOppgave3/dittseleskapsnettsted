mapboxgl.accessToken = 'pk.eyJ1IjoibWF4b21peDQiLCJhIjoiY2tnY3ZrOW95MDhvdzJ5czFoNHo3ZGtoMCJ9.VglX7RAvKpxOxeQIVgn5DQ'; // This Token Expire in 24 hours
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
        var x = 2;
        if (position.coords.longitude > 10.757933 && position.coords.longitude < 30.8778364) {
            x = 8;
        } else {
            x = 2;
        }
        var map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/dark-v10',
            center: [10.757933, 59.911491],

            zoom: x

        });


        var destination = [10.757933, 59.911491];


        var origin = [position.coords.longitude, position.coords.latitude];
        console.log(origin)
        console.log(destination)
        var makrer = new mapboxgl.Marker().setLngLat(origin).addTo(map)

        var makrer = new mapboxgl.Marker().setLngLat(destination).addTo(map)
        // A simple line from origin to destination.
        var route = {
            'type': 'FeatureCollection',
            'features': [
                {
                    'type': 'Feature',

                    'geometry': {
                        'type': 'LineString',
                        'coordinates': [origin, destination]
                    }

                }
            ]
        };

        // A single point that animates along the route.
        // Coordinates are initially set to origin.
        var point = {
            'type': 'FeatureCollection',
            'features': [
                {
                    'type': 'Feature',

                    'geometry': {
                        'type': 'Point',
                        'coordinates': origin
                    },
                    'properties': {}

                }
            ]
        };

        // Calculate the distance in kilometers between route start/end point.
        var lineDistance = turf.lineDistance(route.features[0], 'kilometers');

        var arc = [];

        // Number of steps to use in the arc and animation, more steps means
        // a smoother arc and animation, but too many steps will result in a
        // low frame rate
        var steps = 500;

        // Draw an arc between the `origin` & `destination` of the two points
        for (var i = 0; i < lineDistance; i += lineDistance / steps) {
            var segment = turf.along(route.features[0], i, 'kilometers');
            arc.push(segment.geometry.coordinates);
        }

        // Update the route with calculated arc coordinates
        route.features[0].geometry.coordinates = arc;

        // Used to increment the value of the point measurement against the route.
        var counter = 0;

        map.on('load', function () {
            // Add a source and layer displaying a point which will be animated in a circle.
            map.addSource('route', {
                'type': 'geojson',
                'data': route
            });

            map.addSource('point', {
                'type': 'geojson',
                'data': point
            });

            map.addLayer({
                'id': 'route',
                'source': 'route',
                'type': 'line',
                'paint': {
                    'line-width': 3,
                    'line-color': '#FF00FF'
                }
            });

            map.addLayer({
                'id': 'point',
                'source': 'point',
                'type': 'symbol',

                'layout': {
                    'icon-image': 'airport-15',
                    'icon-rotate': ['get', 'bearing'],
                    'icon-rotation-alignment': 'map',
                    'icon-allow-overlap': true,
                    'icon-ignore-placement': true,





                }
            });

            function animate() {
                // Update point geometry to a new position based on counter denoting
                // the index to access the arc.
                point.features[0].geometry.coordinates =
                    route.features[0].geometry.coordinates[counter];

                // Calculate the bearing to ensure the icon is rotated to match the route arc
                // The bearing is calculate between the current point and the next point, except
                // at the end of the arc use the previous point and the current point
                point.features[0].properties.bearing = turf.bearing(
                    turf.point(
                        route.features[0].geometry.coordinates[
                        counter >= steps ? counter - 1 : counter
                        ]
                    ),
                    turf.point(
                        route.features[0].geometry.coordinates[
                        counter >= steps ? counter : counter + 1
                        ]
                    )
                );

                // Update the source with this new data.
                map.getSource('point').setData(point);

                // Request the next frame of animation so long the end has not been reached.
                if (counter < steps) {
                    requestAnimationFrame(animate);
                }

                counter = counter + 1;
            }

            document
                .getElementById('map')
                .addEventListener('click', function () {
                    // Set the coordinates of the original point back to origin
                    point.features[0].geometry.coordinates = origin;

                    // Update the source layer
                    map.getSource('point').setData(point);

                    // Reset the counter
                    counter = 0;

                    // Restart the animation.
                    animate(counter);
                });

            // Start the animation.
            animate(counter);
        });
    });
}
