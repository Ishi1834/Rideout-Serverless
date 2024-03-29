const APIGatewayRequest = ({
  body,
  headers,
  method,
  path = "",
  queryStringObject,
  pathParametersObject,
  stageVariables = null,
}) => {
  const request = {
    body: body ? JSON.stringify(body) : null,
    headers: headers
      ? { ...headers, host: "localhost:3000" }
      : {
        host: "localhost:3000",
      },
    multiValueHeaders: {},
    httpMethod: method,
    isBase64Encoded: false,
    path,
    pathParameters: pathParametersObject || null,
    queryStringParameters: queryStringObject || null,
    multiValueQueryStringParameters: null,
    stageVariables,
    requestContext: {
      accountId: "",
      apiId: "",
      httpMethod: method,
      identity: {
        accessKey: "",
        accountId: "",
        apiKey: "",
        apiKeyId: "",
        caller: "",
        cognitoAuthenticationProvider: "",
        cognitoAuthenticationType: "",
        cognitoIdentityId: "",
        cognitoIdentityPoolId: "",
        principalOrgId: "",
        sourceIp: "",
        user: "",
        userAgent: "",
        userArn: "",
      },
      path,
      stage: "",
      requestId: "",
      requestTimeEpoch: 3,
      resourceId: "",
      resourcePath: "",
    },
    resource: "",
  }
  return request
}

module.exports = APIGatewayRequest
