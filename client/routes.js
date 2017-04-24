/**
 * Created by kenta on 4/22/17.
 */

FlowRouter.route("/", {
    action: function (params) {
        BlazeLayout.render("main", {content: "tickets"});
    }
})

FlowRouter.route("/details/:ticket", {
    action: function (params) {
        BlazeLayout.render("main", {content: "details"});
    }
})

FlowRouter.route("/analytics/:ticket", {
    action: function () {
        BlazeLayout.render("main", {content: "analytics"});
    }
})