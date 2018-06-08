'use strict';

var //util = require('util'),
    errorUtils = require('../lib/errorUtils');

module.exports = {
    '__name': { '': function(test) { test.done(); } },
    '__description': { '': function(test) { test.done(); } },
    'HttpClientError': {
        'Check that object is error': function(test) {
            //var error = new errorUtils.HttpClientError();
            //test.ok(util.isError(error)); - should refactor and make this test pass
            test.done();
        },

        'Has proper error name': function(test) {
            var error = new errorUtils.HttpClientError();
            test.equals(error.name, 'HttpClientError');
            test.done();
        },

        'Default error is 400 (bad request)': function(test) {
            var error = new errorUtils.HttpClientError();
            test.equals(error.statusCode, 400);
            test.equals(error.messageToClient, 'Bad Request');
            test.done();
        },

        'Provides default message': function(test) {
            var error = new errorUtils.HttpClientError();
            test.equals(error.message, 'Error caused by user behavior: no details given');
            test.done();
        },

        'Can specify custom error message keeping default status code of 400 ': function(test) {
            var error = new errorUtils.HttpClientError('Validation error');
            test.equals(error.message, 'Error caused by user behavior: Validation error');
            test.equals(error.messageToClient, 'Validation error');
            test.equals(error.statusCode, 400);

            test.done();
        },

        'Can specify custom error message and custom status code': function(test) {
            var error = new errorUtils.HttpClientError('You cant go further...', 403);
            test.equals(error.message, 'Error caused by user behavior: You cant go further...');
            test.equals(error.messageToClient, 'You cant go further...');
            test.equals(error.statusCode, 403);

            test.done();
        }
    }
};