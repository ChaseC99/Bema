/** Handlers for GETTING results **/

const {
    handleNext,
    successMsg
} = require(process.cwd() + "/util/functions");
const db = require(process.cwd() + "/util/db");

exports.get = (request, response, next) => {
    let contest_id = request.query.contestId;
    let entriesPerLevel, entriesByAvgScore, entryCount, evaluationsPerEvaluator, winners;

    // Load common data for either logged in or logged out users.
    return db.query("SELECT COUNT(*) FROM entry WHERE contest_id = $1", [contest_id], res => {
        if (res.error) {
            return handleNext(next, 400, "There was a problem getting the entry count");
        }
        entryCount = res.rows[0].count;
        return db.query("SELECT entry_id, entry_title, entry_author, entry_url, contest_id, is_winner, entry_level FROM entry WHERE contest_id = $1 AND is_winner = true ORDER BY entry_level", [contest_id], res => {
            if (res.error) {
                return handleNext(next, 400, "There was a problem getting the winners");
            }
            winners = res.rows;

            // Private data that we don't want public.
            if (request.decodedToken) {
                return db.query("SELECT entry_level, COUNT(*) FROM entry WHERE contest_id = $1 AND disqualified = false GROUP BY entry_level ORDER BY entry_level", [contest_id], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem getting the evaluations per level");
                    }
                    entriesPerLevel = res.rows;
                    return db.query(`SELECT REPLACE(z.entry_title,'"','') AS title, z.entry_id, z.entry_author, z.entry_url, z.entry_level, COUNT(z.entry_title) as evaluations, MIN(CASE x.evaluation_level WHEN 'Beginner' THEN 0 WHEN 'Intermediate' THEN 1 ELSE 2 END) as min_level_numeric, CASE MIN(CASE x.evaluation_level WHEN 'Beginner' THEN 0 WHEN 'Intermediate' THEN 1 ELSE 2 END) WHEN 0 THEN 'Beginner' WHEN 1 THEN 'Intermediate' ELSE 'Advanced' END as min_level, CASE MAX(CASE x.evaluation_level WHEN 'Beginner' THEN 0 WHEN 'Intermediate' THEN 1 ELSE 2 END) WHEN 0 THEN 'Beginner' WHEN 1 THEN 'Intermediate' ELSE 'Advanced' END as max_level, AVG(x.creativity + x.complexity + x.execution + x.interpretation) as avg_score, MIN(x.creativity + x.complexity + x.execution + x.interpretation) as min_score, MAX(x.creativity + x.complexity + x.execution + x.interpretation) as max_score FROM evaluation x INNER JOIN evaluator y ON y.evaluator_id = x.evaluator_id INNER JOIN entry z ON z.entry_id = x.entry_id WHERE x.evaluation_complete AND z.contest_id = $1 AND z.flagged = false AND z.disqualified = false GROUP BY (z.entry_title, z.entry_id, z.entry_author, z.entry_url, z.entry_level) ORDER BY z.entry_level ASC, avg_score DESC;`, [contest_id], res => {
                        if (res.error) {
                            return handleNext(next, 400, "There was a problem getting the entries by average score");
                        }
                        entriesByAvgScore = res.rows;
                        return db.query("SELECT y.evaluator_name, COUNT(x.entry_id) FROM evaluation x INNER JOIN evaluator y ON y.evaluator_id = x.evaluator_id INNER JOIN entry z ON z.entry_id = x.entry_id WHERE x.evaluation_complete = true AND z.contest_id = $1 GROUP BY (y.evaluator_name) ORDER BY count DESC;", [contest_id], res => {
                            if (res.error) {
                                return handleNext(next, 400, "There was a problem getting the evaluations per evaluator");
                            }
                            evaluationsPerEvaluator = res.rows;
                            return response.json({
                                logged_in: true,
                                is_admin: request.decodedToken.is_admin,
                                contest_id,
                                results: {
                                    entriesPerLevel,
                                    entriesByAvgScore,
                                    entryCount,
                                    evaluationsPerEvaluator,
                                    winners
                                }
                            });
                        });
                    });
                });
            }

            // Return data fine for public presentation.
            return db.query(`SELECT REPLACE(z.entry_title,'"','') AS title, z.entry_id, z.entry_author, z.entry_url FROM evaluation x INNER JOIN evaluator y ON y.evaluator_id = x.evaluator_id INNER JOIN entry z ON z.entry_id = x.entry_id WHERE x.evaluation_complete AND z.contest_id = $1 GROUP BY (z.entry_title, z.entry_id, z.entry_author, z.entry_url);`, [contest_id], res => {
                if (res.error) {
                    return handleNext(next, 400, "There was a problem getting the entries for public presentation");
                }
                entriesByAvgScore = res.rows;

                // Preferably this pulls every current Councilor from the DB.
                evaluationsPerEvaluator = [
                    { evaluator_name: 'Evaluator 1', count: '?' },
                    { evaluator_name: 'Evaluator 2', count: '?' },
                    { evaluator_name: 'Evaluator 3', count: '?' },
                    { evaluator_name: 'Evaluator 4', count: '?' },
                    { evaluator_name: 'Evaluator 5', count: '?' }
                ];
                entriesPerLevel = [
                    { entry_level: 'Beginner', count: '?' },
                    { entry_level: 'Intermediate', count: '?' },
                    { entry_level: 'Advanced', count: '?' }
                ];
                return response.json({
                    logged_in: false,
                    is_admin: false,
                    contest_id,
                    results: {
                        entriesPerLevel,
                        entriesByAvgScore,
                        entryCount,
                        evaluationsPerEvaluator,
                        winners
                    }
                });
            });
        });
    });
};

module.exports = exports;
