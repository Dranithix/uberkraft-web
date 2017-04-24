/**
 * Created by kenta on 4/23/17.
 */
import swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.css"
import ProgressBar from "progressbar.js";


let walkStage, securityStage, uberStage;
let accumulator = 0, ignoreAnimation = true, showModal = true, finalAnimate = true;

Template.analytics.viewmodel({
    ticket: {},
    flightDetails: {},
    time: 0,
    currentUberDistances: [],
    currentUberPrices: [],
    lastUpdated: Date.now(),
    maxWalkLimit: 20,
    onCreated() {
        this.ticket(Tickets.findOne({_id: FlowRouter.getParam("ticket")}));
        if (!this.ticket() || !this.ticket().ride) {
            swal({
                title: "Hold up!",
                type: "warning",
                text: "This ticket has not been analyzed by our system yet! Make sure to book an Uber first."
            }).then(() => FlowRouter.go("/"), (cancel) => FlowRouter.go("/"));
            return;
        }
        console.log(this.ticket());

        Meteor.setInterval(() => {
            this.time(Date.now());
        }, 1000);

        Meteor.call('uber.times', this.ticket().start.lat, this.ticket().start.lng, (err, rrr) => {
            if (!err) {
                Meteor.call('uber.prices', this.ticket().start.lat, this.ticket().start.lng, this.ticket().end.lat, this.ticket().end.lng, (err, res) => {
                    if (!err) {
                        this.currentUberDistances(rrr.times);
                        this.currentUberPrices(res.prices);
                        this.lastUpdated(Date.now());
                    }
                })

            }
        });

        Meteor.setInterval(() => {
            Meteor.call('uber.times', this.ticket().start.lat, this.ticket().start.lng, (err, rrr) => {
                if (!err) {
                    Meteor.call('uber.prices', this.ticket().start.lat, this.ticket().start.lng, this.ticket().end.lat, this.ticket().end.lng, (err, res) => {
                        if (!err) {
                            this.currentUberDistances(rrr.times);
                            this.currentUberPrices(res.prices);
                            this.lastUpdated(Date.now());
                        }
                    })

                }
            });
        }, 30000)
    },
    onRendered() {
        walkStage = new ProgressBar.Line('#walkStage', {
            strokeWidth: 4,
            easing: 'easeInOut',
            duration: 1400,
            color: 'white',
            trailColor: '#FFEA82',
            trailWidth: 4,
            svgStyle: {width: '100%', height: '100%'},
            text: {
                style: {
                    // Text color.
                    // Default: same as stroke color (options.color)
                    color: '#999',
                    position: 'relative',
                    right: '0',
                    top: '10px',
                    padding: 0,
                    margin: 0,
                    transform: null
                },
                autoStyleContainer: false
            },
            from: {color: '#FFEA82'},
            to: {color: '#ED6A5A'},
            step: (state, bar) => {
                bar.setText((50 - Math.round(bar.value() * 50)) + ' %');
            }
        });
        walkStage.set(0);

        securityStage = new ProgressBar.Line('#securityStage', {
            strokeWidth: 4,
            easing: 'easeInOut',
            duration: 1400,
            color: 'white',
            trailColor: '#FFEA82',
            trailWidth: 4,
            svgStyle: {width: '100%', height: '100%'},
            text: {
                style: {
                    // Text color.
                    // Default: same as stroke color (options.color)
                    color: '#999',
                    position: 'relative',
                    right: '0',
                    top: '10px',
                    padding: 0,
                    margin: 0,
                    transform: null
                },
                autoStyleContainer: false
            },
            from: {color: '#ED6A5A'},
            to: {color: '#ED6A5A'},
            step: (state, bar) => {
                bar.setText((50 - Math.round(bar.value() * 50)) + ' %');
            }
        });
        securityStage.set(0);

        uberStage = new ProgressBar.Line('#uberStage', {
            strokeWidth: 4,
            easing: 'easeInOut',
            duration: 1400,
            trailColor: '#ED6A5A',
            trailWidth: 4,
            svgStyle: {width: '100%', height: '100%'},
            text: {
                style: {
                    // Text color.
                    // Default: same as stroke color (options.color)
                    color: '#999',
                    position: 'relative',
                    right: '0',
                    top: '10px',
                    padding: 0,
                    margin: 0,
                    transform: null
                },
                autoStyleContainer: false
            },
            from: {color: '#ED6A5A'},
            to: {color: '#ED6A5A'},
            step: (state, bar) => {
                bar.setText((100 - Math.round(bar.value() * 100)) + ' %');
            }
        });
        uberStage.set(0.25);
    },
    parseDate: function (date) {
        return moment(date).format("dddd, MMMM Do YYYY, h:mm:ss a");
    },
    parseDuration: function (duration) {
        return duration / 60;
    },
    uberLastUpdated: function () {
        return moment(this.time()).diff(this.lastUpdated(), 'seconds') + " seconds ago";
    },
    autorun() {
        this.ticket(Tickets.findOne({_id: FlowRouter.getParam("ticket")}));
        if (this.ticket()) {
            this.flightDetails(this.ticket().flight.flightRecord[0]);
            if (walkStage) {
                walkStage.animate(Math.min(1.0, (20 - (this.maxWalkLimit() - this.ticket().steps)) / 20));

                if (walkStage.value() >= 0.5) {
                    uberStage.animate(0.25 + ((walkStage.value() - .5) / 0.5) * 0.25);
                }

                console.log(walkStage.value(), uberStage.value())

                if (walkStage.value() >= 0.7 && walkStage.value() <= 0.9 && finalAnimate) {
                    finalAnimate = false;
                    let accelerate = Meteor.setInterval(() => {
                        securityStage.animate(Math.min(1, accumulator += 0.2));
                        uberStage.animate(securityStage.value());

                        if (uberStage.value() >= 0.5 && uberStage.value() <= 0.7) {
                            if (showModal) {
                                swal("Good news!", "Your Uber is now on the way; the license plate is TX9324 and his phone number is +1-202-555-0102.", "success")
                                showModal = false;
                            }
                        }
                        console.log(walkStage.value(), uberStage.value())
                    }, 250);

                    Meteor.setTimeout(() => {
                        Meteor.clearInterval(accelerate)
                    }, 30000);
                }
                // if (walkStage.value() == 0 && uberStage.value() <= 0.5 && !ignoreAnimation) {

                // }
            }
        }
    },
    resetSteps: function () {
        this.maxWalkLimit(this.ticket().steps + 20);
        ignoreAnimation = true;
        showModal = true;

    }
})