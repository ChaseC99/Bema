package util

func ScoreIsValid(score float64) bool {
	if score == 0 || score == 0.5 || score == 1 || score == 1.5 || score == 2 || score == 2.5 || score == 3 || score == 3.5 || score == 4 || score == 4.5 || score == 5 {
		return true
	}
	return false
}
