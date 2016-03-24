/**
 * Created by jmartinez on 2/16/2016.
 */
Schema = {};
zoneData = new Mongo.Collection('zoneData');
fields = new Mongo.Collection('fields');

Schema.UserProfile = new SimpleSchema({
    firstName:{
        type: String
    },
    lastName: {
        type: String
    },
    organization: {
        type: String
    }

});

Schema.User = new SimpleSchema({
    username: {
        type: String,
        optional: true
    }, emails: {
        type: Array,
        optional: true
    }, "emails.$": {
        type: Object
    }, "emails.$.address": {
        type: String,
        regEx: SimpleSchema.RegEx.Email
    }, "emails.$.verified": {
        type: Boolean
    }, createdAt: {
        type: Date
    }, profile: {
        type: Schema.UserProfile
    }, services: {
        type: Object,
        optional: true,
        blackbox: true
    }, roles: {
        type: [String],
        optional: true
    }, heartbeat:{
        type: Date,
        optional: true
    }
});

Meteor.users.attachSchema(Schema.User);
