/**
 * Created by kenta on 4/23/17.
 */

const UBER_API_KEY = "";
const GOOGLE_MAPS_API_KEY = "";
const SECRETLY_OBTAINED_API_KEY = "";

Meteor.methods({
    'flight.status': function (airport = "ORD", airline = "UA", flightNo = "906", operationDate = "2017-04-22T22:10:00-0400") {
        const request = HTTP.get(`https://flifo.api.aero/flifo/v3/flight/${airport}/${airline}/${flightNo}/a?operationDate=${operationDate}&futureWindow=24&pastWindow=2&groupCodeshares=true`,
            {headers: {'X-apiKey': SECRETLY_OBTAINED_API_KEY}});
        return request.data;
    },
    'uber.prices': function (slat = 37.7752315, slng = -122.418075, elat = 37.7752415, elng = -122.518075) {
        const request = HTTP.get(`https://api.uber.com/v1.2/estimates/price?start_latitude=${slat}&start_longitude=${slng}&end_latitude=${elat}&end_longitude=${elng}`, {headers: {'Authorization': 'Token ' + UBER_API_KEY}});
        return request.data;
    },
    'uber.times': function (slat = 37.7752315, slng = -122.418075) {
        const request = HTTP.get(`https://api.uber.com/v1.2/estimates/time?start_latitude=${slat}&start_longitude=${slng}`, {headers: {'Authorization': 'Token ' + UBER_API_KEY}});
        return request.data;
    },
    "geocode": function (place, filter) {
        const request = HTTP.get(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=${place}&key=${GOOGLE_MAPS_API_KEY}`)
        console.log(request.data)
        return filter ? _.filter(request.data.results, place => _.contains(place.types, filter))[0] : request.data.results[0];
    },
    "rides.add": function (_id,ride) {
        return Tickets.update({_id}, {$set: ride});
    },
    "tickets.add": function (passenger, airport, airline, flightNum, operationDate) {
        return Tickets.insert({passenger, airport, airline, flightNum, operationDate, steps: 0, createdAt: Date.now()});
    },
    'step.update': function(id, step) {
        return Tickets.update({_id: id.replace(/"/g, "").trim()}, {$set: {steps: step}});
    }
})