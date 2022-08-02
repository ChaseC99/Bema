package util

import "fmt"

func ParseString(value interface{}) *string {
	str := fmt.Sprintf("%v", value)

	if str == "<nil>" {
		return nil
	} else {
		return &str
	}
}
