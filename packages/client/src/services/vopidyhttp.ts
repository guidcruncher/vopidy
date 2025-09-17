const randomInt = (max: number = 65535) => {
  const min = Math.ceil(1)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export const vopidyhttp = async (method: string, params: any) => {
  const id = randomInt()
  const payload = { jsonrpc: '2.0', id: id, method: method, params: params }
  const url = `${window.location.protocol}//${window.location.host}/api/rpc`
  let json = {}
  let res = {}

  try {
    res = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-type': 'application/json',
      },
    })

    let json = {}
    if (!res.ok) {
      let text = ((await res.text()) ?? '').trim()
      if (text == '') {
        text = res.statusText
      }
      json = { ok: false, statusCode: res.statusCode, statusText: res.statusText, message: text }
      console.error(json)
      return json
    }
  } catch (e) {
    if (!(e instanceof Error)) {
      e = new Error(e)
    }
    json = { ok: false, statusCode: 500, statusText: e.name, message: e.message }
    console.error(e)
    return json
  }

  const result = await res.json()

  if (result.error) {
    json = {
      ok: false,
      statusCode: result.error.code,
      statusText: result.error.message,
      message: result.error.message,
    }
    return json
  }

  json = { ok: true, result: result.result }
  return json
}
