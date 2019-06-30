var test = require('tape');
var inside = require('./');
var point = require('turf-point');
var polygon = require('turf-polygon');
var fs = require('fs');

test('bad type', function (t) {
  var poly = polygon([[[0,0], [0,100], [100,100], [100,0], [0,0]]]);

  t.throws(function() {
      inside(poly, poly);
  }, /Invalid input to inside: must be a Point, given Polygon/);

  t.end();
});

test('featureCollection', function (t) {
  // test for a simple polygon
  var poly = polygon([[[0,0], [0,100], [100,100], [100,0], [0,0]]]);
  var ptIn = point([50, 50]);
  var ptOut = point([140, 150]);

  t.true(inside(ptIn, poly), 'point inside simple polygon');
  t.false(inside(ptOut, poly), 'point outside simple polygon');

  // test for a concave polygon
  var concavePoly = polygon([[[0,0], [50, 50], [0,100], [100,100], [100,0], [0,0]]]);
  var ptConcaveIn = point([75, 75]);
  var ptConcaveOut = point([25, 50]);

  t.true(inside(ptConcaveIn, concavePoly), 'point inside concave polygon');
  t.false(inside(ptConcaveOut, concavePoly), 'point outside concave polygon');

  t.end();
});

test('poly with hole', function (t) {
  var ptInHole = point([-86.69208526611328, 36.20373274711739]);
  var ptInPoly = point([-86.72229766845702, 36.20258997094334]);
  var ptOutsidePoly = point([-86.75079345703125, 36.18527313913089]);
  var polyHole = JSON.parse(fs.readFileSync(__dirname + '/fixtures/poly-with-hole.geojson'));

  t.false(inside(ptInHole, polyHole));
  t.true(inside(ptInPoly, polyHole));
  t.false(inside(ptOutsidePoly, polyHole));

  t.end();
});

test('multipolygon with hole', function (t) {
  var ptInHole = point([-86.69208526611328, 36.20373274711739]);
  var ptInPoly = point([-86.72229766845702, 36.20258997094334]);
  var ptInPoly2 = point([-86.75079345703125, 36.18527313913089]);
  var ptOutsidePoly = point([-86.75302505493164, 36.23015046460186]);
  var multiPolyHole = JSON.parse(fs.readFileSync(__dirname + '/fixtures/multipoly-with-hole.geojson'));

  t.false(inside(ptInHole, multiPolyHole));
  t.true(inside(ptInPoly, multiPolyHole));
  t.true(inside(ptInPoly2, multiPolyHole));
  t.true(inside(ptInPoly, multiPolyHole));
  t.false(inside(ptOutsidePoly, multiPolyHole));

  t.end();
});

test('points on boundary treated consistently', function (t) {
  var ul = [-79.4586181640625,39.53793974517629];
  var ur = [ul[0] + 0.03, ul[1]];
  var ll = [ul[0], ul[1] + 0.03];
  var lr = [ll[0] + 0.03, ll[1]];
  var ml = [ul[0], ul[1]*0.5 + ll[1]*0.5];
  var mr = [ur[0], ul[1]*0.5 + ll[1]*0.5];
  var um = [ul[0]*0.5 + ur[0]*.5, ul[1]];
  var lm = [ll[0]*0.5 + lr[0]*.5, ul[1]];

  var points = [ul, ur, ll, lr, ml, mr, um, lm].map(point);

  var poly = polygon([[ul, ur, lr, ll, ul]]);

  var allEqual = true
  for (var i = 0; i < points.length - 1; i++) {
    allEqual = allEqual && (inside(points[i], poly) === inside(points[i + 1], poly))
  }
  t.ok(allEqual)
  t.end()
});
