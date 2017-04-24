/**
 * Created by kenta on 4/23/17.
 */

Template.tickets.viewmodel({
    tickets: [],
    onCreated() {
        Meteor.subscribe('tickets.all');
    },
    autorun() {
        this.tickets(_.sortBy(Tickets.find({}).fetch(), ticket => -ticket.createdAt));
    },
    parseDate: function (date) {
        return moment(date).format("dddd, MMMM Do YYYY, h:mm:ss a");
    },
    selectTicket(flight) {
        FlowRouter.go(`/details/${flight._id}`)
    }
})