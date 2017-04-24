/**
 * Created by kenta on 4/23/17.
 */

Meteor.publish('tickets.all', function() {
    return Tickets.find();
})