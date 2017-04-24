import {Template} from "meteor/templating";

import "bulma/css/bulma.css";
import swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.css"

Template.details.viewmodel({
    ticket: null,
    flightInfo: null,
    departInfo: null,
    geocodedAirport: null,
    geocodedDestination: null,
    destinationAddress: "JW Marriott Marquis Miami",
    ubers: [],
    uberLoading: '',
    chosenUbers: "",
    onCreated: function () {
        let ticket = Tickets.findOne({_id: FlowRouter.getParam("ticket")});
        if (ticket) {
            this.ticket(ticket);
            Meteor.call("flight.status", ticket.airport, ticket.airline, ticket.flightNum, ticket.operationDate, (err, data) => {
                if (!err && data && data.flightRecord[0]) {
                    this.flightInfo(data);
                    this.departInfo(data.flightRecord[0]);
                }
            })
        }
    },
    parseDate: function (date) {
        return moment(date).format("dddd, MMMM Do YYYY, h:mm:ss a");
    },
    parseDuration: function(duration) {
        return duration / 60;
    },
    findUbers: function () {
        this.uberLoading('is-loading');
        Meteor.call("geocode", `${this.ticket().airport} airport`, "airport", (err, res) => {
            if (!err) {

                Meteor.call("geocode", this.destinationAddress(), (err2, res2) => {
                    if (!err2) {
                        this.geocodedAirport(res);
                        this.geocodedDestination(res2);

                        const {lat: slat, lng: slng} = res.geometry.location;
                        const {lat: elat, lng: elng} = res2.geometry.location;
                        Meteor.call("uber.prices", slat, slng, elat, elng, (err, res) => {
                            if (!err) {
                                this.ubers(res.prices);
                                this.uberLoading('');
                            }
                        });
                    }
                });
            }
        })
    },
    releaseWorries: function() {
        const {lat: slat, lng: slng} = this.geocodedAirport().geometry.location;
        const {lat: elat, lng: elng} = this.geocodedDestination().geometry.location;
        const ride = {
            start: {address: this.geocodedAirport().formatted_address, lat: slat, lng: slng},
            end: {address: this.geocodedDestination().formatted_address, lat: elat, lng: elng},
            ride: _.filter(this.ubers(), uber => {
                return uber.display_name === this.chosenUbers().trim()
            })[0],
            flight: this.flightInfo()
        }

        swal({
            title: "Hold up!",
            type: "warning",
            text: "Do you hold an US visa?",
            showCancelButton: true,
            confirmButtonText: "Yes",
            cancelButtonText: "No"
        }).then((confirm) => {
            ride['citizen'] = true;
            Meteor.call('rides.add', this.ticket()._id, ride, (err, res) => {
                swal({
                    title: "Enjoy!",
                    type: "success",
                    text: "We'll make sure your Uber grabs you ASAP straight from the airport :)."
                }).then(() => {
                    FlowRouter.go(`/analytics/${FlowRouter.getParam("ticket")}`);
                });
            });
        }, (cancel) => {
            ride['citizen'] = false;
            Meteor.call('rides.add', this.ticket()._id, ride, (err, res) => {
                swal({
                    title: "Enjoy!",
                    type: "success",
                    text: "We'll make sure your Uber grabs you ASAP straight from the airport :)."
                }).then(() => {
                    FlowRouter.go(`/analytics/${FlowRouter.getParam("ticket")}`);
                });
            });
        })
    }
})