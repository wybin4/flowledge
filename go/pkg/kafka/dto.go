package kafka

type RequestMessage struct {
	CorrelationID string      `json:"correlationId"`
	Service       string      `json:"service"`
	Endpoint      string      `json:"endpoint"`
	Payload       interface{} `json:"payload"`
}

type ResponseMessage struct {
	CorrelationID string      `json:"correlationId"`
	Status        int         `json:"status"`
	Data          interface{} `json:"data"`
}
