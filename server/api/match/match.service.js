'use strict';

import Match from './match.model';

export function findMatchById(matchId) {
  return Match.findOne({_id: matchId});
}
