import https from 'https';

export const handler = (event) => {
    return new Promise((resolve, reject) => {
        console.log('Request', JSON.stringify(event));
        const token = event?.directive?.endpoint?.scope?.token ?? event?.directive?.payload?.grantee?.token ?? event?.directive?.payload?.grantee?.scope ?? process.env.AHC_HOMEASSISTANT_TOKEN;

        const request = https.request(
            {
                hostname:           process.env.AHC_HOMEASSISTANT_HOST,
                path:               '/api/alexa/smart_home',
                port:               process.env.AHC_HOMEASSISTANT_PORT ?? 443,
                method:             'POST',
                rejectUnauthorized: false,
                family:             6,
                headers:            {
                    'Content-Type':  'application/json',
                    'Authorization': `Bearer ${token}`
                }
            },
            (response) => {
                let body = '';
                response.setEncoding('utf8');
                response.on('data', (chunk) => body += chunk);
                response.on('end', () => {
                    body = JSON.parse(body);
                    console.log('Response', JSON.stringify({
                        isBase64Encoded: false,
                        statusCode:      response.statusCode || 500,
                        headers:         response.headers,
                        body,
                    }));
                    if (response.status >= 400) {
                        return reject({
                            event: {
                                payload: {
                                    type:    [401, 403].includes(response.status) ? 'INVALID_AUTHORIZATION_CREDENTIAL' : 'INTERNAL_ERROR',
                                    message: body
                                }
                            }
                        });
                    }

                    resolve(body);
                });
            }
        );
        request.write(JSON.stringify(event));
        request.end();
    });
};
