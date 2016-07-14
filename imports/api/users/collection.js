/**
 * Created by jmartinez on 7/14/2016.
 */
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { collection2 } from 'meteor/aldeed:collection2';

Schema = {};

Schema.zoningObj = new SimpleSchema({
    parcel_id: {
        type: String,
        min:1
    }, far: {
        type: Number,
        decimal: true
    }, allowedTypes: {
        type: [String],
        minCount: 1
    }, builtOut: {
        type: Boolean
    }, demolish: {
        type: Boolean
    }, demandAdj: {
        type: Boolean
    }
});

Schema.scenario = new SimpleSchema({
    zoning: {
        type: [Schema.zoningObj],
        optional: true
    }, name: {
        type: String,
        min: 1,
        max: 50
    }
});

Schema.profile = new SimpleSchema({
    firstName: {
        type: String,
        min: 1,
        max: 50
    }, lastName: {
        type: String,
        min: 1,
        max: 50
    }, organization: {
        type: String,
        min: 1,
        max: 50
    }, scenarios: {
        type: [Schema.scenario],
        optional: true
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
        type: Schema.profile
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


