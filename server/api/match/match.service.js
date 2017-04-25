'use strict';

import Match from './match.model';

export function findById(matchId) {
  return Match.findOne({_id: matchId}).populate("priceSchema");
}

export function getMatches() {
  return Match.find({
    $or: [
          {date: {$gt: Date.now()}},
          {date: null}
          ]
    })
    .populate("priceSchema")
    .sort({round: 1});
}

export function createMatch(newMatch) {

  let match = new Match({
    rival: newMatch.rival,
    info: newMatch.info,
    poster: newMatch.poster,
    priceSchema: newMatch.priceSchema.id
  });
  return match.save();
}

export function removeById(matchId) {
  return Match.findByIdAndRemove(matchId).exec();
}

export function updateMatch(match, modifiedMatch) {
  match.round = modifiedMatch.round;
  match.rival = modifiedMatch.rival;
  match.date = modifiedMatch.date;
  match.poster = modifiedMatch.poster;
  match.info = modifiedMatch.info;
  match.priceSchema = modifiedMatch.priceSchema.id;

  return match.save();
}

export function addDateToMatch(match, matchDate) {
  match.date = matchDate;

  return match.save();
}
