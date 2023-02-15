const Responses = require("./apiResponses")

describe("All repsonses have header, statusCode and body", () => {
  test("200 response is correctly formatted", () => {
    const body = {
      message: "Body here",
    }
    const response = Responses._200(body)

    expect(response.headers["Content-Type"]).toBe("application/json")
    expect(response.headers["Access-Control-Allow-Methods"]).toBe("*")
    expect(response.headers["Access-Control-Allow-Origin"]).toBe("*")

    expect(response.statusCode).toBe(200)

    expect(response.body).toEqual(JSON.stringify(body))
  })

  test("201 response is correctly formatted", () => {
    const body = {
      message: "Body here",
    }
    const response = Responses._201(body)

    expect(response.headers["Content-Type"]).toBe("application/json")
    expect(response.headers["Access-Control-Allow-Methods"]).toBe("*")
    expect(response.headers["Access-Control-Allow-Origin"]).toBe("*")

    expect(response.statusCode).toBe(201)

    expect(response.body).toEqual(JSON.stringify(body))
  })

  test("204 response is correctly formatted", () => {
    const body = {
      message: "Body here",
    }
    const response = Responses._204(body)

    expect(response.headers["Content-Type"]).toBe("application/json")
    expect(response.headers["Access-Control-Allow-Methods"]).toBe("*")
    expect(response.headers["Access-Control-Allow-Origin"]).toBe("*")

    expect(response.statusCode).toBe(204)

    expect(response.body).toEqual(JSON.stringify(body))
  })

  test("400 response is correctly formatted", () => {
    const body = {
      message: "Body here",
    }
    const response = Responses._400(body)

    expect(response.headers["Content-Type"]).toBe("application/json")
    expect(response.headers["Access-Control-Allow-Methods"]).toBe("*")
    expect(response.headers["Access-Control-Allow-Origin"]).toBe("*")

    expect(response.statusCode).toBe(400)

    expect(response.body).toEqual(JSON.stringify(body))
  })

  test("401 response is correctly formatted", () => {
    const body = {
      message: "Body here",
    }
    const response = Responses._401(body)

    expect(response.headers["Content-Type"]).toBe("application/json")
    expect(response.headers["Access-Control-Allow-Methods"]).toBe("*")
    expect(response.headers["Access-Control-Allow-Origin"]).toBe("*")

    expect(response.statusCode).toBe(401)

    expect(response.body).toEqual(JSON.stringify(body))
  })

  test("403 response is correctly formatted", () => {
    const body = {
      message: "Body here",
    }
    const response = Responses._403(body)

    expect(response.headers["Content-Type"]).toBe("application/json")
    expect(response.headers["Access-Control-Allow-Methods"]).toBe("*")
    expect(response.headers["Access-Control-Allow-Origin"]).toBe("*")

    expect(response.statusCode).toBe(403)

    expect(response.body).toEqual(JSON.stringify(body))
  })

  test("404 response is correctly formatted", () => {
    const body = {
      message: "Body here",
    }
    const response = Responses._404(body)

    expect(response.headers["Content-Type"]).toBe("application/json")
    expect(response.headers["Access-Control-Allow-Methods"]).toBe("*")
    expect(response.headers["Access-Control-Allow-Origin"]).toBe("*")

    expect(response.statusCode).toBe(404)

    expect(response.body).toEqual(JSON.stringify(body))
  })

  test("500 response is correctly formatted", () => {
    const body = {
      message: "Body here",
    }
    const response = Responses._500(body)

    expect(response.headers["Content-Type"]).toBe("application/json")
    expect(response.headers["Access-Control-Allow-Methods"]).toBe("*")
    expect(response.headers["Access-Control-Allow-Origin"]).toBe("*")

    expect(response.statusCode).toBe(500)

    expect(response.body).toEqual(JSON.stringify(body))
  })
})
