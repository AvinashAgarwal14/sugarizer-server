// include libraries
var request = require('request'),
	moment = require('moment'),
	common = require('../helper/common');

// main landing page
exports.index = function(req, res) {

	// call
	getUsers(req, res, function(users) {

		//get data
		getJournalEntries(req, res, users[0], function(entries) {

			var data = {
				module: 'journals',
				moment: moment,
				entries: entries,
				users: users,
				account: req.session.user
			};

			// send to activities page
			res.render('journal', data);
		})
	});
};

function getJournalEntries(req, res, user, callback) {

	//var
	var entries = {};

	// call
	request({
		headers: common.getHeaders(req),
		json: true,
		method: 'GET',
		qs: {},
		uri: common.getAPIUrl(req) + 'api/v1/journal/' + user.private_journal
	}, function(error, response, body) {
		if (response.statusCode == 200) {

			//store
			entries['private'] = body;

			//get shared entries
			request({
				headers: common.getHeaders(req),
				json: true,
				method: 'GET',
				qs: {},
				uri: common.getAPIUrl(req) + 'api/v1/journal/' + user.shared_journal
			}, function(error, response, body) {
				if (response.statusCode == 200) {

					//store
					entries['shared'] = body;

					//return
					callback(entries);

				} else {
					req.flash('errors', {
						msg: body.message
					});
				}
			})
		} else {
			req.flash('errors', {
				msg: body.message
			});
		}
	})
}

function getUsers(req, res, callback) {
	// call
	request({
		headers: common.getHeaders(req),
		json: true,
		method: 'GET',
		qs: {
			sort: '+name',
			role: 'student'
		},
		uri: common.getAPIUrl(req) + 'api/v1/users'
	}, function(error, response, body) {
		if (response.statusCode == 200) {

			callback(body.users);
		} else {
			req.flash('errors', {
				msg: body.message
			});
		}
	})
}
