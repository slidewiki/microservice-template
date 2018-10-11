/*
Handles the requests by executing stuff and replying to the client. Uses promises to get stuff done.
*/
/* eslint promise/always-return: "off" */

'use strict';

const boom = require('boom'), //Boom gives us some predefined http codes and proper responses
  slideDB = require('../database/slideDatabase'), //Database functions specific for slides
  co = require('../common');

module.exports = {
  //Get slide from database or return NOT FOUND
  getSlide: async function(request) {
    try {
      let slide = await slideDB.get(encodeURIComponent(request.params.id));
      if (co.isEmpty(slide))
        return boom.notFound();
      else
        return co.rewriteID(slide);
    } catch(error) {
      request.log('error', error);
      return boom.badImplementation();
    }
  },

  //Create Slide with new id and payload or return INTERNAL_SERVER_ERROR
  newSlide: async function(request) {
    try{
      let inserted = await slideDB.insert(request.payload);
      if (co.isEmpty(inserted.ops[0]))
        throw inserted;
      else
        return co.rewriteID(inserted.ops[0]);
    } catch(error) {
      request.log('error', error);
      return boom.badImplementation();
    }
  },

  //Update Slide with id id and payload or return INTERNAL_SERVER_ERROR
  replaceSlide: async function(request) {
    try {
      let replaced = await slideDB.replace(encodeURIComponent(request.params.id), request.payload);
      if (co.isEmpty(replaced.value))
        throw replaced;
      else
        return replaced.value;
    } catch (error) {
      request.log('error', error);
      return boom.badImplementation();
    }
  },
};
